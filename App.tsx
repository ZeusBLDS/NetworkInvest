
import React, { useState, useEffect } from 'react';
import { AppView, User, Notification, DepositRequest, WithdrawRequest } from './types';
import { PLANS, APP_CONFIG } from './constants';
import { supabase } from './supabase';
import Login from './views/Auth/Login';
import Register from './views/Auth/Register';
import Home from './views/Dashboard/Home';
import PlanList from './views/Plans/PlanList';
import NetworkView from './views/Network/Network';
import Account from './views/Account/Account';
import AdminPanel from './views/Admin/AdminPanel';
import Layout from './components/Layout';
import WelcomeModal from './components/WelcomeModal';
import VipZeroModal from './components/VipZeroModal';
import WithdrawModal from './components/WithdrawModal';
import DepositModal from './components/DepositModal';
import LuckyWheelModal from './components/LuckyWheelModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customWallet, setCustomWallet] = useState(APP_CONFIG.DEPOSIT_WALLET);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [myDeposits, setMyDeposits] = useState<DepositRequest[]>([]);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showVipZero, setShowVipZero] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const mapUserFromDB = (u: any): User => ({
    id: u.id,
    name: u.name || 'Usuário',
    email: u.email || '',
    phone: u.phone || '',
    referralCode: u.referral_code || '',
    referredBy: u.referred_by || '',
    balance: parseFloat(u.balance || 0),
    walletAddress: u.wallet_address || '',
    activePlanId: u.active_plan_id || 'vip0',
    joinDate: new Date(u.created_at).getTime(),
    checkInStreak: u.check_in_streak || 0,
    isFirstLogin: u.is_first_login ?? false,
    role: u.role || 'USER',
    status: u.status || 'ACTIVE',
    totalInvested: parseFloat(u.total_invested || 0),
    totalWithdrawn: parseFloat(u.total_withdrawn || 0),
    lastCheckIn: u.last_check_in ? new Date(u.last_check_in).getTime() : undefined,
    lastWheelSpin: u.last_wheel_spin ? new Date(u.last_wheel_spin).getTime() : undefined
  });

  const fetchAdminData = async () => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: deps } = await supabase.from('deposits').select('*').order('created_at', { ascending: false });
      const { data: withs } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      
      if (profiles) setAllUsers(profiles.map(mapUserFromDB));
      if (deps) setDeposits(deps.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
        status: req.status, timestamp: new Date(req.created_at).getTime(), method: 'USDT'
      })));
      if (withs) setWithdrawals(withs.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), wallet: req.wallet, fee: parseFloat(req.fee || 0),
        status: req.status, timestamp: new Date(req.created_at).getTime()
      })));
    } catch (e) {
      console.error("Erro ao carregar dados administrativos:", e);
    }
  };

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    try {
      // Usamos uma query simples para evitar disparar políticas complexas inicialmente
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Erro no fetchUserProfile:", error.message);
        // Se for erro de recursividade, avisamos o console
        if (error.message.includes('recursion')) {
          console.error("DICA: Rode o script SQL de correção de recursividade no Supabase!");
        }
        setLoading(false);
        return;
      }

      if (data) {
        const user = mapUserFromDB(data);
        setCurrentUser(user);
        
        // Carrega dados paralelos
        const { data: deps } = await supabase.from('deposits').select('*').eq('user_id', userId);
        if (deps) setMyDeposits(deps.map((req: any) => ({
          id: req.id, userId: req.user_id, userName: req.user_name,
          amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
          status: req.status, timestamp: new Date(req.created_at).getTime(), method: 'USDT'
        })));

        if (user.role === 'ADMIN') await fetchAdminData();
        
        if (user.isFirstLogin) {
          setShowWelcome(true);
          setShowVipZero(true);
          await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        }
        
        if (currentView === AppView.LOGIN || currentView === AppView.REGISTER) {
          setCurrentView(AppView.HOME);
        }
        setLoading(false);
      } else if (retryCount < 5) {
        // Tenta novamente caso o trigger de criação do perfil tenha demorado
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 2000);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error("Exceção fatal ao buscar perfil:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setLoading(true);
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    const { data } = await supabase.from('profiles').select('balance').eq('id', id).single();
    if (data) {
      const newBalance = (parseFloat(data.balance) || 0) + amount;
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', id);
      if (id === currentUser?.id) fetchUserProfile(id);
    }
  };

  const performCheckIn = async () => {
    if (!currentUser) return;
    const now = new Date();
    if (currentUser.lastCheckIn && new Date(currentUser.lastCheckIn).toDateString() === now.toDateString()) {
      alert('Você já realizou o check-in hoje!');
      return;
    }
    const reward = (currentUser.checkInStreak + 1) * 0.01;
    await supabase.from('profiles').update({ 
      balance: currentUser.balance + reward, 
      last_check_in: now.toISOString(), 
      check_in_streak: currentUser.checkInStreak + 1 
    }).eq('id', currentUser.id);
    
    fetchUserProfile(currentUser.id);
    return reward;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest animate-pulse">Autenticando na Rede...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) {
      if (currentView === AppView.REGISTER) return <Register onSwitch={() => setCurrentView(AppView.LOGIN)} onRegister={() => {}} />;
      return <Login onSwitch={() => setCurrentView(AppView.REGISTER)} onLogin={() => {}} />;
    }

    switch (currentView) {
      case AppView.HOME:
        return <Home user={currentUser} myDeposits={myDeposits} updateBalance={updateBalance} performCheckIn={performCheckIn} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => { setPendingPlanId(null); setShowDeposit(true); }} onOpenWheel={() => setShowWheel(true)} />;
      case AppView.PLANS:
        return <PlanList user={currentUser} myDeposits={myDeposits} onActivate={(pid) => { setPendingPlanId(pid); setShowDeposit(true); }} />;
      case AppView.NETWORK:
        return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT:
        return <Account user={currentUser} onLogout={() => { supabase.auth.signOut(); }} notifications={[]} onViewChange={setCurrentView} onUpdateUser={async (u) => { await supabase.from('profiles').update({ wallet_address: u.walletAddress }).eq('id', u.id); fetchUserProfile(u.id); }} />;
      case AppView.ADMIN:
        return <AdminPanel 
          users={allUsers} deposits={deposits} withdrawals={withdrawals} onClose={() => setCurrentView(AppView.HOME)} 
          depositWallet={customWallet} onUpdateWallet={setCustomWallet}
          onApproveDeposit={async (id) => {
            const req = deposits.find(d => d.id === id);
            if (!req) return;
            await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id);
            const { data: uDB } = await supabase.from('profiles').select('*').eq('id', req.userId).single();
            if (uDB) {
              const updates: any = { total_invested: (parseFloat(uDB.total_invested) || 0) + req.amount };
              if (req.planId) updates.active_plan_id = req.planId;
              else updates.balance = (parseFloat(uDB.balance) || 0) + req.amount;
              await supabase.from('profiles').update(updates).eq('id', req.userId);
              fetchAdminData();
              alert("Aprovado!");
            }
          }}
          onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }}
          onApproveWithdraw={async (id) => { await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id); fetchAdminData(); }}
          onRejectWithdraw={async (id) => { const req = withdrawals.find(w => w.id === id); if(req) await updateBalance(req.amount, req.userId); await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }}
          onUpdateStatus={async (uid, s) => { await supabase.from('profiles').update({ status: s }).eq('id', uid); fetchAdminData(); }}
          onDeleteUser={async (uid) => { if(confirm("Apagar?")) { await supabase.from('profiles').delete().eq('id', uid); fetchAdminData(); } }}
          onGivePlan={async (uid, pid) => { await supabase.from('profiles').update({ active_plan_id: pid }).eq('id', uid); fetchAdminData(); }}
          onAdjustBalance={async (uid, amt) => { await updateBalance(amt, uid); fetchAdminData(); }}
        />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {currentUser && currentView !== AppView.ADMIN ? <Layout currentView={currentView} onViewChange={setCurrentView}>{renderContent()}</Layout> : renderContent()}
      
      {showDeposit && <DepositModal wallet={customWallet} prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''} onClose={() => setShowDeposit(false)} onConfirm={async (hash) => {
            const plan = PLANS.find(p => p.id === pendingPlanId);
            await supabase.from('deposits').insert({ 
              user_id: currentUser?.id, user_name: currentUser?.name, 
              amount: plan ? plan.investment : 0, 
              hash, plan_id: pendingPlanId, status: 'PENDING' 
            });
            setShowDeposit(false); alert('Comprovante enviado!');
      }} />}
      {showWithdraw && currentUser && <WithdrawModal user={currentUser} onClose={() => setShowWithdraw(false)} onSubmit={async (amt) => {
          await supabase.from('withdrawals').insert({ user_id: currentUser.id, user_name: currentUser.name, amount: amt, wallet: currentUser.walletAddress || '', fee: amt * 0.05, status: 'PENDING' });
          await updateBalance(-amt); setShowWithdraw(false); alert('Saque solicitado!');
      }} />}
      {showWheel && currentUser && <LuckyWheelModal user={currentUser} onClose={() => setShowWheel(false)} onWin={async (prize) => {
          await supabase.from('profiles').update({ balance: currentUser.balance + prize, last_wheel_spin: new Date().toISOString() }).eq('id', currentUser.id);
          fetchUserProfile(currentUser.id);
      }} />}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showVipZero && <VipZeroModal onActivate={() => setShowVipZero(false)} />}
    </div>
  );
};

export default App;

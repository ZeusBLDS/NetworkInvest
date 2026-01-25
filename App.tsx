
import React, { useState, useEffect } from 'react';
import { AppView, User, Notification, DepositRequest, WithdrawRequest } from './types';
import { PLANS, APP_CONFIG, REFERRAL_RATES } from './constants';
import { supabase } from './supabase';
import Login from './views/Auth/Login';
import Register from './views/Auth/Register';
import Home from './views/Dashboard/Home';
import Tasks from './views/Tasks/Tasks';
import PlanList from './views/Plans/PlanList';
import NetworkView from './views/Network/Network';
import Account from './views/Account/Account';
import AdminPanel from './views/Admin/AdminPanel';
import Layout from './components/Layout';
import WelcomeModal from './components/WelcomeModal';
import WithdrawModal from './components/WithdrawModal';
import DepositModal from './components/DepositModal';
import LuckyWheelModal from './components/LuckyWheelModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSession, setAuthSession] = useState<any>(null);
  const [customWallet, setCustomWallet] = useState(APP_CONFIG.DEPOSIT_WALLET);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [myDeposits, setMyDeposits] = useState<DepositRequest[]>([]);

  const [showWelcome, setShowWelcome] = useState(false);
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
    referredBy: u.referred_by || 'Direto',
    balance: parseFloat(u.balance || 0),
    walletAddress: u.wallet_address || '',
    activePlanId: u.active_plan_id || null,
    joinDate: new Date(u.created_at).getTime(),
    lastCheckIn: u.last_check_in ? new Date(u.last_check_in).getTime() : undefined,
    lastWheelSpin: u.last_wheel_spin ? new Date(u.last_wheel_spin).getTime() : undefined,
    checkInStreak: u.check_in_streak || 0,
    isFirstLogin: u.is_first_login ?? false,
    role: u.role || 'USER',
    status: u.status || 'ACTIVE',
    totalInvested: parseFloat(u.total_invested || 0),
    totalWithdrawn: parseFloat(u.total_withdrawn || 0),
    network_earnings: parseFloat(u.network_earnings || 0)
  });

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      let { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      if (!data && !error) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const newRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const { data: insertedData } = await supabase.from('profiles').insert({
            id: user.id, email: user.email, name: user.user_metadata?.name || 'Membro NI',
            referral_code: newRefCode, referred_by: user.user_metadata?.referred_by || 'Direto'
          }).select().single();
          data = insertedData;
        }
      }

      if (data) {
        const user = mapUserFromDB(data);
        setCurrentUser(user);
        const { data: deps } = await supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (deps) setMyDeposits(deps.map((req: any) => ({
          id: req.id, userId: req.user_id, userName: req.user_name,
          amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
          status: req.status, timestamp: new Date(req.created_at).getTime(), method: 'USDT'
        })));
        if (user.role === 'ADMIN') await fetchAdminData();
        if (user.isFirstLogin) {
          setShowWelcome(true);
          await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        }
        if (currentView === AppView.LOGIN || currentView === AppView.REGISTER) setCurrentView(AppView.HOME);
      }
    } catch (e) {
      console.error("Erro perfil:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [{ data: profiles }, { data: deps }, { data: withs }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
      ]);
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
    } catch (e) { console.error('Admin Fetch Error:', e); }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
      if (session) fetchUserProfile(session.user.id);
      else { setCurrentUser(null); setLoading(false); setCurrentView(AppView.LOGIN); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', id).single();
    if (profile) {
      const newBalance = (parseFloat(profile.balance) || 0) + amount;
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', id);
      if (id === currentUser?.id) fetchUserProfile(id);
    }
  };

  const performCheckIn = async () => {
    if (!currentUser) return;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const { data: profile } = await supabase.from('profiles').select('last_check_in, check_in_streak, balance').eq('id', currentUser.id).single();
    if (profile?.last_check_in && new Date(profile.last_check_in).toISOString().split('T')[0] === today) return;
    const reward = 0.01;
    await supabase.from('profiles').update({ 
      balance: (parseFloat(profile?.balance || 0)) + reward,
      last_check_in: now.toISOString(),
      check_in_streak: (profile?.check_in_streak || 0) + 1
    }).eq('id', currentUser.id);
    fetchUserProfile(currentUser.id);
    return reward;
  };

  const handleApproveDeposit = async (id: string) => {
    const dep = deposits.find(d => d.id === id);
    if (!dep) return;
    
    // 1. Aprovar o depósito
    await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id);
    
    if (dep.planId) {
      // 2. Ativar o plano para o usuário
      await supabase.from('profiles').update({ 
        active_plan_id: dep.planId, 
        total_invested: dep.amount 
      }).eq('id', dep.userId);

      // 3. Lógica Multinível (5 Níveis)
      let currentMemberId = dep.userId;
      let nextUplineCode = '';

      // Busca quem indicou o investidor
      const { data: firstLevel } = await supabase.from('profiles').select('referred_by').eq('id', currentMemberId).single();
      nextUplineCode = firstLevel?.referred_by || '';

      // Loop por 5 níveis de indicação
      for (let level = 0; level < 5; level++) {
        if (!nextUplineCode || nextUplineCode === 'Direto' || nextUplineCode === 'Não informado') break;

        const { data: uplineProfile } = await supabase.from('profiles')
          .select('id, balance, network_earnings, referred_by')
          .eq('referral_code', nextUplineCode)
          .single();

        if (uplineProfile) {
          const rate = REFERRAL_RATES[level];
          const bonus = dep.amount * rate;
          
          if (bonus > 0) {
            await supabase.from('profiles').update({ 
              balance: (parseFloat(uplineProfile.balance) || 0) + bonus,
              network_earnings: (parseFloat(uplineProfile.network_earnings) || 0) + bonus
            }).eq('id', uplineProfile.id);
            
            console.log(`Bônus Nível ${level + 1} pago para ${nextUplineCode}: ${bonus} USDT`);
          }
          
          // Prepara para o próximo nível
          nextUplineCode = uplineProfile.referred_by || '';
        } else {
          break; // Fim da linha de indicação
        }
      }
    } else {
      // Depósito avulso (apenas saldo)
      await updateBalance(dep.amount, dep.userId);
    }
    
    fetchAdminData();
  };

  const handleRequestWithdraw = async (amount: number, wallet: string) => {
    if (!currentUser) return;
    if (amount > currentUser.balance) return alert('Saldo insuficiente!');
    const { error } = await supabase.from('withdrawals').insert({
      user_id: currentUser.id, user_name: currentUser.name,
      amount: amount, wallet: wallet, fee: amount * 0.05, status: 'PENDING'
    });
    if (!error) {
      await updateBalance(-amount);
      alert('Saque solicitado!');
      setShowWithdraw(false);
      fetchUserProfile(currentUser.id);
    }
  };

  const renderView = () => {
    if (loading) return <div className="flex-1 flex flex-col items-center justify-center p-10 h-screen bg-white">Sincronizando...</div>;
    if (!currentUser) return currentView === AppView.REGISTER ? <Register onSwitch={() => setCurrentView(AppView.LOGIN)} onRegister={() => {}} /> : <Login onSwitch={() => setCurrentView(AppView.REGISTER)} onLogin={() => {}} />;

    switch (currentView) {
      case AppView.HOME: return <Home user={currentUser} myDeposits={myDeposits} updateBalance={updateBalance} performCheckIn={performCheckIn} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => setShowDeposit(true)} onOpenWheel={() => setShowWheel(true)} />;
      case AppView.TASKS: return <Tasks user={currentUser} onCompleteTask={(r) => updateBalance(r)} />;
      case AppView.PLANS: return <PlanList user={currentUser} myDeposits={myDeposits} onActivate={(pid) => { setPendingPlanId(pid); setShowDeposit(true); }} />;
      case AppView.NETWORK: return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT: return <Account user={currentUser} onLogout={() => supabase.auth.signOut()} onUpdateUser={async (u) => { await supabase.from('profiles').update({ wallet_address: u.walletAddress }).eq('id', u.id); fetchUserProfile(u.id); }} onViewChange={setCurrentView} notifications={[]} />;
      case AppView.ADMIN: return <AdminPanel users={allUsers} deposits={deposits} withdrawals={withdrawals} depositWallet={customWallet} onUpdateWallet={setCustomWallet} onClose={() => setCurrentView(AppView.ACCOUNT)} onApproveDeposit={handleApproveDeposit} onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }} onApproveWithdraw={async (id) => { await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id); fetchAdminData(); }} onRejectWithdraw={async (id) => { await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }} onUpdateStatus={async (id, s) => { await supabase.from('profiles').update({ status: s }).eq('id', id); fetchAdminData(); }} onDeleteUser={() => {}} onGivePlan={async (id, pid) => { await supabase.from('profiles').update({ active_plan_id: pid }).eq('id', id); fetchAdminData(); }} onAdjustBalance={async (id, a) => { await updateBalance(a, id); fetchAdminData(); }} />;
      default: return null;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showWithdraw && currentUser && <WithdrawModal user={currentUser} onClose={() => setShowWithdraw(false)} onSubmit={handleRequestWithdraw} />}
      {showDeposit && currentUser && <DepositModal wallet={customWallet} onClose={() => { setShowDeposit(false); setPendingPlanId(null); }} onConfirm={async (h) => {
        const { error } = await supabase.from('deposits').insert({ user_id: currentUser.id, user_name: currentUser.name, amount: pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment : 0, hash: h, plan_id: pendingPlanId, status: 'PENDING' });
        if (!error) { alert('Enviado!'); setShowDeposit(false); fetchUserProfile(currentUser.id); }
      }} prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''} />}
      {showWheel && currentUser && <LuckyWheelModal user={currentUser} onClose={() => setShowWheel(false)} onWin={(a) => updateBalance(a)} />}
    </Layout>
  );
};

export default App;

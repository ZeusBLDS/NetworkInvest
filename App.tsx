
import React, { useState, useEffect } from 'react';
import { AppView, User, Notification, DepositRequest, WithdrawRequest } from './types';
import { PLANS, APP_CONFIG, REFERRAL_RATES } from './constants';
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
    referredBy: u.referred_by || 'Direto',
    balance: parseFloat(u.balance || 0),
    walletAddress: u.wallet_address || '',
    activePlanId: u.active_plan_id || 'vip0',
    joinDate: new Date(u.created_at).getTime(),
    lastCheckIn: u.last_check_in ? new Date(u.last_check_in).getTime() : undefined,
    checkInStreak: u.check_in_streak || 0,
    isFirstLogin: u.is_first_login ?? false,
    role: u.role || 'USER',
    status: u.status || 'ACTIVE',
    totalInvested: parseFloat(u.total_invested || 0),
    totalWithdrawn: parseFloat(u.total_withdrawn || 0),
    network_earnings: parseFloat(u.network_earnings || 0)
  });

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
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
          setShowVipZero(true);
          await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        }

        if (currentView === AppView.LOGIN || currentView === AppView.REGISTER) {
          setCurrentView(AppView.HOME);
        }
        setLoading(false);
      } else if (retryCount < 3) {
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), 2000);
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: authUser.id,
            name: authUser.user_metadata.name || 'Usuário',
            email: authUser.email,
            phone: authUser.user_metadata.phone || '',
            referred_by: authUser.user_metadata.referred_by || 'Direto',
            referral_code: Math.random().toString(36).substring(2, 10).toUpperCase()
          });
          if (!insertError) fetchUserProfile(userId);
          else { setLoading(false); supabase.auth.signOut(); }
        }
      }
    } catch (e) { 
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
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setLoading(true);
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
        setCurrentView(AppView.LOGIN);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const distributeNetworkCommissions = async (userId: string, planAmount: number) => {
    let currentId = userId;
    for (let level = 0; level < REFERRAL_RATES.length; level++) {
      const { data: p } = await supabase.from('profiles').select('referred_by').eq('id', currentId).single();
      if (!p || p.referred_by === 'Direto') break;
      const { data: referrer } = await supabase.from('profiles').select('*').eq('referral_code', p.referred_by).single();
      if (!referrer) break;
      const commission = planAmount * REFERRAL_RATES[level];
      await supabase.from('profiles').update({ 
        balance: (parseFloat(referrer.balance) || 0) + commission, 
        network_earnings: (parseFloat(referrer.network_earnings) || 0) + commission 
      }).eq('id', referrer.id);
      currentId = referrer.id;
    }
  };

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
    const todayStr = now.toDateString();

    // Verificação rigorosa contra manipulação de estado local
    const { data: profile } = await supabase.from('profiles').select('last_check_in, balance, check_in_streak').eq('id', currentUser.id).single();
    
    if (profile?.last_check_in && new Date(profile.last_check_in).toDateString() === todayStr) {
      alert('Você já realizou seu check-in hoje!');
      return;
    }

    // Probabilidade: 0.10 USDT fixo com chance baixíssima de bônus
    const baseReward = 0.10;
    const isLucky = Math.random() < 0.001; // 0.1% de chance de ganhar algo a mais
    const reward = isLucky ? (baseReward + (profile.check_in_streak * 0.01)) : baseReward;
    const finalReward = parseFloat(reward.toFixed(2));

    await supabase.from('profiles').update({ 
      balance: parseFloat(profile.balance) + finalReward, 
      last_check_in: now.toISOString(), 
      check_in_streak: profile.check_in_streak + 1 
    }).eq('id', currentUser.id);

    fetchUserProfile(currentUser.id);
    return finalReward;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Iniciando Network Invest...</h2>
      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.4em] mt-2 animate-pulse">Sincronizando Perfil</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {currentUser && currentView !== AppView.ADMIN ? (
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          {currentView === AppView.HOME && <Home user={currentUser} myDeposits={myDeposits} updateBalance={updateBalance} performCheckIn={performCheckIn} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => { setPendingPlanId(null); setShowDeposit(true); }} onOpenWheel={() => setShowWheel(true)} />}
          {currentView === AppView.PLANS && <PlanList user={currentUser} myDeposits={myDeposits} onActivate={(pid) => { setPendingPlanId(pid); setShowDeposit(true); }} />}
          {currentView === AppView.NETWORK && <NetworkView user={currentUser} />}
          {currentView === AppView.ACCOUNT && <Account user={currentUser} onLogout={() => supabase.auth.signOut()} notifications={[]} onViewChange={setCurrentView} onUpdateUser={async (u) => { await supabase.from('profiles').update({ wallet_address: u.walletAddress }).eq('id', u.id); fetchUserProfile(u.id); }} />}
        </Layout>
      ) : (
        currentView === AppView.ADMIN ? <AdminPanel 
          users={allUsers} deposits={deposits} withdrawals={withdrawals} onClose={() => { setCurrentView(AppView.ACCOUNT); fetchUserProfile(currentUser?.id || ''); }} 
          depositWallet={customWallet} onUpdateWallet={setCustomWallet}
          onApproveDeposit={async (id) => {
            const req = deposits.find(d => d.id === id); if (!req) return;
            await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id);
            const { data: uDB } = await supabase.from('profiles').select('*').eq('id', req.userId).single();
            if (uDB) {
              const updates: any = { total_invested: (parseFloat(uDB.total_invested) || 0) + req.amount };
              if (req.planId) { 
                updates.active_plan_id = req.planId; 
                await distributeNetworkCommissions(req.userId, req.amount); 
              } else { 
                updates.balance = (parseFloat(uDB.balance) || 0) + req.amount; 
              }
              await supabase.from('profiles').update(updates).eq('id', req.userId);
              fetchAdminData();
              alert('Depósito aprovado!');
            }
          }}
          onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }}
          onApproveWithdraw={async (id) => { 
            const req = withdrawals.find(w => w.id === id); if(!req) return;
            await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id);
            const { data: uDB } = await supabase.from('profiles').select('total_withdrawn').eq('id', req.userId).single();
            if(uDB) await supabase.from('profiles').update({ total_withdrawn: (parseFloat(uDB.total_withdrawn) || 0) + req.amount }).eq('id', req.userId);
            fetchAdminData(); 
            alert('Saque marcado como Pago!');
          }}
          onRejectWithdraw={async (id) => { 
            const req = withdrawals.find(w => w.id === id); if(req) await updateBalance(req.amount, req.userId); 
            await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id); 
            fetchAdminData(); 
          }}
          onUpdateStatus={async (uid, s) => { await supabase.from('profiles').update({ status: s }).eq('id', uid); fetchAdminData(); }}
          onDeleteUser={async (uid) => { if(confirm("CUIDADO: Deletar usuário permanentemente?")) { await supabase.from('profiles').delete().eq('id', uid); fetchAdminData(); } }}
          onGivePlan={async (uid, pid) => { await supabase.from('profiles').update({ active_plan_id: pid }).eq('id', uid); fetchAdminData(); alert('Plano atualizado!'); }}
          onAdjustBalance={async (uid, amt) => { await updateBalance(amt, uid); fetchAdminData(); alert('Saldo ajustado!'); }}
        /> : (currentView === AppView.REGISTER ? <Register onSwitch={() => setCurrentView(AppView.LOGIN)} onRegister={() => {}} /> : <Login onSwitch={() => setCurrentView(AppView.REGISTER)} onLogin={() => {}} />)
      )}
      
      {showDeposit && <DepositModal wallet={customWallet} prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''} onClose={() => setShowDeposit(false)} onConfirm={async (hash) => {
        const plan = PLANS.find(p => p.id === pendingPlanId);
        await supabase.from('deposits').insert({ user_id: currentUser?.id, user_name: currentUser?.name, amount: plan ? plan.investment : (parseFloat(pendingPlanId || '0') || 10), hash, plan_id: pendingPlanId, status: 'PENDING' });
        setShowDeposit(false); alert('Enviado! Aguarde a aprovação do administrador.'); fetchUserProfile(currentUser?.id || '');
      }} />}
      {showWithdraw && currentUser && <WithdrawModal user={currentUser} onClose={() => setShowWithdraw(false)} onSubmit={async (amt) => {
        await supabase.from('withdrawals').insert({ user_id: currentUser.id, user_name: currentUser.name, amount: amt, wallet: currentUser.walletAddress || '', fee: amt * 0.05, status: 'PENDING' });
        await updateBalance(-amt); setShowWithdraw(false); alert('Solicitação de saque enviada!');
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

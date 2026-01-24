
import React, { useState, useEffect } from 'react';
import { AppView, User, Notification, DepositRequest, WithdrawRequest } from './types';
import { PLANS } from './constants';
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
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);

  const [showWelcome, setShowWelcome] = useState(false);
  const [showVipZero, setShowVipZero] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentView(AppView.LOGIN);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca perfil do usuário e normaliza os dados
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (data) {
        const u = data as any;
        // Fix: Added referralCode and referredBy properties to satisfy User interface
        const normalized: User = {
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
          lastCheckIn: u.last_check_in ? new Date(u.last_check_in).getTime() : undefined
        };
        setCurrentUser(normalized);
        if (normalized.isFirstLogin) {
          setShowWelcome(true);
          setShowVipZero(true);
          await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
        }
        if (normalized.role === 'ADMIN') fetchAdminData();
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setLoading(false);
    }
  };

  // Busca dados globais para o Admin
  const fetchAdminData = async () => {
    try {
      const [u, d, w] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
      ]);
      if (u.data) setAllUsers(u.data.map((usr: any) => ({
        ...usr,
        activePlanId: usr.active_plan_id || 'vip0',
        balance: parseFloat(usr.balance || 0),
        totalInvested: parseFloat(usr.total_invested || 0)
      })) as any);
      if (d.data) setDeposits(d.data.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
        status: req.status, timestamp: new Date(req.created_at).getTime()
      })) as any);
      if (w.data) setWithdrawals(w.data.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), wallet: req.wallet, status: req.status,
        timestamp: new Date(req.created_at).getTime()
      })) as any);
    } catch (e) {
      console.error("Erro Admin Data:", e);
    }
  };

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    const { data } = await supabase.from('profiles').select('balance').eq('id', id).single();
    if (data) {
      await supabase.from('profiles').update({ balance: (data.balance || 0) + amount }).eq('id', id);
      fetchUserProfile(id);
      if (currentUser?.role === 'ADMIN') fetchAdminData();
    }
  };

  const renderContent = () => {
    if (!currentUser) {
      if (currentView === AppView.REGISTER) return <Register onSwitch={() => setCurrentView(AppView.LOGIN)} onRegister={() => {}} />;
      return <Login onSwitch={() => setCurrentView(AppView.REGISTER)} onLogin={() => {}} />;
    }

    switch (currentView) {
      case AppView.HOME:
        // Fix: performCheckIn must return Promise<number | undefined>, changed async () => {} to async () => 0
        return <Home user={currentUser} updateBalance={updateBalance} performCheckIn={async () => { return 0; }} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => { setPendingPlanId(null); setShowDeposit(true); }} onOpenWheel={() => setShowWheel(true)} />;
      case AppView.PLANS:
        return <PlanList user={currentUser} onActivate={(pid) => { setPendingPlanId(pid); setShowDeposit(true); }} />;
      case AppView.NETWORK:
        return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT:
        return <Account user={currentUser} onLogout={() => supabase.auth.signOut()} notifications={notifications} onViewChange={setCurrentView} onUpdateUser={() => {}} />;
      case AppView.ADMIN:
        return <AdminPanel 
          users={allUsers} deposits={deposits} withdrawals={withdrawals} onClose={() => setCurrentView(AppView.ACCOUNT)} 
          onApproveDeposit={async (id) => {
            const req = deposits.find(d => d.id === id);
            if (req) {
              // 1. Aprova o depósito
              await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id);
              // 2. Ativa o plano no perfil do usuário
              const { error } = await supabase.from('profiles').update({ 
                active_plan_id: req.planId || 'vip1',
                total_invested: req.amount 
              }).eq('id', req.userId);
              
              if (!error) {
                alert("Plano aprovado e ativado!");
                fetchAdminData();
                // Se o admin estiver testando na própria conta, recarrega
                if (req.userId === currentUser.id) fetchUserProfile(req.userId);
              }
            }
          }}
          onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }}
          onApproveWithdraw={async (id) => { await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id); fetchAdminData(); }}
          onRejectWithdraw={async (id) => { await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }}
          onUpdateStatus={() => {}} onDeleteUser={() => {}} onGivePlan={() => {}} onAdjustBalance={() => {}}
        />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      {currentUser && currentView !== AppView.ADMIN ? (
        <Layout currentView={currentView} onViewChange={setCurrentView}>{renderContent()}</Layout>
      ) : renderContent()}
      
      {showDeposit && (
        <DepositModal 
          prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''} 
          onClose={() => setShowDeposit(false)} 
          onConfirm={async (hash) => {
            const plan = PLANS.find(p => p.id === pendingPlanId);
            await supabase.from('deposits').insert({ 
              user_id: currentUser?.id, user_name: currentUser?.name, 
              amount: plan ? plan.investment : 0, hash, plan_id: pendingPlanId, status: 'PENDING' 
            });
            setShowDeposit(false); alert('Solicitação enviada! Aguarde a aprovação do Admin.');
          }} 
        />
      )}
      {showWithdraw && currentUser && <WithdrawModal user={currentUser} onClose={() => setShowWithdraw(false)} onSubmit={() => {}} />}
      {showWheel && currentUser && <LuckyWheelModal user={currentUser} onClose={() => setShowWheel(false)} onWin={() => {}} />}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showVipZero && <VipZeroModal onActivate={() => setShowVipZero(false)} />}
    </div>
  );
};

export default App;

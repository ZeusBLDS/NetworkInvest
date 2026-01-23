
import React, { useState, useEffect, useCallback } from 'react';
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
  
  // Platform States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);

  // Modals
  const [showWelcome, setShowWelcome] = useState(false);
  const [showVipZero, setShowVipZero] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // Initialize Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserProfile(session.user.id);
      else {
        setCurrentUser(null);
        setCurrentView(AppView.LOGIN);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setCurrentUser(data as any);
      if (data.role === 'ADMIN') fetchAdminData();
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    const [u, d, w] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('deposits').select('*').order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
    ]);
    if (u.data) setAllUsers(u.data as any);
    if (d.data) setDeposits(d.data as any);
    if (w.data) setWithdrawals(w.data as any);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;

    const { data, error } = await supabase.rpc('increment_balance', { 
      user_id: id, 
      amount_to_add: amount 
    });

    if (!error) fetchUserProfile(id);
  };

  // Deposit/Withdrawal Creation (Database Real)
  const createDepositRequest = async (hash: string, amount: number, planId?: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('deposits').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount,
      hash,
      plan_id: planId,
      status: 'PENDING'
    });
    if (!error && currentUser.role === 'ADMIN') fetchAdminData();
  };

  const createWithdrawRequest = async (amount: number, wallet: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('withdrawals').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount,
      wallet,
      fee: amount * 0.05,
      status: 'PENDING'
    });
    if (!error) {
      await updateBalance(-amount);
      if (currentUser.role === 'ADMIN') fetchAdminData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="ml-4 font-bold tracking-widest animate-pulse">CARREGANDO...</p>
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
        return <Home 
          user={currentUser} 
          updateBalance={updateBalance} 
          addNotification={() => {}} 
          onOpenWithdraw={() => setShowWithdraw(true)}
          onOpenDeposit={() => { setPendingPlanId(null); setShowDeposit(true); }}
          onOpenWheel={() => setShowWheel(true)}
        />;
      case AppView.PLANS:
        return <PlanList 
          user={currentUser} 
          onActivate={(planId) => {
            if (planId === 'vip0') {} // Handle VIP0 activation logic
            else { setPendingPlanId(planId); setShowDeposit(true); }
          }} 
        />;
      case AppView.NETWORK:
        return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT:
        return <Account user={currentUser} onLogout={handleLogout} notifications={notifications} onUpdateUser={() => {}} />;
      case AppView.ADMIN:
        return (
          <AdminPanel 
            users={allUsers}
            deposits={deposits}
            withdrawals={withdrawals}
            onClose={() => setCurrentView(AppView.ACCOUNT)} 
            onApproveDeposit={() => {}}
            onRejectDeposit={() => {}}
            onApproveWithdraw={() => {}}
            onRejectWithdraw={() => {}}
            onUpdateStatus={() => {}}
            onDeleteUser={() => {}}
            onGivePlan={() => {}}
            onAdjustBalance={() => {}}
          />
        );
      default:
        return <Home user={currentUser} updateBalance={updateBalance} addNotification={() => {}} onOpenWithdraw={() => setShowWithdraw(true)} onOpenDeposit={() => {}} onOpenWheel={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative overflow-x-hidden">
      {currentUser ? (
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          {renderContent()}
        </Layout>
      ) : (
        renderContent()
      )}

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showVipZero && <VipZeroModal onActivate={() => {}} />}
      {showWithdraw && currentUser && (
        <WithdrawModal 
          user={currentUser} 
          onClose={() => setShowWithdraw(false)} 
          onSubmit={createWithdrawRequest}
        />
      )}
      {showDeposit && (
        <DepositModal 
          prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''}
          onClose={() => { setShowDeposit(false); setPendingPlanId(null); }} 
          onConfirm={(hash) => {
            const plan = PLANS.find(p => p.id === pendingPlanId);
            createDepositRequest(hash, plan ? plan.investment : 0, pendingPlanId || undefined);
            setShowDeposit(false);
          }} 
        />
      )}
      {showWheel && currentUser && (
        <LuckyWheelModal 
          user={currentUser} 
          onClose={() => setShowWheel(false)} 
          onWin={(prize) => updateBalance(prize)}
        />
      )}
    </div>
  );
};

export default App;

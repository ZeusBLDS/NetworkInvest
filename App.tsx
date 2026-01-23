
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
      const user = data as any;
      setCurrentUser(user);
      
      // Lógica de Primeiro Login / VIP 0
      if (user.is_first_login) {
        setShowWelcome(true);
        setShowVipZero(true);
        // Desativar flag de primeiro login no banco
        await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
      }

      if (user.role === 'ADMIN') fetchAdminData();
      setLoading(false);
      setCurrentView(AppView.HOME);
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

    const { error } = await supabase.rpc('increment_balance', { 
      user_id: id, 
      amount_to_add: amount 
    });

    if (!error) fetchUserProfile(id);
  };

  const approveDeposit = async (requestId: string) => {
    const req = deposits.find(r => r.id === requestId);
    if (!req) return;

    await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', requestId);
    
    const userToUpdate = allUsers.find(u => u.id === req.userId);
    if (userToUpdate) {
      const updates = {
        balance: userToUpdate.balance + (req.planId ? 0 : req.amount),
        active_plan_id: req.planId || userToUpdate.activePlanId,
        total_invested: (userToUpdate.totalInvested || 0) + req.amount
      };
      await supabase.from('profiles').update(updates).eq('id', req.userId);
    }
    
    fetchAdminData();
  };

  const approveWithdraw = async (requestId: string) => {
    await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', requestId);
    fetchAdminData();
  };

  const createDepositRequest = async (hash: string, amount: number, planId?: string) => {
    if (!currentUser) return;
    await supabase.from('deposits').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount,
      hash,
      plan_id: planId,
      status: 'PENDING'
    });
    if (currentUser.role === 'ADMIN') fetchAdminData();
    alert('Pedido enviado! Aguarde aprovação do administrador.');
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
      alert('Pedido de saque enviado!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="font-bold tracking-widest animate-pulse">NETWORK INVEST</p>
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
            if (planId === 'vip0') {
               alert('Você já possui o plano VIP 0 ativo!');
            } else { 
               setPendingPlanId(planId); 
               setShowDeposit(true); 
            }
          }} 
        />;
      case AppView.NETWORK:
        return <NetworkView user={currentUser} />;
      case AppView.ACCOUNT:
        return <Account 
          user={currentUser} 
          onLogout={handleLogout} 
          notifications={notifications} 
          onUpdateUser={async (u) => { await supabase.from('profiles').update(u).eq('id', u.id); fetchUserProfile(u.id); }} 
        />;
      case AppView.ADMIN:
        return (
          <AdminPanel 
            users={allUsers}
            deposits={deposits}
            withdrawals={withdrawals}
            onClose={() => setCurrentView(AppView.ACCOUNT)} 
            onApproveDeposit={approveDeposit}
            onRejectDeposit={async (id) => { await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id); fetchAdminData(); }}
            onApproveWithdraw={approveWithdraw}
            onRejectWithdraw={async (id) => { 
              const req = withdrawals.find(w => w.id === id);
              if(req) await updateBalance(req.amount, req.userId); // Reembolsar
              await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id); 
              fetchAdminData(); 
            }}
            onUpdateStatus={async (id, s) => { await supabase.from('profiles').update({ status: s }).eq('id', id); fetchAdminData(); }}
            onDeleteUser={async (id) => { await supabase.from('profiles').delete().eq('id', id); fetchAdminData(); }}
            onGivePlan={async (id, p) => { await supabase.from('profiles').update({ active_plan_id: p }).eq('id', id); fetchAdminData(); }}
            onAdjustBalance={async (id, a) => { await updateBalance(a, id); fetchAdminData(); }}
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
      {showVipZero && <VipZeroModal onActivate={() => setShowVipZero(false)} />}
      {showWithdraw && currentUser && (
        <WithdrawModal 
          user={currentUser} 
          onClose={() => setShowWithdraw(false)} 
          onSubmit={(amt) => createWithdrawRequest(amt, currentUser.walletAddress || '')}
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

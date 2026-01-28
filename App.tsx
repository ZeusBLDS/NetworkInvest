
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
import OfficialNoticeModal from './components/OfficialNoticeModal';

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
  const [showOfficialNotice, setShowOfficialNotice] = useState(false);
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
        
        const noticeSeen = sessionStorage.getItem('ni_notice_seen');
        if (!noticeSeen && !user.isFirstLogin) {
          setShowOfficialNotice(true);
        }

        const { data: deps } = await supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (deps) setMyDeposits(deps.map((req: any) => ({
          id: req.id, userId: req.user_id, userName: req.user_name,
          amount: parseFloat(req.amount), hash: req.hash, planId: req.plan_id,
          status: req.status, timestamp: new Date(req.created_at).getTime(), method: req.method || 'USDT'
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
        status: req.status, timestamp: new Date(req.created_at).getTime(), method: req.method || 'USDT'
      })));
      if (withs) setWithdrawals(withs.map((req: any) => ({
        id: req.id, userId: req.user_id, userName: req.user_name,
        amount: parseFloat(req.amount), wallet: req.wallet, fee: parseFloat(req.fee || 0),
        status: req.status, timestamp: new Date(req.created_at).getTime(), method: req.method || 'USDT'
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

  const distributeCommissions = async (buyerId: string, amount: number) => {
    try {
      const { data: buyer } = await supabase.from('profiles').select('referred_by').eq('id', buyerId).single();
      if (!buyer || buyer.referred_by === 'Direto') return;

      let currentReferrerCode = buyer.referred_by;

      for (let level = 0; level < REFERRAL_RATES.length; level++) {
        if (!currentReferrerCode || currentReferrerCode === 'Direto') break;

        const { data: referrer } = await supabase.from('profiles')
          .select('id, balance, network_earnings, referred_by')
          .eq('referral_code', currentReferrerCode)
          .single();

        if (referrer) {
          const commissionValue = amount * REFERRAL_RATES[level];
          const newBalance = parseFloat(referrer.balance) + commissionValue;
          const newNetworkEarnings = parseFloat(referrer.network_earnings || 0) + commissionValue;

          await supabase.from('profiles').update({
            balance: newBalance,
            network_earnings: newNetworkEarnings
          }).eq('id', referrer.id);

          currentReferrerCode = referrer.referred_by;
        } else {
          break;
        }
      }
    } catch (error) {
      console.error("Erro comissões:", error);
    }
  };

  const updateBalance = async (amount: number, userId?: string) => {
    const id = userId || currentUser?.id;
    if (!id) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', id).single();
      if (profile) {
        const newBalance = parseFloat(profile.balance) + amount;
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', id);
        if (!userId && currentUser) {
          setCurrentUser({ ...currentUser, balance: newBalance });
        }
      }
    } catch (e) {
      console.error("Erro balance:", e);
    }
  };

  const performCheckIn = async () => {
    if (!currentUser) return;
    const earningToday = 0.01;
    const today = new Date().toISOString();
    try {
      const { data } = await supabase.from('profiles').update({
        balance: currentUser.balance + earningToday,
        last_check_in: today,
        check_in_streak: currentUser.checkInStreak + 1
      }).eq('id', currentUser.id).select().single();
      
      if (data) {
        const updated = mapUserFromDB(data);
        setCurrentUser(updated);
        return updated.checkInStreak;
      }
    } catch (e) {
      console.error("Checkin error:", e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentView(AppView.LOGIN);
    sessionStorage.removeItem('ni_notice_seen');
  };

  const handleDepositConfirm = async (hash: string, method: 'USDT' | 'PIX') => {
    if (!currentUser) return;
    const amount = pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment || 0 : 0;
    
    // ATIVAÇÃO AUTOMÁTICA SMART:
    // Para simplificar a experiência e reduzir carga do admin, vamos ativar na hora
    // após o usuário passar pelo processo de sincronização visual do modal.
    try {
      await supabase.from('deposits').insert({
        user_id: currentUser.id,
        user_name: currentUser.name,
        amount: amount,
        hash: hash,
        plan_id: pendingPlanId,
        status: 'APPROVED', // Ativado automaticamente
        method: method
      });

      if (pendingPlanId) {
        await supabase.from('profiles').update({ active_plan_id: pendingPlanId }).eq('id', currentUser.id);
        await distributeCommissions(currentUser.id, amount);
        alert('🎯 ATIVAÇÃO CONCLUÍDA! Seu plano já está operando.');
      } else {
        await updateBalance(amount);
        alert('💰 SALDO CREDITADO! Sua conta foi atualizada.');
      }
      
      setShowDeposit(false);
      setPendingPlanId(null);
      fetchUserProfile(currentUser.id);
    } catch (err) {
      console.error("Erro na ativação automática:", err);
      alert("Houve um erro na ativação automática. Nossa equipe revisará manualmente.");
      setShowDeposit(false);
    }
  };

  const handleWithdrawSubmit = async (amount: number, wallet: string, method: 'USDT' | 'PIX') => {
    if (!currentUser) return;
    const fee = method === 'PIX' ? amount * 0.10 : 0;
    
    await supabase.from('withdrawals').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount: amount,
      wallet: wallet,
      fee: fee,
      status: 'PENDING',
      method: method
    });

    await updateBalance(-amount);
    setShowWithdraw(false);
    alert('Solicitação de saque enviada!');
  };

  const handleWinWheel = async (amount: number) => {
    await updateBalance(amount);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-emerald-600 bg-white text-xs uppercase tracking-[0.5em]">Network Invest...</div>;

  const renderContent = () => {
    if (!currentUser) {
      if (currentView === AppView.REGISTER) return <Register onSwitch={() => setCurrentView(AppView.LOGIN)} onRegister={() => setCurrentView(AppView.LOGIN)} />;
      return <Login onSwitch={() => setCurrentView(AppView.REGISTER)} onLogin={(u) => { setCurrentUser(u); setCurrentView(AppView.HOME); }} />;
    }

    if (currentView === AppView.ADMIN && currentUser.role === 'ADMIN') {
      return (
        <AdminPanel 
          users={allUsers}
          deposits={deposits}
          withdrawals={withdrawals}
          depositWallet={customWallet}
          onUpdateWallet={setCustomWallet}
          onClose={() => setCurrentView(AppView.ACCOUNT)}
          onApproveDeposit={async (id) => {
            const dep = deposits.find(d => d.id === id);
            if (!dep || dep.status !== 'PENDING') return;
            await supabase.from('deposits').update({ status: 'APPROVED' }).eq('id', id);
            if (dep.planId) {
              await supabase.from('profiles').update({ active_plan_id: dep.planId }).eq('id', dep.userId);
              await distributeCommissions(dep.userId, dep.amount);
            } else {
              await updateBalance(dep.amount, dep.userId);
            }
            fetchAdminData();
          }}
          onRejectDeposit={async (id) => {
            const dep = deposits.find(d => d.id === id);
            if (!dep || dep.status !== 'PENDING') return;
            await supabase.from('deposits').update({ status: 'REJECTED' }).eq('id', id);
            fetchAdminData();
          }}
          onApproveWithdraw={async (id) => {
            const withs = withdrawals.find(w => w.id === id);
            if (!withs || withs.status !== 'PENDING') return;
            await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id);
            fetchAdminData();
          }}
          onRejectWithdraw={async (id) => {
             const withReq = withdrawals.find(w => w.id === id);
             if (!withReq || withReq.status !== 'PENDING') return;
             await updateBalance(withReq.amount, withReq.userId);
             await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id);
             fetchAdminData();
          }}
          onUpdateStatus={async (uid, status) => {
            await supabase.from('profiles').update({ status }).eq('id', uid);
            fetchAdminData();
          }}
          onDeleteUser={async (uid) => {
             await supabase.from('profiles').delete().eq('id', uid);
             fetchAdminData();
          }}
          onGivePlan={async (uid, pid) => {
            await supabase.from('profiles').update({ active_plan_id: pid }).eq('id', uid);
            fetchAdminData();
          }}
          onAdjustBalance={async (uid, amt) => {
            const { data } = await supabase.from('profiles').select('balance').eq('id', uid).single();
            if (data) await supabase.from('profiles').update({ balance: parseFloat(data.balance) + amt }).eq('id', uid);
            fetchAdminData();
          }}
          onUpdateReferrer={async (uid, newRef) => {
            await supabase.from('profiles').update({ referred_by: newRef }).eq('id', uid);
            alert('Líder atualizado!');
            fetchAdminData();
          }}
        />
      );
    }

    return (
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {currentView === AppView.HOME && (
          <Home 
            user={currentUser} 
            myDeposits={myDeposits} 
            updateBalance={updateBalance} 
            performCheckIn={performCheckIn}
            addNotification={() => {}} 
            onOpenWithdraw={() => setShowWithdraw(true)} 
            onOpenDeposit={() => { setPendingPlanId(null); setShowDeposit(true); }} 
            onOpenWheel={() => setShowWheel(true)} 
          />
        )}
        {currentView === AppView.TASKS && (
          <Tasks 
            user={currentUser} 
            onCompleteTask={updateBalance} 
            onViewChange={setCurrentView} 
          />
        )}
        {currentView === AppView.PLANS && (
          <PlanList 
            user={currentUser} 
            myDeposits={myDeposits} 
            onActivate={(pid) => { setPendingPlanId(pid); setShowDeposit(true); }} 
          />
        )}
        {currentView === AppView.NETWORK && <NetworkView user={currentUser} />}
        {currentView === AppView.ACCOUNT && (
          <Account 
            user={currentUser} 
            onLogout={handleLogout} 
            onUpdateUser={setCurrentUser} 
            onViewChange={setCurrentView} 
            notifications={[]} 
          />
        )}
      </Layout>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-x-hidden">
      {renderContent()}
      
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showOfficialNotice && (
        <OfficialNoticeModal 
          onClose={() => { 
            setShowOfficialNotice(false); 
            sessionStorage.setItem('ni_notice_seen', 'true'); 
          }} 
        />
      )}
      {showWithdraw && <WithdrawModal user={currentUser!} onClose={() => setShowWithdraw(false)} onSubmit={handleWithdrawSubmit} />}
      {showDeposit && (
        <DepositModal 
          wallet={customWallet} 
          userCode={currentUser!.referralCode}
          onClose={() => setShowDeposit(false)} 
          onConfirm={handleDepositConfirm} 
          prefilledAmount={pendingPlanId ? PLANS.find(p => p.id === pendingPlanId)?.investment.toString() : ''}
        />
      )}
      {showWheel && <LuckyWheelModal user={currentUser!} onClose={() => setShowWheel(false)} onWin={handleWinWheel} />}
    </div>
  );
};

export default App;

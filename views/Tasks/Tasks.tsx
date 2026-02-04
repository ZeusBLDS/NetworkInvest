
import React, { useState, useEffect } from 'react';
import { User, AppView } from '../../types';
import { PLANS, APP_CONFIG } from '../../constants';
import { supabase } from '../../supabase';

interface TasksProps {
  user: User;
  onCompleteTask: (reward: number) => void;
  currency: 'BRL' | 'USDT';
  onViewChange?: (view: AppView) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, onCompleteTask, onViewChange, currency }) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const activePlan = PLANS.find(p => p.id === user.activePlanId);
  const rewardPerTask = activePlan ? activePlan.dailyReturn / activePlan.tasksPerDay : 0;

  const now = new Date();
  const currentDay = now.getDay();
  const isWeekend = !APP_CONFIG.TASK_DAYS.includes(currentDay);

  const steps = [
    "Conectando ao terminal financeiro...",
    "Analisando volume de mercado...",
    "Identificando oportunidades USDT...",
    "Executando swap na Blockchain...",
    "Validando contrato inteligente...",
    "Finalizando operação..."
  ];

  const formatValue = (val: number) => {
    if (currency === 'BRL') {
      return (val * APP_CONFIG.USDT_BRL_RATE).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    return val.toFixed(2);
  };

  useEffect(() => {
    checkPlanExpiration();
    fetchCompletedTasks();
  }, [user.activePlanId, user.planActivatedAt]);

  const checkPlanExpiration = () => {
    if (!activePlan || !user.planActivatedAt) return;
    const activatedDate = new Date(user.planActivatedAt);
    const expiryDate = new Date(activatedDate);
    expiryDate.setDate(activatedDate.getDate() + activePlan.durationDays);
    if (new Date() > expiryDate) setIsExpired(true);
    else setIsExpired(false);
  };

  const fetchCompletedTasks = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today);
    if (data) setCompletedCount(data.length);
    setLoading(false);
  };

  const handleStartTask = async () => {
    if (isWeekend || isExpired) return;
    if (!activePlan || completedCount >= activePlan.tasksPerDay || isProcessing) return;

    setIsProcessing(true);
    setProcessStep(0);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 1200));
      setProcessStep(i + 1);
    }

    const { error } = await supabase.from('user_tasks').insert({
      user_id: user.id,
      reward: rewardPerTask,
      plan_id: activePlan.id
    });

    if (!error) {
      onCompleteTask(rewardPerTask);
      setCompletedCount(prev => prev + 1);
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-emerald-600 uppercase text-xs tracking-widest">Sincronizando Terminal...</div>;

  if (!activePlan || isExpired) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-[35px] flex items-center justify-center text-4xl shadow-inner animate-float">
          {isExpired ? '⌛' : '🔒'}
        </div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">{isExpired ? 'Contrato Expirado' : 'Terminal Bloqueado'}</h2>
        <button onClick={() => onViewChange?.(AppView.PLANS)} className="bg-emerald-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">VER PLANOS</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Mercado Global</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Operações Diárias de Arbitragem</p>
      </div>

      <div className="bg-white rounded-[35px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Status do Terminal</p>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 ${isWeekend ? 'bg-amber-500' : 'bg-emerald-500 animate-ping'} rounded-full`}></span>
              <span className="text-sm font-black text-slate-800">{isWeekend ? 'FECHADO' : 'OPERACIONAL'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Plano</p>
            <p className="text-xs font-black text-slate-800 uppercase">{activePlan.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Hoje</p>
            <p className="text-lg font-black text-slate-800">{completedCount} / {activePlan.tasksPerDay}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Lucro Tarefa</p>
            <p className="text-lg font-black text-emerald-600">{formatValue(rewardPerTask)} <span className="text-[10px]">{currency}</span></p>
          </div>
        </div>
      </div>

      {isProcessing ? (
        <div className="bg-slate-900 rounded-[35px] p-8 text-white space-y-8 animate-in zoom-in duration-300 shadow-2xl">
          <div className="flex justify-center"><div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>
          <p className="text-emerald-400 font-mono text-[10px] animate-pulse tracking-widest uppercase text-center">{steps[processStep] || "Processando..."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedCount >= activePlan.tasksPerDay ? (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[35px] text-center shadow-inner">
              <h4 className="text-lg font-black text-emerald-900 uppercase italic">Operações Concluídas</h4>
            </div>
          ) : (
            <button onClick={handleStartTask} className="w-full bg-emerald-600 text-white p-8 rounded-[35px] shadow-2xl active:scale-[0.97] transition-all group border border-emerald-500">
              <p className="text-lg font-black uppercase italic tracking-tighter">Iniciar Operação {completedCount + 1}</p>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;

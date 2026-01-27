
import React, { useState, useEffect } from 'react';
import { User, AppView } from '../../types';
import { PLANS, APP_CONFIG } from '../../constants';
import { supabase } from '../../supabase';

interface TasksProps {
  user: User;
  onCompleteTask: (reward: number) => void;
  onViewChange?: (view: AppView) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, onCompleteTask, onViewChange }) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const activePlan = PLANS.find(p => p.id === user.activePlanId);
  const rewardPerTask = activePlan ? activePlan.dailyReturn / activePlan.tasksPerDay : 0;

  // Verificação de Dia Útil
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

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

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
    if (isWeekend) return;
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

  if (!activePlan) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-[35px] flex items-center justify-center text-4xl shadow-inner animate-float">🔒</div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Terminal Bloqueado</h2>
          <p className="text-xs text-slate-400 font-bold max-w-[200px] mx-auto leading-relaxed">Você não possui um plano de mineração ativo no momento.</p>
        </div>
        <button 
          onClick={() => onViewChange?.(AppView.PLANS)}
          className="bg-emerald-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-emerald-100 uppercase text-[10px] tracking-widest active:scale-95 transition-all"
        >
          ADQUIRIR PLANO AGORA
        </button>
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
              <span className="text-sm font-black text-slate-800">{isWeekend ? 'MERCADO FECHADO' : 'OPERACIONAL'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Ativo em</p>
            <p className="text-xs font-black text-slate-800 uppercase">{activePlan.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Tarefas de Hoje</p>
            <p className="text-lg font-black text-slate-800">{completedCount} / {activePlan.tasksPerDay}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Lucro por Tarefa</p>
            <p className="text-lg font-black text-emerald-600">{rewardPerTask.toFixed(2)} <span className="text-[10px]">USDT</span></p>
          </div>
        </div>
      </div>

      {isWeekend ? (
        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[35px] text-center space-y-4 shadow-sm animate-in fade-in duration-500">
          <div className="text-4xl">🗓️</div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-amber-900 uppercase italic">Fim de Semana</h4>
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
              As operações de arbitragem ocorrem apenas de <span className="font-black">Segunda a Sexta-feira</span>, acompanhando o mercado global.
            </p>
          </div>
          <div className="pt-2">
            <div className="bg-amber-100/50 py-2 px-4 rounded-xl inline-block">
               <p className="text-[9px] font-black text-amber-800 uppercase">Próxima abertura: Segunda-feira às 00:00</p>
            </div>
          </div>
        </div>
      ) : isProcessing ? (
        <div className="bg-slate-900 rounded-[35px] p-8 text-white space-y-8 animate-in zoom-in duration-300 shadow-2xl">
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-emerald-400 font-mono text-[10px] animate-pulse tracking-widest uppercase">
              {steps[processStep] || "Processando Transação..."}
            </p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${(processStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {completedCount >= activePlan.tasksPerDay ? (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[35px] text-center space-y-3 shadow-inner">
              <div className="text-4xl">💎</div>
              <h4 className="text-lg font-black text-emerald-900 uppercase italic">Operações Concluídas</h4>
              <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest opacity-60">Volte amanhã para novos ganhos</p>
            </div>
          ) : (
            <button 
              onClick={handleStartTask}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-8 rounded-[35px] shadow-2xl shadow-emerald-200 active:scale-[0.97] transition-all group border border-emerald-500"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-inner">⚡</div>
                <div className="text-center">
                  <p className="text-lg font-black uppercase tracking-tighter italic">Iniciar Operação {completedCount + 1}</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Executar Swap na Blockchain</p>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      <div className="h-20" />
    </div>
  );
};

export default Tasks;

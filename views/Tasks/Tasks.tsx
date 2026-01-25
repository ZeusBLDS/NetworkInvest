
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { PLANS } from '../../constants';
import { supabase } from '../../supabase';

interface TasksProps {
  user: User;
  onCompleteTask: (reward: number) => void;
}

const Tasks: React.FC<TasksProps> = ({ user, onCompleteTask }) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const activePlan = PLANS.find(p => p.id === user.activePlanId) || PLANS[0];
  const rewardPerTask = activePlan.dailyReturn / activePlan.tasksPerDay;

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
    const { data, error } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today);
    
    if (data) setCompletedCount(data.length);
    setLoading(false);
  };

  const handleStartTask = async () => {
    if (completedCount >= activePlan.tasksPerDay || isProcessing) return;

    setIsProcessing(true);
    setProcessStep(0);

    // Efeito de passos
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 1200));
      setProcessStep(i + 1);
    }

    // Gravar no banco
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

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-emerald-600">CARREGANDO OPERAÇÕES...</div>;

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
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-sm font-black text-slate-800">CONECTADO</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Plano Atual</p>
            <p className="text-xs font-black text-slate-800 uppercase">{activePlan.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
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

      {isProcessing ? (
        <div className="bg-slate-900 rounded-[35px] p-8 text-white space-y-8 animate-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-emerald-400 font-mono text-xs animate-pulse tracking-widest uppercase">
              {steps[processStep] || "Finalizando..."}
            </p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(processStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {completedCount >= activePlan.tasksPerDay ? (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[35px] text-center space-y-3">
              <div className="text-4xl">✅</div>
              <h4 className="text-lg font-black text-emerald-900 uppercase">Cota Diária Concluída</h4>
              <p className="text-xs text-emerald-700 font-medium">Você já realizou todas as operações disponíveis para seu plano hoje. Volte amanhã!</p>
            </div>
          ) : (
            <button 
              onClick={handleStartTask}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-8 rounded-[35px] shadow-2xl shadow-emerald-200 active:scale-[0.97] transition-all group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform">⚡</div>
                <div className="text-center">
                  <p className="text-lg font-black uppercase tracking-tighter italic">Iniciar Operação {completedCount + 1}</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Clique para processar no mercado</p>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Registro de Atividades</h3>
        <div className="space-y-4">
          {[...Array(activePlan.tasksPerDay)].map((_, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${i < completedCount ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${i < completedCount ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {i + 1}
                </div>
                <span className={`text-[11px] font-black uppercase ${i < completedCount ? 'text-emerald-900' : 'text-slate-400'}`}>
                  {i < completedCount ? 'Operação Concluída' : 'Aguardando Início'}
                </span>
              </div>
              <span className={`text-[10px] font-black ${i < completedCount ? 'text-emerald-600' : 'text-slate-300'}`}>
                +{rewardPerTask.toFixed(2)} USDT
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-20" />
    </div>
  );
};

export default Tasks;

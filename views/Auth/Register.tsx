
import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { User } from '../../types';
import { APP_CONFIG } from '../../constants';

interface RegisterProps {
  onSwitch: () => void;
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    terms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(formData.name)) {
      setError('Nome completo deve conter apenas letras.');
      return;
    }
    if (formData.password.length < 4) {
      setError('Senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (!formData.terms) {
      setError('Você deve aceitar os termos e condições.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            cpf: formData.cpf,
            referred_by: APP_CONFIG.DEFAULT_REFERRER,
            is_first_login: true,
            active_plan_id: 'vip0'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('rate limit')) {
          throw new Error('Limite de cadastros atingido por agora. Por favor, aguarde 10 minutos ou tente outra rede.');
        }
        throw authError;
      }

      if (data.user) {
        alert('Conta criada com sucesso! Você já pode entrar.');
        onSwitch();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-50 overflow-y-auto">
      <div className="mb-6 pt-4">
        <button onClick={onSwitch} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Voltar para login
        </button>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
           <h2 className="text-lg font-bold text-emerald-700 mb-1">Crie sua Conta</h2>
           <p className="text-xs text-gray-500">Acesse o marketplace de investimentos da Network Invest.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase px-1">Nome completo</label>
          <input
            type="text"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all"
            placeholder="Apenas letras"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">CPF (Opcional)</label>
            <input
              type="text"
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '')})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">Telefone</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase px-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            placeholder="exemplo@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase px-1">Senha</label>
          <input
            type="password"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            placeholder="Mín. 4 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-800 mb-1 uppercase tracking-wider">Avisos Importantes:</p>
          <p className="text-[10px] text-emerald-700 leading-tight">
            Toda operação financeira envolve riscos. Não há garantia de retorno ou preservação do capital. 
            O participante pode perder todo o valor investido.
          </p>
        </div>

        <label className="flex items-start space-x-3 cursor-pointer p-2">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            checked={formData.terms}
            onChange={(e) => setFormData({...formData, terms: e.target.checked})}
          />
          <span className="text-xs text-gray-600 font-medium leading-tight">
            Li e aceito os termos e condições e estou ciente de que esta plataforma não é regulamentada.
          </span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl animate-pulse">
            <p className="text-red-600 text-xs font-bold text-center leading-tight">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading ? 'CRIANDO CONTA...' : 'CRIAR MINHA CONTA'}
        </button>
      </form>
    </div>
  );
};

export default Register;

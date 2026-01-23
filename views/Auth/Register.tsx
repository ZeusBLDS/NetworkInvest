
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

    if (!/^[a-zA-Z\s]*$/.test(formData.name)) {
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
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Criar perfil na tabela 'profiles'
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf,
          referral_code: 'REF' + Math.floor(Math.random() * 10000),
          referred_by: APP_CONFIG.DEFAULT_REFERRER,
          balance: 0.00,
          active_plan_id: 'vip0',
          role: 'USER',
          status: 'ACTIVE'
        });

        if (profileError) throw profileError;
        // O App.tsx detectará o novo usuário logado
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente outro e-mail.');
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
        <p className="text-sm text-gray-500 font-medium bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          Cadastre-se para acessar o marketplace de investimentos internos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase px-1">Nome completo</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase px-1">CPF (Opcional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '')})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase px-1">Telefone</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase px-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="exemplo@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase px-1">Senha</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Mín. 4 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-800">
          <p className="font-bold mb-1 uppercase tracking-wider">Avisos Importantes:</p>
          <p>Toda operação financeira envolve riscos. Não há garantia de retorno ou preservação do capital.</p>
        </div>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            checked={formData.terms}
            onChange={(e) => setFormData({...formData, terms: e.target.checked})}
          />
          <span className="text-xs text-gray-600 font-medium">Li e aceito os termos e condições acima</span>
        </label>

        {error && <p className="text-red-500 text-xs italic bg-red-50 p-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Criando conta...' : 'Criar minha conta'}
        </button>
      </form>
    </div>
  );
};

export default Register;

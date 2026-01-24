
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { User } from '../../types';
import { APP_CONFIG } from '../../constants';

interface RegisterProps {
  onSwitch: () => void;
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  const [referredBy, setReferredBy] = useState(APP_CONFIG.DEFAULT_REFERRER);
  
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferredBy(refCode);
    }
  }, []);

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (!formData.terms) {
      setError('Você precisa aceitar os termos.');
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
            phone: formData.phone.replace(/\D/g, ''),
            cpf: formData.cpf.replace(/\D/g, ''),
            referred_by: referredBy,
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        alert('Conta criada! Faça login para continuar.');
        onSwitch();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-50 overflow-y-auto">
      <div className="mb-6 pt-4">
        <button onClick={onSwitch} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center text-xs font-bold uppercase tracking-widest">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Fazer Login
        </button>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <h2 className="text-xl font-black text-emerald-800 mb-1 uppercase tracking-tight">CRIAR CONTA</h2>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sistema Network Invest Global</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Convidado por</label>
          <input
            type="text"
            readOnly
            className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 font-black text-sm outline-none"
            value={referredBy}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Nome Completo</label>
          <input
            type="text"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all text-sm font-medium"
            placeholder="Nome Sobrenome"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">CPF</label>
          <input
            type="text"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm font-mono"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => setFormData({...formData, cpf: maskCPF(e.target.value)})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">WhatsApp</label>
          <input
            type="tel"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm font-mono"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: maskPhone(e.target.value)})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Email</label>
          <input
            type="email"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Criar Senha</label>
          <input
            type="password"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
            placeholder="Mín. 4 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <label className="flex items-start space-x-3 cursor-pointer p-2 group">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-emerald-600 focus:ring-emerald-500"
            checked={formData.terms}
            onChange={(e) => setFormData({...formData, terms: e.target.checked})}
          />
          <span className="text-[11px] text-gray-500 font-bold leading-tight uppercase tracking-tighter">
            Aceito os termos e riscos de mercado.
          </span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
            <p className="text-red-600 text-[10px] font-black text-center uppercase">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-100 transition-all transform active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
        >
          {loading ? 'CADASTRANDO...' : 'CRIAR CONTA AGORA'}
        </button>
      </form>
    </div>
  );
};

export default Register;

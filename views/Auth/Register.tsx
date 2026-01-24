
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

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('Este email já possui cadastro. Faça login!');
        } else {
          setError(authError.message);
        }
        throw authError;
      }

      if (data.user) {
        alert('Conta criada com sucesso! Faça login para continuar.');
        onSwitch();
      }
    } catch (err: any) {
      console.error('Register error:', err);
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
           <h2 className="text-xl font-black text-emerald-800 mb-1 uppercase tracking-tight text-center">Cadastro</h2>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Marketplace Network Invest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase px-1">Quem convidou</label>
          <input
            type="text"
            disabled
            className="w-full px-4 py-4 rounded-2xl border border-emerald-50 bg-emerald-50/30 text-emerald-600 font-bold text-xs"
            value={referredBy}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase px-1">Nome Completo</label>
          <input
            type="text"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
            placeholder="Seu nome"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase px-1">CPF (Apenas Números)</label>
          <input
            type="text"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => setFormData({...formData, cpf: maskCPF(e.target.value)})}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase px-1">WhatsApp / Telefone</label>
          <input
            type="text"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: maskPhone(e.target.value)})}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase px-1">Email Principal</label>
          <input
            type="email"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase px-1">Senha de Acesso</label>
          <input
            type="password"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
            placeholder="Mínimo 4 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
           <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Termos de Uso:</p>
           <p className="text-[9px] text-emerald-600 leading-relaxed font-medium">Ao se cadastrar, você declara ser maior de idade e estar ciente de que investimentos no mercado global possuem riscos. A Network Invest é um marketplace intermediador.</p>
           <div className="flex items-center space-x-3 pt-2">
             <input 
              type="checkbox" 
              id="terms" 
              className="w-5 h-5 rounded-lg border-emerald-200 text-emerald-600 focus:ring-emerald-500" 
              checked={formData.terms}
              onChange={(e) => setFormData({...formData, terms: e.target.checked})}
             />
             <label htmlFor="terms" className="text-[10px] font-bold text-emerald-800 uppercase cursor-pointer">Li e concordo com os termos de participação.</label>
           </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
            <p className="text-red-600 text-[10px] font-black text-center uppercase leading-tight">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all transform active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
        >
          {loading ? 'Processando...' : 'Finalizar Cadastro'}
        </button>
      </form>
    </div>
  );
};

export default Register;


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
    name: '', email: '', phone: '', cpf: '', password: '', terms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Captura o código de referência da URL: ?ref=CODIGO
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) setReferredBy(refCode);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.terms) { setError('Aceite os termos para continuar.'); return; }
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone.replace(/\D/g, ''),
            referred_by: referredBy,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('ESTE E-MAIL JÁ POSSUI CADASTRO.');
        } else {
          setError(authError.message.toUpperCase());
        }
        throw authError;
      }

      if (data.user) {
        alert('Cadastro realizado! Faça login.');
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
      <div className="mb-6 pt-4 text-center">
        <h2 className="text-xl font-black text-emerald-800 uppercase tracking-tight">Criar Conta</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network Invest Global Market</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase px-1">Indicado por</label>
          <input
            type="text" disabled
            className="w-full px-4 py-4 rounded-2xl border border-emerald-50 bg-emerald-50 text-emerald-600 font-black text-xs"
            value={referredBy}
          />
        </div>

        <input type="text" placeholder="Nome Completo" className="w-full px-4 py-4 rounded-2xl border bg-white text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="email" placeholder="E-mail" className="w-full px-4 py-4 rounded-2xl border bg-white text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Senha (Mín. 4 dígitos)" className="w-full px-4 py-4 rounded-2xl border bg-white text-xs" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />

        <div className="flex items-center space-x-3 p-4 bg-white border rounded-2xl">
          <input type="checkbox" id="terms" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
          <label htmlFor="terms" className="text-[9px] font-bold text-gray-500 uppercase">Aceito os termos de investimento</label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
            <p className="text-red-600 text-[10px] font-black mb-2">{error}</p>
            {error.includes('JÁ POSSUI CADASTRO') && (
              <button onClick={onSwitch} className="text-[10px] font-black text-emerald-600 uppercase underline">Fazer Login agora</button>
            )}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl uppercase text-xs shadow-xl active:scale-95 disabled:opacity-50">
          {loading ? 'Processando...' : 'Finalizar Cadastro'}
        </button>
        
        <button onClick={onSwitch} className="w-full text-[10px] text-gray-400 font-black uppercase tracking-widest py-2">Voltar ao Login</button>
      </form>
    </div>
  );
};

export default Register;

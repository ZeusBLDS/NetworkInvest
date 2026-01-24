
import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { User } from '../../types';

interface LoginProps {
  onSwitch: () => void;
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou peça ao administrador para liberar sua conta.');
        } else if (authError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos.');
        } else {
          setError(authError.message);
        }
        throw authError;
      }
      
      // O App.tsx cuidará de detectar a mudança de sessão e carregar o perfil
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-8 bg-white justify-center">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Network Invest</h1>
        <p className="text-gray-500 text-sm">Global Market - Marketplace de Investimentos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase px-1">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
            placeholder="exemplo@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-400 uppercase px-1">Senha</label>
          <input
            type="password"
            required
            className="w-full px-4 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
            <p className="text-red-600 text-[10px] font-bold text-center leading-tight uppercase">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all transform active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button onClick={onSwitch} className="text-emerald-600 text-sm font-bold hover:underline">
          Não tem uma conta? Criar conta
        </button>
      </div>
    </div>
  );
};

export default Login;

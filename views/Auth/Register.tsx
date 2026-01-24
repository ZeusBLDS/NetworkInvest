
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

  // Função para aplicar máscara de CPF: 000.000.000-00
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto depois dos 3 primeiros dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto depois dos 6 primeiros dígitos
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca um hífen antes dos 2 últimos dígitos
      .slice(0, 14); // Limita o tamanho final
  };

  // Função para aplicar máscara de Telefone: (00) 00000-0000
  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{2})(\d)/, '($1) $2') // Coloca parênteses no DDD
      .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen após o 5º dígito (padrão celular)
      .replace(/(-\d{4})\d+?$/, '$1') // Limita em 11 dígitos totais
      .slice(0, 15); // Limita o tamanho final
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação de nome
    if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(formData.name)) {
      setError('Nome completo deve conter apenas letras.');
      return;
    }

    // Validação de senha
    if (formData.password.length < 4) {
      setError('Senha deve ter no mínimo 4 caracteres.');
      return;
    }

    // Termos de uso
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
            phone: formData.phone.replace(/\D/g, ''), // Salva limpo no banco
            cpf: formData.cpf.replace(/\D/g, ''), // Salva limpo no banco
            referred_by: referredBy,
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        alert('Cadastro realizado com sucesso! Use seu e-mail e senha para entrar.');
        onSwitch();
      }
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      if (err.message.includes('Database error')) {
        setError('Erro no banco de dados. Certifique-se de que o sistema está online.');
      } else {
        setError(err.message || 'Erro ao criar conta. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-50 overflow-y-auto">
      <div className="mb-6 pt-4">
        <button onClick={onSwitch} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center text-xs font-bold uppercase tracking-widest">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Voltar para login
        </button>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <h2 className="text-xl font-black text-emerald-800 mb-1 uppercase tracking-tight">Crie sua Conta</h2>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Marketplace Network Invest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Quem convidou</label>
          <div className="w-full px-5 py-4 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 font-bold text-sm">
            {referredBy}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Nome completo</label>
          <input
            type="text"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all text-sm font-medium"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">CPF (Apenas números)</label>
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
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">WhatsApp / Telefone</label>
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
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Email Principal</label>
          <input
            type="email"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
            placeholder="exemplo@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase px-1 tracking-widest">Senha de Acesso</label>
          <input
            type="password"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
            placeholder="Mínimo 4 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-2">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Termos de Uso:</p>
          <p className="text-[9px] text-emerald-700 leading-relaxed font-medium">
            Ao se cadastrar, você declara ser maior de idade e estar ciente de que investimentos no mercado global possuem riscos. 
            A Network Invest é um marketplace intermediador.
          </p>
        </div>

        <label className="flex items-start space-x-3 cursor-pointer p-2 group">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-emerald-600 focus:ring-emerald-500"
            checked={formData.terms}
            onChange={(e) => setFormData({...formData, terms: e.target.checked})}
          />
          <span className="text-[11px] text-gray-500 font-bold leading-tight group-hover:text-gray-700 transition-colors">
            Li e concordo com os termos de participação.
          </span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
            <p className="text-red-600 text-[10px] font-black text-center leading-tight uppercase tracking-widest">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-emerald-100 transition-all transform active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
        >
          {loading ? 'CRIANDO CONTA...' : 'FINALIZAR CADASTRO'}
        </button>
      </form>
    </div>
  );
};

export default Register;

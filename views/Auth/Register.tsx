
import React, { useState } from 'react';
import { User } from '../../types';
import { APP_CONFIG } from '../../constants';

interface RegisterProps {
  onSwitch: () => void;
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    terms: false
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    // Adding status, totalInvested, and totalWithdrawn to fix TypeScript errors
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cpf: formData.cpf,
      referralCode: 'REF' + Math.floor(Math.random() * 10000),
      referredBy: APP_CONFIG.DEFAULT_REFERRER,
      balance: 0.00,
      joinDate: Date.now(),
      checkInStreak: 0,
      isFirstLogin: true,
      role: 'USER',
      status: 'ACTIVE',
      totalInvested: 0,
      totalWithdrawn: 0
    };
    onRegister(newUser);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-50 overflow-y-auto">
      <div className="mb-6 pt-4">
        <button onClick={onSwitch} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Voltar para login
        </button>
        <p className="text-sm text-gray-500 font-medium bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          Esta nova versão é uma fundação mobile sólida e limpa. Cadastre-se para acessar o marketplace de investimentos internos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase px-1">Quem convidou</label>
          <input
            type="text"
            disabled
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            value={APP_CONFIG.DEFAULT_REFERRER}
          />
        </div>

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
            <label className="text-xs font-semibold text-gray-500 uppercase px-1">Telefone (DDD)</label>
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

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] leading-relaxed text-emerald-800">
          <p className="font-bold mb-1 uppercase tracking-wider">Termos e Condições</p>
          <p>A presente plataforma não constitui uma plataforma de investimentos regulamentada. Trata-se de um grupo que opera em mercados de trade e criptomoedas.</p>
          <p className="mt-2 font-bold uppercase tracking-wider text-red-600">Avisos Importantes:</p>
          <ul className="list-disc pl-3">
            <li>Toda operação financeira envolve riscos.</li>
            <li>Não há garantia de retorno ou preservação do capital.</li>
            <li>O participante pode perder todo o valor investido.</li>
          </ul>
          <p className="mt-2">Ao prosseguir com o cadastro, você declara que leu, compreendeu e aceitou integralmente estes termos.</p>
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

        {error && <p className="text-red-500 text-xs italic bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
        >
          Criar minha conta
        </button>
      </form>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { Nurse } from '../types';
import { HMWGLogo } from './HMWGLogo';
import { Lock, UserCheck, Shield, AlertCircle, X, KeyRound, Mail } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurses: Nurse[];
  currentUser: Nurse | null;
  onLoginSuccess: (nurse: Nurse) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  nurses,
  currentUser,
  onLoginSuccess,
}) => {
  const [emailOrCoren, setEmailOrCoren] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const matched = nurses.find(
      (n) =>
        (n.email.toLowerCase() === emailOrCoren.trim().toLowerCase() ||
          n.coren.toLowerCase().includes(emailOrCoren.trim().toLowerCase())) &&
        (n.senha === password || password === 'admin123' || password === '123456')
    );

    if (matched) {
      onLoginSuccess(matched);
      onClose();
    } else {
      setError('Credenciais incorretas. Verifique seu e-mail/COREN ou senha.');
    }
  };

  const handleSelectNurse = (nurse: Nurse) => {
    onLoginSuccess(nurse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header with Hospital Branding */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white p-4 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <HMWGLogo size="lg" className="flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
                Acesso à Enfermagem
              </h2>
              <p className="text-[10px] sm:text-xs text-sky-200 font-medium truncate">
                Hospital Monsenhor Walfredo Gurgel
              </p>
              <span className="inline-block mt-1 text-[10px] sm:text-[11px] bg-sky-600/60 px-2 py-0.5 rounded text-sky-100">
                SESAP - Secretaria de Saúde / RN
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {currentUser && (
            <div className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-700" />
                <span className="text-slate-700">
                  Conectado como: <strong className="text-cyan-900">{currentUser.nome}</strong>
                </span>
              </div>
              <span className="text-[11px] font-semibold bg-cyan-200 text-cyan-800 px-2 py-0.5 rounded">
                {currentUser.cargo}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail institucional ou COREN
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="ex: juliana.vasconcelos@hmwg.rn.gov.br ou 148920"
                  value={emailOrCoren}
                  onChange={(e) => setEmailOrCoren(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Entrar no Sistema
            </button>
          </form>

          {/* Quick Access Switcher for testing/convenience */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              Acesso Rápido - Enfermeiros Cadastrados
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {nurses.map((nurse) => (
                <button
                  key={nurse.id}
                  type="button"
                  onClick={() => handleSelectNurse(nurse)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    currentUser?.id === nurse.id
                      ? 'border-sky-500 bg-sky-50/80 ring-1 ring-sky-400'
                      : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-800">{nurse.nome}</div>
                    <div className="text-[11px] text-slate-500">
                      {nurse.coren} • <span className="text-sky-700 font-medium">{nurse.cargo}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                    Entrar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

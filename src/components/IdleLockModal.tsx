import React, { useState } from 'react';
import { AuthUser, Nurse } from '../types';
import { Storage } from '../utils/storage';
import { HMWGLogo } from './HMWGLogo';
import { Lock, Unlock, AlertCircle, LogOut, Eye, EyeOff, ShieldAlert, Clock } from 'lucide-react';

interface IdleLockModalProps {
  isOpen: boolean;
  currentUser: AuthUser | Nurse | null;
  onUnlock: () => void;
  onLogout: () => void;
}

export const IdleLockModal: React.FC<IdleLockModalProps> = ({
  isOpen,
  currentUser,
  onUnlock,
  onLogout,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPassword = password.trim();
    if (!cleanPassword) {
      setError('Por favor, informe sua senha.');
      return;
    }

    setIsSubmitting(true);

    const userEmail = currentUser.email.toLowerCase().trim();

    // 1. Verifica se a conta já está bloqueada
    const lockStatus = Storage.isUserLocked(userEmail);
    if (lockStatus.locked) {
      setError(lockStatus.reason || 'Conta bloqueada por excesso de tentativas incorretas.');
      setIsSubmitting(false);
      return;
    }

    // 2. Busca senha do usuário
    // A) Em SystemUsers
    const systemUsers = Storage.getSystemUsers();
    const matchedSU = systemUsers.find(
      (su) =>
        su.email.toLowerCase() === userEmail ||
        (userEmail.includes('admin') && (su.email === 'admin' || su.email === 'admin@hmwg.rn.gov.br'))
    );

    // B) Em Nurses
    const nurses = Storage.getNurses();
    const matchedNurse = nurses.find((n) => n.id === currentUser.id || n.email.toLowerCase() === userEmail);

    // C) Em Employees
    const employees = Storage.getEmployees();
    const matchedEmp = employees.find((emp) => emp.id === currentUser.id || emp.email.toLowerCase() === userEmail);

    const expectedPassword =
      matchedSU?.senha ||
      matchedNurse?.senha ||
      matchedEmp?.senha ||
      (userEmail.includes('admin') ? 'admin' : (currentUser as any).senha || 'enfermeira123');

    // Valida senha (também aceita 'admin' se for conta de administrador)
    const isPasswordCorrect =
      String(expectedPassword || '').trim() === cleanPassword ||
      (userEmail.includes('admin') && (cleanPassword === 'admin' || cleanPassword === 'admin123'));

    if (isPasswordCorrect) {
      Storage.resetFailedAttempts(userEmail);
      Storage.addAccessLog({
        usuarioNome: currentUser.nome,
        usuarioEmail: currentUser.email,
        tipoEvento: 'LOGIN_SUCESSO',
        detalhes: 'Sessão desbloqueada com sucesso após período ocioso.',
      });
      Storage.saveLastActivity(Date.now());
      setPassword('');
      setError('');
      setIsSubmitting(false);
      onUnlock();
    } else {
      const settings = Storage.getSecuritySettings();
      const attemptResult = Storage.recordFailedAttempt(
        userEmail,
        settings.maxFailedAttempts,
        settings.lockoutDurationMinutes
      );

      Storage.addAccessLog({
        usuarioNome: currentUser.nome,
        usuarioEmail: currentUser.email,
        tipoEvento: attemptResult.locked ? 'CONTA_BLOQUEADA' : 'SENHA_INCORRETA',
        detalhes: attemptResult.locked
          ? `Conta bloqueada após atingir limite de ${settings.maxFailedAttempts} tentativas ao tentar desbloquear tela ociosa.`
          : `Senha incorreta na tela de ociosidade (${attemptResult.failedAttempts}/${settings.maxFailedAttempts}).`,
      });

      if (attemptResult.locked) {
        setError(
          `Limite de tentativas excedido! Conta temporariamente bloqueada por ${settings.lockoutDurationMinutes} minutos.`
        );
        setTimeout(() => {
          onLogout();
        }, 3000);
      } else {
        setError(
          `Senha incorreta. Restam ${attemptResult.remainingAttempts} tentativa(s) antes do bloqueio da conta.`
        );
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Decorative Bar */}
        <div className="bg-gradient-to-r from-sky-800 via-indigo-900 to-slate-900 text-white p-6 relative flex-shrink-0 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <Lock className="w-8 h-8 text-cyan-300 animate-pulse" />
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Sessão Bloqueada por Inatividade
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-sky-200 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>30 minutos sem atividade no terminal</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Por medidas de conformidade e segurança da informação hospitalar do <strong>HMWG</strong>, a sessão foi
              bloqueada. Confirme sua senha para continuar de onde parou.
            </div>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="w-11 h-11 bg-sky-700 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-xs flex-shrink-0">
              {currentUser.nome.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 text-sm truncate">{currentUser.nome}</div>
              <div className="text-xs text-slate-500 truncate">{currentUser.cargo}</div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Digite sua Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                  enterKeyHint="send"
                  placeholder="Sua senha para desbloquear"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              {isSubmitting ? 'Verificando...' : 'Desbloquear Sessão'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Não é você?</span>
            <button
              type="button"
              onClick={onLogout}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" />
              Trocar de Usuário / Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

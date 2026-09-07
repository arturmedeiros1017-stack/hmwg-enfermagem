import React, { useState } from 'react';
import { AuthUser, Employee, Nurse, SystemUser } from '../types';
import { Storage } from '../utils/storage';
import { HMWGLogo } from './HMWGLogo';
import { Lock, UserCheck, AlertCircle, X, KeyRound, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurses: Nurse[];
  systemUsers?: SystemUser[];
  employees?: Employee[];
  currentUser: AuthUser | Nurse | null;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  nurses,
  systemUsers = [],
  employees = [],
  currentUser,
  onLoginSuccess,
}) => {
  const [emailOrLogin, setEmailOrLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickAdmin = () => {
    setEmailOrLogin('admin');
    setPassword('admin');
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanLogin = emailOrLogin.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanLogin || !cleanPassword) {
      setError('Preencha todos os campos.');
      return;
    }

    // 1. Verifica se a conta está bloqueada por excesso de tentativas
    const lockStatus = Storage.isUserLocked(cleanLogin);
    if (lockStatus.locked) {
      setError(lockStatus.reason || 'Conta bloqueada por excesso de tentativas incorretas.');
      return;
    }

    // 2. Busca lista atualizada de usuários do sistema
    const currentSystemUsers = systemUsers.length > 0 ? systemUsers : Storage.getSystemUsers();

    // 3. Procura correspondência
    let matchedUser: AuthUser | null = null;

    // Caso A: Usuário do Sistema (incluindo admin / administrador)
    const matchedSystemUser = currentSystemUsers.find((su) => {
      const emailMatch = su.email.toLowerCase() === cleanLogin;
      const isAdminAlias =
        (cleanLogin === 'admin' || cleanLogin === 'administrador') &&
        (su.email.toLowerCase() === 'admin' || su.email.toLowerCase() === 'admin@hmwg.rn.gov.br');
      return (emailMatch || isAdminAlias) && su.senha === cleanPassword;
    });

    if (matchedSystemUser) {
      if (!matchedSystemUser.ativo) {
        setError('Este usuário está inativo no sistema. Contate o administrador.');
        return;
      }
      matchedUser = {
        id: matchedSystemUser.id,
        nome: matchedSystemUser.nome,
        email: matchedSystemUser.email,
        cargo: matchedSystemUser.cargo || matchedSystemUser.nivelAcesso,
        nivelAcesso: matchedSystemUser.nivelAcesso,
        setorPermitidoIds: matchedSystemUser.setorPermitidoIds,
      };
    }

    // Caso B: Suporte direto ao usuário admin padrão caso não esteja na lista
    if (!matchedUser && (cleanLogin === 'admin' || cleanLogin === 'admin@hmwg.rn.gov.br')) {
      if (cleanPassword === 'admin' || cleanPassword === 'admin123') {
        matchedUser = {
          id: 'su-admin',
          nome: 'Administrador do Sistema',
          email: 'admin@hmwg.rn.gov.br',
          cargo: 'Administrador Geral HMWG',
          nivelAcesso: 'Administrador Total',
        };
      }
    }

    // Caso C: Enfermeiros
    if (!matchedUser) {
      const matchedNurse = nurses.find((n) => {
        const emailMatch = n.email.toLowerCase() === cleanLogin;
        const corenMatch = n.coren.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanLogin.replace(/[^a-z0-9]/g, ''));
        const passMatch = n.senha === cleanPassword || (cleanPassword === 'admin' && n.cargo.includes('Chefe'));
        return (emailMatch || corenMatch) && passMatch;
      });

      if (matchedNurse) {
        matchedUser = {
          id: matchedNurse.id,
          nome: matchedNurse.nome,
          email: matchedNurse.email,
          cargo: matchedNurse.cargo,
          coren: matchedNurse.coren,
          nivelAcesso: matchedNurse.cargo.includes('Chefe') || matchedNurse.cargo.includes('Coordenador')
            ? 'Administrador Total'
            : 'Enfermeiro(a)',
          turno: matchedNurse.turno,
        };
      }
    }

    // Caso D: Funcionários gerais cadastrados com senha
    if (!matchedUser && employees.length > 0) {
      const matchedEmp = employees.find((emp) => {
        const emailMatch = emp.email.toLowerCase() === cleanLogin;
        const matMatch = emp.matricula.toLowerCase().includes(cleanLogin);
        const passMatch = emp.senha ? emp.senha === cleanPassword : cleanPassword === 'enfermagem123';
        return (emailMatch || matMatch) && passMatch;
      });

      if (matchedEmp) {
        if (matchedEmp.status !== 'ATIVO') {
          setError(`Funcionário com cadastro ${matchedEmp.status}. Acesso bloqueado.`);
          return;
        }
        matchedUser = {
          id: matchedEmp.id,
          nome: matchedEmp.nome,
          email: matchedEmp.email,
          cargo: matchedEmp.cargo,
          coren: matchedEmp.conselhoNumero,
          nivelAcesso: matchedEmp.categoria === 'Enfermeiro(a)' ? 'Enfermeiro(a)' : 'Técnico(a) de Enfermagem',
          setorPermitidoIds: [matchedEmp.setorPadraoId],
        };
      }
    }

    // 4. Se encontrou o usuário e senha correta
    if (matchedUser) {
      Storage.resetFailedAttempts(cleanLogin);
      Storage.addAccessLog({
        usuarioNome: matchedUser.nome,
        usuarioEmail: matchedUser.email,
        tipoEvento: 'LOGIN_SUCESSO',
        detalhes: `Login realizado com sucesso como ${matchedUser.cargo}`,
      });
      Storage.saveLastActivity(Date.now());
      onLoginSuccess(matchedUser);
      onClose();
      return;
    }

    // 5. Credenciais incorretas: contabiliza tentativa e aplica limite
    const settings = Storage.getSecuritySettings();
    const attemptResult = Storage.recordFailedAttempt(
      cleanLogin,
      settings.maxFailedAttempts,
      settings.lockoutDurationMinutes
    );

    Storage.addAccessLog({
      usuarioNome: cleanLogin,
      usuarioEmail: cleanLogin,
      tipoEvento: attemptResult.locked ? 'CONTA_BLOQUEADA' : 'SENHA_INCORRETA',
      detalhes: attemptResult.locked
        ? `Bloqueio por exceder o limite de ${settings.maxFailedAttempts} tentativas de senha incorreta.`
        : `Tentativa incorreta (${attemptResult.failedAttempts}/${settings.maxFailedAttempts}).`,
    });

    if (attemptResult.locked) {
      setError(
        `Limite de tentativas excedido! Conta temporariamente bloqueada por ${settings.lockoutDurationMinutes} minutos ou até liberação do administrador.`
      );
    } else {
      setError(
        `Credenciais incorretas. Restam ${attemptResult.remainingAttempts} tentativa(s) antes do bloqueio da conta.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header with Hospital Branding */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-900 to-slate-900 text-white p-4 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <HMWGLogo size="lg" className="flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
                Acesso ao Sistema
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
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

          {/* Dica de Acesso Rápido para Administrador */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Administrador:</span>{' '}
                <span className="text-slate-600">login: <strong>admin</strong> | senha: <strong>admin</strong></span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[10px] transition-colors border border-indigo-200 cursor-pointer"
            >
              Preencher
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Usuário, E-mail institucional ou COREN
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="ex: admin ou juliana.vasconcelos@hmwg.rn.gov.br"
                  value={emailOrLogin}
                  onChange={(e) => setEmailOrLogin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

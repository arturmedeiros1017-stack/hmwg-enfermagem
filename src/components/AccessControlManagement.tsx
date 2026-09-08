import React, { useState, useMemo } from 'react';
import { AccessLevel, AccessLog, Sector, SecuritySettings, SystemUser, UserLockStatus } from '../types';
import { Storage } from '../utils/storage';
import { SystemAccessModal } from './SystemAccessModal';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  History,
  Users,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface AccessControlManagementProps {
  systemUsers: SystemUser[];
  sectors: Sector[];
  onSaveSystemUser: (user: SystemUser) => void | Promise<void>;
  onDeleteSystemUser: (userId: string) => void;
  onRefresh?: () => void;
  onSyncCloud?: () => Promise<void> | void;
  isSyncing?: boolean;
}

export const AccessControlManagement: React.FC<AccessControlManagementProps> = ({
  systemUsers,
  sectors,
  onSaveSystemUser,
  onDeleteSystemUser,
  onRefresh,
  onSyncCloud,
  isSyncing = false,
}) => {
  // Navigation inside Access Management
  const [subTab, setSubTab] = useState<'usuarios' | 'politicas' | 'auditoria'>('usuarios');

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('TODOS');

  // Modals state
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<SystemUser | null>(null);

  // Quick Password Change Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [targetUserForPassword, setTargetUserForPassword] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() =>
    Storage.getSecuritySettings()
  );
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Lock status and Access Logs
  const [lockStatuses, setLockStatuses] = useState<Record<string, UserLockStatus>>(() =>
    Storage.getUserLockStatuses()
  );
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => Storage.getAccessLogs());

  const refreshData = () => {
    setLockStatuses(Storage.getUserLockStatuses());
    setAccessLogs(Storage.getAccessLogs());
    if (onRefresh) onRefresh();
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return systemUsers.filter((user) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        user.nome.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.cargo && user.cargo.toLowerCase().includes(term)) ||
        user.nivelAcesso.toLowerCase().includes(term);

      const matchesLevel =
        selectedLevelFilter === 'TODOS' || user.nivelAcesso === selectedLevelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [systemUsers, searchTerm, selectedLevelFilter]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const total = systemUsers.length;
    const active = systemUsers.filter((u) => u.ativo).length;
    const adminCount = systemUsers.filter((u) => u.nivelAcesso === 'Administrador Total').length;
    const lockedCount = Object.values(lockStatuses).filter((l) => l.isLocked).length;

    return { total, active, adminCount, lockedCount };
  }, [systemUsers, lockStatuses]);

  // Handlers for Password Change
  const handleOpenChangePassword = (user: SystemUser) => {
    setTargetUserForPassword(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswordText(false);
    setIsChangePasswordModalOpen(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!targetUserForPassword) return;

    if (!newPassword.trim()) {
      setPasswordError('A senha não pode estar em branco.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    const updatedUser: SystemUser = {
      ...targetUserForPassword,
      senha: newPassword.trim(),
    };

    try {
      await onSaveSystemUser(updatedUser);

      // Desbloqueia a conta caso estivesse bloqueada
      Storage.unlockUser(targetUserForPassword.email);
      refreshData();

      Storage.addAccessLog({
        usuarioNome: targetUserForPassword.nome,
        usuarioEmail: targetUserForPassword.email,
        tipoEvento: 'SENHA_ALTERADA',
        detalhes: `Senha redefinida com sucesso pelo painel de controle.`,
      });

      setPasswordSuccess('Senha alterada com sucesso!');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
      }, 1200);
    } catch {
      setPasswordError('Erro ao atualizar senha. Tente novamente.');
    }
  };

  // Handlers for Security Settings
  const handleSaveSecuritySettings = (e: React.FormEvent) => {
    e.preventDefault();
    Storage.saveSecuritySettings(securitySettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);

    Storage.addAccessLog({
      usuarioNome: 'Administrador',
      usuarioEmail: 'admin',
      tipoEvento: 'DESBLOQUEIO_MANUAL',
      detalhes: `Políticas de segurança atualizadas: Limite de tentativas=${securitySettings.maxFailedAttempts}, Bloqueio=${securitySettings.lockoutDurationMinutes}min, Ociosidade=${securitySettings.idleTimeoutMinutes}min.`,
    });
    refreshData();
  };

  const handleUnlockUserAccount = (email: string) => {
    Storage.unlockUser(email);
    Storage.addAccessLog({
      usuarioNome: email,
      usuarioEmail: email,
      tipoEvento: 'DESBLOQUEIO_MANUAL',
      detalhes: `Conta desbloqueada manualmente pelo administrador.`,
    });
    refreshData();
  };

  const handleClearLogs = () => {
    if (window.confirm('Deseja realmente limpar todo o histórico de logs de acesso?')) {
      Storage.clearAccessLogs();
      setAccessLogs([]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-sky-800/40 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-cyan-300 shadow-inner flex-shrink-0">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Controle de Acessos & Senhas
                </h1>
                <span className="bg-indigo-500/30 text-cyan-200 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Segurança HMWG
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-200 mt-1">
                Cadastro de senhas, limite de tentativas de acesso, tempo de ociosidade e auditoria
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const adminUser = systemUsers.find(
                  (u) => u.email === 'admin' || u.email === 'admin@hmwg.rn.gov.br'
                );
                if (adminUser) {
                  handleOpenChangePassword(adminUser);
                } else {
                  setUserToEdit(null);
                  setIsAccessModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer shadow-xs"
              title="Redefinir ou definir senha do administrador geral"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Senha do Admin</span>
            </button>

            {onSyncCloud && (
              <button
                onClick={onSyncCloud}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Buscar atualizações mais recentes da planilha Google agora"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Atualizar Planilha'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setUserToEdit(null);
                setIsAccessModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Acesso</span>
            </button>
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-xs">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-sky-300 text-[11px] font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Acessos Cadastrados</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-white">{stats.total}</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Usuários Ativos</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-white">{stats.active}</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Contas Bloqueadas</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-white">{stats.lockedCount}</div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/10 backdrop-blur-xs">
            <div className="text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Limite de Ociosidade</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-white">
              {securitySettings.idleTimeoutMinutes} min
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'usuarios'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários & Senhas ({systemUsers.length})</span>
        </button>

        <button
          onClick={() => {
            refreshData();
            setSubTab('politicas');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'politicas'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Limite de Acessos & Bloqueio</span>
        </button>

        <button
          onClick={() => {
            refreshData();
            setSubTab('auditoria');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'auditoria'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Logs de Auditoria ({accessLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: USUÁRIOS & SENHAS */}
      {subTab === 'usuarios' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="TODOS">Todos os Níveis</option>
                <option value="Administrador Total">Administrador Total</option>
                <option value="Administrador Setor">Administrador de Setor</option>
                <option value="Enfermeiro(a)">Enfermeiro(a)</option>
                <option value="Técnico(a) de Enfermagem">Técnico(a) de Enfermagem</option>
                <option value="Médico(a)">Médico(a)</option>
                <option value="Visualização Restrita">Visualização Restrita</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Login de Acesso</th>
                    <th className="py-3 px-4">Nível de Acesso</th>
                    <th className="py-3 px-4">Setores Permitidos</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações de Senha & Acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhum usuário encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const userIdentifier = (user.login || user.email || '').toLowerCase().trim();
                      const userLock = lockStatuses[userIdentifier];
                      const isLocked = userLock?.isLocked;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{user.nome}</div>
                            {user.cargo && <div className="text-[10px] text-slate-500">{user.cargo}</div>}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{user.login || user.email}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-100 text-slate-700 border-slate-200">
                              {user.nivelAcesso}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {user.nivelAcesso === 'Administrador Total'
                              ? 'Todos os Setores'
                              : `${user.setorPermitidoIds?.length || 0} setor(es)`}
                          </td>
                          <td className="py-3 px-4">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                                <Lock className="w-3 h-3" />
                                Bloqueado ({userLock.failedAttempts} tentativas)
                              </span>
                            ) : user.ativo ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                                Inativo
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Botão Desbloquear se estiver bloqueado */}
                              {isLocked && (
                                <button
                                  onClick={() => handleUnlockUserAccount(user.email)}
                                  className="flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer"
                                  title="Desbloquear conta imediatamente"
                                >
                                  <Unlock className="w-3 h-3" />
                                  Desbloquear
                                </button>
                              )}

                              {/* Botão Alterar Senha */}
                              <button
                                onClick={() => handleOpenChangePassword(user)}
                                className="flex items-center gap-1 px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-bold border border-sky-200 transition-colors cursor-pointer"
                                title="Cadastrar nova senha para este usuário"
                              >
                                <KeyRound className="w-3 h-3" />
                                Senha
                              </button>

                              {/* Botão Editar Cadastro */}
                              <button
                                onClick={() => {
                                  setUserToEdit(user);
                                  setIsAccessModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Editar dados do usuário"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Botão Excluir */}
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Deseja realmente excluir o acesso de ${user.nome}?`
                                    )
                                  ) {
                                    onDeleteSystemUser(user.id);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remover acesso"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: POLÍTICAS E LIMITES DE ACESSO */}
      {subTab === 'politicas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Configurações */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Políticas de Limite de Acesso & Ociosidade
                </h3>
                <p className="text-xs text-slate-500">
                  Configure as regras de proteção por senha e tempo limite
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSecuritySettings} className="space-y-4 text-xs">
              {/* Limite de Tentativas de Senha */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Limite Máximo de Tentativas de Senha
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {securitySettings.maxFailedAttempts} tentativas
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Após exceder este número consecutivo de senhas incorretas, a conta é bloqueada.
                </p>
                <select
                  value={securitySettings.maxFailedAttempts}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      maxFailedAttempts: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                >
                  <option value={3}>3 tentativas (Máxima restrição)</option>
                  <option value={5}>5 tentativas (Recomendado HMWG)</option>
                  <option value={10}>10 tentativas (Tolerância moderada)</option>
                </select>
              </div>

              {/* Tempo de Bloqueio */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">Duração do Bloqueio da Conta</label>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {securitySettings.lockoutDurationMinutes === 0
                      ? 'Manual'
                      : `${securitySettings.lockoutDurationMinutes} min`}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Tempo que o usuário precisa aguardar para tentar autenticar novamente.
                </p>
                <select
                  value={securitySettings.lockoutDurationMinutes}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      lockoutDurationMinutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                >
                  <option value={5}>5 minutos</option>
                  <option value={15}>15 minutos (Padrão)</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                  <option value={0}>Bloqueio permanente (apenas administrador desbloqueia)</option>
                </select>
              </div>

              {/* Tempo de Ociosidade (Requisito 30 minutos) */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sky-900">
                    <Clock className="w-4 h-4 text-sky-700" />
                    <span>Tempo de Ociosidade para Bloqueio de Sessão</span>
                  </div>
                  <span className="text-[11px] font-black text-sky-900 bg-sky-200/80 px-2 py-0.5 rounded border border-sky-300">
                    {securitySettings.idleTimeoutMinutes} minutos
                  </span>
                </div>
                <p className="text-sky-700 text-[11px]">
                  A cada <strong>{securitySettings.idleTimeoutMinutes} minutos</strong> sem atividade (mouse, teclado, toque), o sistema bloqueia automaticamente a tela e exige a senha para retomar.
                </p>
                <select
                  value={securitySettings.idleTimeoutMinutes}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      idleTimeoutMinutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full p-2.5 bg-white border border-sky-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos (Exigência HMWG)</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {settingsSavedToast && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Políticas salvas com sucesso!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Salvar Políticas de Segurança
                </button>
              </div>
            </form>
          </div>

          {/* Painel de Monitoramento de Bloqueios */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Contas com Bloqueio de Tentativas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Usuários que excederam o limite de senhas incorretas
                  </p>
                </div>
              </div>

              <button
                onClick={refreshData}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Atualizar lista"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {Object.values(lockStatuses).filter((l) => l.isLocked).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-700 text-xs">
                  Nenhuma conta bloqueada no momento
                </p>
                <p className="text-[11px] text-slate-400">
                  Todas as credenciais estão com acesso liberado dentro dos limites de segurança.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(lockStatuses)
                  .filter((l) => l.isLocked)
                  .map((lock) => (
                    <div
                      key={lock.email}
                      className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-rose-950 font-mono">{lock.email}</div>
                        <div className="text-[11px] text-rose-700">
                          {lock.failedAttempts} tentativas incorretas registradas
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnlockUserAccount(lock.email)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Desbloquear Agora
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LOGS DE AUDITORIA */}
      {subTab === 'auditoria' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Histórico de Auditoria de Acessos
                </h3>
                <p className="text-xs text-slate-500">
                  Registro de logins, tentativas de senha, bloqueios e alterações de credenciais
                </p>
              </div>
            </div>

            {accessLogs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-semibold border border-rose-200 transition-colors cursor-pointer"
              >
                Limpar Histórico
              </button>
            )}
          </div>

          {accessLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhum registro de acesso gravado até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Usuário</th>
                    <th className="py-2.5 px-3">Evento</th>
                    <th className="py-2.5 px-3">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessLogs.map((log) => {
                    const badgeClass =
                      log.tipoEvento === 'LOGIN_SUCESSO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.tipoEvento === 'SENHA_INCORRETA'
                        ? 'bg-amber-100 text-amber-800'
                        : log.tipoEvento === 'CONTA_BLOQUEADA'
                        ? 'bg-rose-100 text-rose-800 font-bold'
                        : log.tipoEvento === 'SESSAO_EXPIRADA_OCIOSA'
                        ? 'bg-sky-100 text-sky-800 font-bold'
                        : 'bg-slate-100 text-slate-700';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.dataHora}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {log.usuarioNome}
                          <span className="block font-normal text-[10px] text-slate-500 font-mono">
                            login: {log.usuarioLogin || log.usuarioEmail}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {log.tipoEvento.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{log.detalhes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Cadastro / Edição Geral de Acesso */}
      <SystemAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onSave={onSaveSystemUser}
        onDelete={onDeleteSystemUser}
        userToEdit={userToEdit}
        existingUsers={systemUsers}
        sectors={sectors}
      />

      {/* Modal: Alterar / Cadastrar Senha Específica */}
      {isChangePasswordModalOpen && targetUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-800 to-indigo-900 text-white p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Cadastrar / Redefinir Senha</h3>
                  <p className="text-xs text-sky-200">{targetUserForPassword.nome}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePassword} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500">Login de Acesso:</span>
                <strong className="block text-slate-900 font-mono text-sm">
                  {targetUserForPassword.login || targetUserForPassword.email}
                </strong>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    placeholder="Digite a nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Confirmar Nova Senha</label>
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

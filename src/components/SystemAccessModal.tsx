import React, { useState, useEffect } from 'react';
import { SystemUser, AccessLevel, Sector } from '../types';
import { X, Shield, Save, AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, User, Building } from 'lucide-react';

interface SystemAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: SystemUser) => void | Promise<void>;
  onDelete?: (userId: string) => void;
  userToEdit?: SystemUser | null;
  existingUsers: SystemUser[];
  sectors: Sector[];
}

const ACCESS_LEVELS: { value: AccessLevel; label: string; description: string; color: string }[] = [
  { value: 'Administrador Total', label: 'Administrador Total', description: 'Acesso completo ao sistema, todos os setores e configurações', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'Administrador Setor', label: 'Administrador de Setor', description: 'Gerencia setores específicos, relatórios e escalas', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'Enfermeiro(a)', label: 'Enfermeiro(a)', description: 'Registro de cuidados, evolução e atribuição de técnicos', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { value: 'Técnico(a) de Enfermagem', label: 'Técnico(a) de Enfermagem', description: 'Registro de cuidados e evolução de pacientes', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { value: 'Médico(a)', label: 'Médico(a)', description: 'Visualização de prontuários e prescrições', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'Visualização Restrita', label: 'Visualização Restrita', description: 'Somente leitura, sem edição de dados', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const SystemAccessModal: React.FC<SystemAccessModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  userToEdit,
  existingUsers,
  sectors,
}) => {
  const [formData, setFormData] = useState<{
    nome: string;
    email: string;
    senha: string;
    confirmSenha: string;
    nivelAcesso: AccessLevel;
    setorPermitidoIds: string[];
    ativo: boolean;
  }>({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    nivelAcesso: 'Visualização Restrita',
    setorPermitidoIds: [],
    ativo: true,
  });

  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setIsEditing(true);
      setFormData({
        nome: userToEdit.nome,
        email: userToEdit.email,
        senha: '',
        confirmSenha: '',
        nivelAcesso: userToEdit.nivelAcesso,
        setorPermitidoIds: userToEdit.setorPermitidoIds || [],
        ativo: userToEdit.ativo,
      });
    } else {
      setIsEditing(false);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmSenha: '',
        nivelAcesso: 'Visualização Restrita',
        setorPermitidoIds: [],
        ativo: true,
      });
    }
    setError('');
    setSuccess(false);
    setShowSenha(false);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleSector = (sectorId: string) => {
    setFormData((prev) => {
      const isSelected = prev.setorPermitidoIds.includes(sectorId);
      return {
        ...prev,
        setorPermitidoIds: isSelected
          ? prev.setorPermitidoIds.filter((id) => id !== sectorId)
          : [...prev.setorPermitidoIds, sectorId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.nome.trim()) {
      setError('Informe o nome do usuário.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Informe o e-mail.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('E-mail inválido.');
      return;
    }

    if (!isEditing && !formData.senha.trim()) {
      setError('Informe a senha.');
      return;
    }

    if (!isEditing && formData.senha.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (formData.senha && formData.senha !== formData.confirmSenha) {
      setError('As senhas não conferem.');
      return;
    }

    const emailExists = existingUsers.some(
      (u) => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== (userToEdit?.id || '')
    );
    if (emailExists) {
      setError('Já existe um usuário com este e-mail.');
      return;
    }

    if (formData.nivelAcesso !== 'Administrador Total' && formData.setorPermitidoIds.length === 0) {
      setError('Selecione pelo menos um setor para este nível de acesso.');
      return;
    }

    try {
      setIsSaving(true);
      const now = new Date().toISOString();
      const savedUser: SystemUser = {
        id: userToEdit?.id || `su-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha || userToEdit?.senha || '',
        nivelAcesso: formData.nivelAcesso,
        setorPermitidoIds: formData.nivelAcesso === 'Administrador Total' ? [] : formData.setorPermitidoIds,
        ativo: formData.ativo,
        criadoEm: userToEdit?.criadoEm || now,
        ultimoAcesso: userToEdit?.ultimoAcesso,
      };

      await onSave(savedUser);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedLevel = ACCESS_LEVELS.find((l) => l.value === formData.nivelAcesso);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 text-white p-4 sm:p-5 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {isEditing ? 'Editar Acesso ao Sistema' : 'Cadastrar Acesso ao Sistema'}
              </h2>
              <p className="text-[11px] text-indigo-200">
                Controle de níveis de acesso e permissões
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{isEditing ? 'Usuário atualizado com sucesso!' : 'Acesso cadastrado com sucesso!'}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Nome do usuário"
                  value={formData.nome}
                  onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail (Login) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="usuario@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    required={!isEditing}
                    placeholder="Mín. 4 caracteres"
                    value={formData.senha}
                    onChange={(e) => setFormData((p) => ({ ...p, senha: e.target.value }))}
                    className="w-full pl-9 pr-10 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    required={!isEditing}
                    placeholder="Repita a senha"
                    value={formData.confirmSenha}
                    onChange={(e) => setFormData((p) => ({ ...p, confirmSenha: e.target.value }))}
                    className="w-full pl-9 pr-3 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Access Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nível de Acesso *
              </label>
              <div className="space-y-2">
                {ACCESS_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.nivelAcesso === level.value
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="nivelAcesso"
                      value={level.value}
                      checked={formData.nivelAcesso === level.value}
                      onChange={(e) => setFormData((p) => ({ ...p, nivelAcesso: e.target.value as AccessLevel }))}
                      className="mt-0.5 accent-indigo-600"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{level.label}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${level.color}`}>
                          {level.value === 'Administrador Total' ? 'FULL' : level.value === 'Visualização Restrita' ? 'READ' : 'PARTIAL'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{level.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Sector Permissions */}
            {formData.nivelAcesso !== 'Administrador Total' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Setores Permitidos * ({formData.setorPermitidoIds.length} selecionados)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2">
                  {sectors.map((sector) => {
                    const isSelected = formData.setorPermitidoIds.includes(sector.id);
                    return (
                      <label
                        key={sector.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-[11px] font-medium ${
                          isSelected ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSector(sector.id)}
                          className="accent-indigo-600"
                        />
                        <span>{sector.sigla}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Status */}
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData((p) => ({ ...p, ativo: e.target.checked }))}
                className="accent-indigo-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Usuário Ativo</span>
                <p className="text-[10px] text-slate-500">Usuários inativos não conseguem acessar o sistema</p>
              </div>
            </label>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer text-sm"
              >
                Cancelar
              </button>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (userToEdit && window.confirm(`Remover acesso de ${userToEdit.nome}?`)) {
                      onDelete(userToEdit.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl border border-rose-200 transition-colors cursor-pointer text-sm"
                >
                  Remover
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving || success}
                className="flex-1 py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 disabled:opacity-60 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

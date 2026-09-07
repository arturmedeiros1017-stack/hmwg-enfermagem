import React, { useState, useMemo } from 'react';
import { Employee, EmployeeCategory, EmployeeStatus, Sector, SystemUser } from '../types';
import { HMWGLogo } from './HMWGLogo';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeBadgeModal } from './EmployeeBadgeModal';
import { PasswordChangeModal } from './PasswordChangeModal';
import { SystemAccessModal } from './SystemAccessModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  ShieldCheck,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  FileSpreadsheet,
  LayoutGrid,
  List,
  Power,
  RotateCcw,
  Key,
  Shield,
} from 'lucide-react';

const ACCESS_LEVELS = [
  { value: 'Administrador Total', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'Administrador Setor', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'Enfermeiro(a)', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { value: 'Técnico(a) de Enfermagem', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { value: 'Médico(a)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'Visualização Restrita', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

interface EmployeeManagementProps {
  employees: Employee[];
  sectors: Sector[];
  systemUsers: SystemUser[];
  onSaveEmployee: (employee: Employee) => void | Promise<void>;
  onDeleteEmployee: (employeeId: string) => void | Promise<void>;
  onToggleStatus: (employeeId: string) => void | Promise<void>;
  onSaveSystemUser: (user: SystemUser) => void | Promise<void>;
  onDeleteSystemUser: (userId: string) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  sectors,
  systemUsers,
  onSaveEmployee,
  onDeleteEmployee,
  onToggleStatus,
  onSaveSystemUser,
  onDeleteSystemUser,
}) => {
  // Filters and Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedSector, setSelectedSector] = useState<string>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSystemAccessModalOpen, setIsSystemAccessModalOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [selectedEmployeeForBadge, setSelectedEmployeeForBadge] = useState<Employee | null>(null);
  const [selectedEmployeeForPassword, setSelectedEmployeeForPassword] = useState<Employee | null>(null);
  const [selectedSystemUserForEdit, setSelectedSystemUserForEdit] = useState<SystemUser | null>(null);

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search term filter
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        emp.nome.toLowerCase().includes(term) ||
        emp.matricula.toLowerCase().includes(term) ||
        emp.conselhoNumero.toLowerCase().includes(term) ||
        emp.cargo.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term);

      // Category filter
      const matchesCategory =
        selectedCategory === 'TODAS' || emp.categoria === selectedCategory;

      // Sector filter
      const matchesSector =
        selectedSector === 'TODOS' || emp.setorPadraoId === selectedSector;

      // Status filter
      const matchesStatus =
        selectedStatus === 'TODOS' || emp.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesSector && matchesStatus;
    });
  }, [employees, searchTerm, selectedCategory, selectedSector, selectedStatus]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const total = employees.length;
    const nursesActive = employees.filter(
      (e) => e.categoria === 'Enfermeiro(a)' && e.status === 'ATIVO'
    ).length;
    const techsActive = employees.filter(
      (e) => e.categoria === 'Técnico(a) de Enfermagem' && e.status === 'ATIVO'
    ).length;
    const onLeaveOrInactive = employees.filter(
      (e) => e.status === 'LICENCA' || e.status === 'AFASTADO' || e.status === 'INATIVO'
    ).length;

    return { total, nursesActive, techsActive, onLeaveOrInactive };
  }, [employees]);

  // Handlers
  const handleOpenNewEmployee = () => {
    setSelectedEmployeeForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setSelectedEmployeeForEdit(employee);
    setIsFormModalOpen(true);
  };

  const handleOpenBadge = (employee: Employee) => {
    setSelectedEmployeeForBadge(employee);
    setIsBadgeModalOpen(true);
  };

  const handleOpenPassword = (employee: Employee) => {
    setSelectedEmployeeForPassword(employee);
    setIsPasswordModalOpen(true);
  };

  const handleOpenNewSystemUser = () => {
    setSelectedSystemUserForEdit(null);
    setIsSystemAccessModalOpen(true);
  };

  const handleOpenEditSystemUser = (user: SystemUser) => {
    setSelectedSystemUserForEdit(user);
    setIsSystemAccessModalOpen(true);
  };

  const handleDelete = (emp: Employee) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover o funcionário ${emp.nome} (Matrícula: ${emp.matricula})?\nEsta ação também atualizará a escala e histórico.`
      )
    ) {
      onDeleteEmployee(emp.id);
    }
  };

  const getCategoryBadgeClass = (categoria: EmployeeCategory) => {
    switch (categoria) {
      case 'Enfermeiro(a)':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Técnico(a) de Enfermagem':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Médico(a)':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Fisioterapeuta':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case 'ATIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Ativo
          </span>
        );
      case 'LICENCA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Licença
          </span>
        );
      case 'AFASTADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            Afastado
          </span>
        );
      case 'INATIVO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            Inativo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <HMWGLogo size="lg" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Quadro de Funcionários & Colaboradores
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                SESAP / RN • HMWG
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gestão cadastral integrada de enfermeiros, técnicos de enfermagem, médicos e equipe multiprofissional
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewEmployee}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-700 to-cyan-700 hover:from-sky-800 hover:to-cyan-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Novo Funcionário
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Total de Colaboradores
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              {stats.total}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Enfermeiros Ativos
            </span>
            <span className="text-xl sm:text-2xl font-black text-sky-900 leading-none">
              {stats.nursesActive}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Técnicos de Enfermagem
            </span>
            <span className="text-xl sm:text-2xl font-black text-cyan-900 leading-none">
              {stats.techsActive}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Afastados / Licença / Inativos
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-900 leading-none">
              {stats.onLeaveOrInactive}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula SESAP, COREN/CRM, cargo ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-sky-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-sky-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filtrar por Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="TODAS">Todas as Categorias</option>
              <option value="Enfermeiro(a)">Enfermeiro(a)</option>
              <option value="Técnico(a) de Enfermagem">Técnico(a) de Enfermagem</option>
              <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
              <option value="Médico(a)">Médico(a)</option>
              <option value="Fisioterapeuta">Fisioterapeuta</option>
              <option value="Apoio / Administrativo">Apoio / Administrativo</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filtrar por Setor de Lotação
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="TODOS">Todos os Setores do HMWG</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.nome} ({sec.sigla})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filtrar por Situação Funcional
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="TODOS">Todas as Situações</option>
              <option value="ATIVO">🟢 Ativos</option>
              <option value="LICENCA">🟡 Em Licença</option>
              <option value="AFASTADO">🔴 Afastados</option>
              <option value="INATIVO">⚪ Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Counter & Clear Filter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Exibindo <strong>{filteredEmployees.length}</strong> de <strong>{employees.length}</strong> colaboradores
        </span>
        {(searchTerm || selectedCategory !== 'TODAS' || selectedSector !== 'TODOS' || selectedStatus !== 'TODOS') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('TODAS');
              setSelectedSector('TODOS');
              setSelectedStatus('TODOS');
            }}
            className="text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            Nenhum funcionário encontrado com os filtros selecionados
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tente buscar com outro termo ou limpe os filtros para visualizar a lista completa de colaboradores.
          </p>
          <button
            onClick={handleOpenNewEmployee}
            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Cadastrar Funcionário Agora
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const sector = sectors.find((s) => s.id === emp.setorPadraoId);
            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between space-y-3"
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm flex-shrink-0">
                        {emp.nome.replace('Enf. ', '').replace('Téc. ', '').replace('Dr. ', '').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate" title={emp.nome}>
                          {emp.nome}
                        </h3>
                        <span className="font-mono text-[10px] text-slate-500 block">
                          {emp.matricula}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(emp.status)}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                        emp.categoria
                      )}`}
                    >
                      {emp.categoria}
                    </span>
                    {emp.conselhoNumero && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-100">
                        {emp.conselhoNumero}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cargo:</span>
                      <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]">
                        {emp.cargo}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Setor:</span>
                      <span className="font-medium text-slate-700">
                        {sector ? sector.sigla : 'Geral'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Turno:</span>
                      <span className="font-medium text-slate-700">{emp.turnoPadrao}</span>
                    </div>

                    {emp.telefone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Contato:</span>
                        <span className="font-medium text-slate-700">{emp.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenBadge(emp)}
                      className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      title="Visualizar Ficha / Crachá HMWG"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Informações do Funcionário"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenPassword(emp)}
                      className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Alterar Senha"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleStatus(emp.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        emp.status === 'ATIVO'
                          ? 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                      title={emp.status === 'ATIVO' ? 'Inativar Colaborador' : 'Ativar Colaborador'}
                    >
                      {emp.status === 'ATIVO' ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDelete(emp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Colaborador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredEmployees.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Funcionário</th>
                  <th className="py-3 px-3">Matrícula</th>
                  <th className="py-3 px-3">Categoria & Registro</th>
                  <th className="py-3 px-3">Setor & Turno</th>
                  <th className="py-3 px-3">Vínculo</th>
                  <th className="py-3 px-3">Situação</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const sector = sectors.find((s) => s.id === emp.setorPadraoId);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.nome}</div>
                        <div className="text-[11px] text-slate-500">{emp.cargo}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {emp.matricula}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{emp.categoria}</div>
                        <div className="font-mono text-[10px] text-slate-500">{emp.conselhoNumero || '—'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{sector ? sector.nome : 'Geral'}</div>
                        <div className="text-[10px] text-slate-500">{emp.turnoPadrao}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {emp.regimeContratual}
                      </td>
                      <td className="py-3 px-3">
                        {getStatusBadge(emp.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenBadge(emp)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver Ficha / Crachá"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenPassword(emp)}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Alterar Senha"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Acessos ao Sistema */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Acessos ao Sistema</h3>
              <p className="text-[11px] text-slate-500">
                {systemUsers.length} usuário(s) cadastrado(s)
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenNewSystemUser}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Acesso</span>
          </button>
        </div>

        {systemUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">Nenhum acesso cadastrado</p>
            <p className="text-[10px] text-slate-400">Clique em "Novo Acesso" para adicionar um usuário</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Login</th>
                  <th className="py-2.5 px-3">Nível de Acesso</th>
                  <th className="py-2.5 px-3">Setores</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {systemUsers.map((su) => {
                  const level = ACCESS_LEVELS.find((l) => l.value === su.nivelAcesso);
                  return (
                    <tr key={su.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{su.nome}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-mono font-semibold">{su.login || su.email}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${level?.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {su.nivelAcesso}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {su.nivelAcesso === 'Administrador Total' ? 'Todos' : `${su.setorPermitidoIds.length} setor(es)`}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${su.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {su.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenEditSystemUser(su)}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Acesso"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <EmployeeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={onSaveEmployee}
        employeeToEdit={selectedEmployeeForEdit}
        sectors={sectors}
      />

      <EmployeeBadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        employee={selectedEmployeeForBadge}
        sectors={sectors}
      />

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        employee={selectedEmployeeForPassword}
        onSave={onSaveEmployee}
      />

      <SystemAccessModal
        isOpen={isSystemAccessModalOpen}
        onClose={() => setIsSystemAccessModalOpen(false)}
        onSave={onSaveSystemUser}
        onDelete={onDeleteSystemUser}
        userToEdit={selectedSystemUserForEdit}
        existingUsers={systemUsers}
        sectors={sectors}
      />
    </div>
  );
};

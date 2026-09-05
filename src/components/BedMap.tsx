import React, { useState } from 'react';
import { Bed, BedStatus, Patient, Sector, VacancyRequest } from '../types';
import { HMWGLogo } from './HMWGLogo';
import {
  Bed as BedIcon,
  AlertCircle,
  Plus,
  UserPlus,
  Edit,
  ShieldAlert,
  GitPullRequest,
  Lock,
  Sparkles,
  Search,
  CheckCircle2,
  Ban,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface BedMapProps {
  currentSector: Sector;
  beds: Bed[];
  patients: Patient[];
  vacancies: VacancyRequest[];
  onSelectBed: (bed: Bed) => void;
  onOpenPatientModal: (bed: Bed, patient?: Patient) => void;
  onRequestVacancyForBed: (bed: Bed) => void;
  onUpdateBedStatus: (bedId: string, status: BedStatus, motivo?: string) => void;
  onAddNewBed: (numero: string, setorId: string) => void;
}

export const BedMap: React.FC<BedMapProps> = ({
  currentSector,
  beds,
  patients,
  vacancies,
  onOpenPatientModal,
  onRequestVacancyForBed,
  onUpdateBedStatus,
  onAddNewBed,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingBed, setIsAddingBed] = useState<boolean>(false);
  const [newBedNumber, setNewBedNumber] = useState<string>('');

  const sectorBeds = beds.filter((b) => b.setorId === currentSector.id);

  // Map patients by bedId
  const patientMap = new Map<string, Patient>();
  patients.forEach((p) => {
    patientMap.set(p.leitoId, p);
  });

  // Check if bed has active vacancy request
  const bedHasVacancyRequest = (bedId: string) => {
    return vacancies.some(
      (v) =>
        v.leitoDesejadoId === bedId &&
        (v.status === 'PENDENTE' || v.status === 'AGUARDANDO_DESOCUPACAO')
    );
  };

  // Filter beds
  const filteredBeds = sectorBeds.filter((bed) => {
    const patient = patientMap.get(bed.id);

    // Status filter
    if (filterStatus === 'OCUPADOS' && bed.status !== 'OCUPADO') return false;
    if (filterStatus === 'DESOCUPADOS' && bed.status !== 'DESOCUPADO' && bed.status !== 'HIGIENIZACAO') return false;
    if (filterStatus === 'BLOQUEADOS' && bed.status !== 'BLOQUEADO') return false;
    if (filterStatus === 'TQT' && (!patient || !patient.traqueostomia)) return false;
    if (filterStatus === 'COM_SOLICITACAO' && !bedHasVacancyRequest(bed.id)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBed = bed.numero.toLowerCase().includes(q);
      const matchPatient = patient?.nome.toLowerCase().includes(q);
      const matchProntuario = patient?.prontuario.toLowerCase().includes(q);
      const matchClass = patient?.classificacao.toLowerCase().includes(q);
      if (!matchBed && !matchPatient && !matchProntuario && !matchClass) {
        return false;
      }
    }

    return true;
  });

  // Counts for statistics
  const totalBeds = sectorBeds.length;
  const occupiedCount = sectorBeds.filter((b) => b.status === 'OCUPADO').length;
  const vacantCount = sectorBeds.filter(
    (b) => b.status === 'DESOCUPADO' || b.status === 'HIGIENIZACAO'
  ).length;
  const blockedCount = sectorBeds.filter((b) => b.status === 'BLOQUEADO').length;
  const tqtCount = sectorBeds.filter((b) => patientMap.get(b.id)?.traqueostomia).length;
  const vacancyRequestCount = sectorBeds.filter((b) => bedHasVacancyRequest(b.id)).length;

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedNumber.trim()) return;
    onAddNewBed(newBedNumber.trim(), currentSector.id);
    setNewBedNumber('');
    setIsAddingBed(false);
  };

  return (
    <div className="space-y-6">
      {/* Sector Overview & Metrics Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <HMWGLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentSector.nome}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  {currentSector.sigla}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentSector.descricao}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingBed(!isAddingBed)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Leito
            </button>
          </div>
        </div>

        {/* Inline Add Bed Form */}
        {isAddingBed && (
          <form
            onSubmit={handleAddBedSubmit}
            className="my-3 p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 animate-in fade-in duration-150"
          >
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Novo Leito para {currentSector.sigla}:
            </span>
            <input
              type="text"
              required
              placeholder="Ex: Leito 11, Box 05, Leito 205-B..."
              value={newBedNumber}
              onChange={(e) => setNewBedNumber(e.target.value)}
              className="px-3 py-2 sm:py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-2 sm:py-1.5 text-xs font-semibold bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition-colors flex-1 sm:flex-initial"
              >
                Salvar Leito
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBed(false)}
                className="px-3 py-2 sm:py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 pt-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Capacidade</div>
            <div className="text-xl font-black text-slate-900">{totalBeds} <span className="text-xs font-normal text-slate-500">leitos</span></div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
            <div className="text-[11px] font-bold text-rose-700 uppercase">Ocupados</div>
            <div className="text-xl font-black text-rose-900">
              {occupiedCount}{' '}
              <span className="text-xs font-medium text-rose-600">
                ({totalBeds ? Math.round((occupiedCount / totalBeds) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <div className="text-[11px] font-bold text-emerald-700 uppercase">Desocupados (Vagos)</div>
            <div className="text-xl font-black text-emerald-900">{vacantCount} <span className="text-xs font-normal text-emerald-600">livres</span></div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Traqueostomizados
            </div>
            <div className="text-xl font-black text-amber-900">{tqtCount} <span className="text-xs font-normal text-amber-700">pacientes</span></div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
            <div className="text-[11px] font-bold text-purple-800 uppercase flex items-center gap-1">
              <GitPullRequest className="w-3.5 h-3.5 text-purple-600" />
              Fila de Vaga Ativa
            </div>
            <div className="text-xl font-black text-purple-900">{vacancyRequestCount} <span className="text-xs font-normal text-purple-700">pedidos</span></div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        {/* Status filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('TODOS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'TODOS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({sectorBeds.length})
          </button>
          <button
            onClick={() => setFilterStatus('OCUPADOS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'OCUPADOS'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Ocupados ({occupiedCount})
          </button>
          <button
            onClick={() => setFilterStatus('DESOCUPADOS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'DESOCUPADOS'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Desocupados ({vacantCount})
          </button>
          <button
            onClick={() => setFilterStatus('TQT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'TQT'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
            }`}
          >
            Traqueostomizados [TQT] ({tqtCount})
          </button>
          <button
            onClick={() => setFilterStatus('COM_SOLICITACAO')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'COM_SOLICITACAO'
                ? 'bg-purple-700 text-white'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            Com Solicitação ({vacancyRequestCount})
          </button>
          <button
            onClick={() => setFilterStatus('BLOQUEADOS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === 'BLOQUEADOS'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bloqueados ({blockedCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar leito, paciente, prontuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map((bed) => {
          const patient = patientMap.get(bed.id);
          const hasVacancyReq = bedHasVacancyRequest(bed.id);

          return (
            <div
              key={bed.id}
              className={`rounded-2xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                bed.status === 'OCUPADO'
                  ? 'bg-white border-slate-300 hover:border-sky-400'
                  : bed.status === 'BLOQUEADO'
                  ? 'bg-slate-100/90 border-slate-300 opacity-90'
                  : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400'
              }`}
            >
              {/* Bed Top Bar */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      bed.status === 'OCUPADO'
                        ? 'bg-sky-100 text-sky-800'
                        : bed.status === 'BLOQUEADO'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <BedIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-none">
                      {bed.numero}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {currentSector.sigla}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      bed.status === 'OCUPADO'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : bed.status === 'BLOQUEADO'
                        ? 'bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {bed.status === 'OCUPADO'
                      ? 'Ocupado'
                      : bed.status === 'BLOQUEADO'
                      ? 'Bloqueado'
                      : 'Desocupado'}
                  </span>

                  {/* Bed Status Selector */}
                  <select
                    value={bed.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as BedStatus;
                      if (newStatus === 'BLOQUEADO') {
                        const motivo = prompt('Informe o motivo do bloqueio do leito:') || 'Manutenção geral';
                        onUpdateBedStatus(bed.id, newStatus, motivo);
                      } else {
                        onUpdateBedStatus(bed.id, newStatus);
                      }
                    }}
                    className="text-[10px] bg-slate-100 text-slate-700 rounded px-1.5 py-1 border border-slate-300 focus:outline-none"
                    title="Alterar status do leito"
                  >
                    <option value="OCUPADO">Ocupado</option>
                    <option value="DESOCUPADO">Desocupado</option>
                    <option value="BLOQUEADO">Bloqueado</option>
                    <option value="HIGIENIZACAO">Higienização</option>
                  </select>
                </div>
              </div>

              {/* Vacancy Request Alert Banner (Requirement: "cadastrar solicitação de vagas mesmo que o leito esteja ocupado") */}
              {hasVacancyReq && (
                <div className="bg-purple-100/90 border-b border-purple-200 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-purple-900 font-medium">
                  <span className="flex items-center gap-1.5">
                    <GitPullRequest className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                    <strong>Solicitação de Vaga Cadastrada</strong> (Fila)
                  </span>
                  <span className="text-[10px] bg-purple-200 px-1.5 py-0.5 rounded font-bold text-purple-800">
                    Aguardando
                  </span>
                </div>
              )}

              {/* Bed Body Content */}
              <div className="p-3.5 flex-1 space-y-3">
                {bed.status === 'OCUPADO' && patient ? (
                  <>
                    {/* Patient Name & Core Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight hover:text-sky-700 cursor-pointer"
                            onClick={() => onOpenPatientModal(bed, patient)}
                          >
                            {patient.nome}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {patient.prontuario} • {patient.idade} anos
                          </span>
                        </div>

                        {/* Score Badge */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Score
                          </span>
                          <span className="text-xs font-black bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                            {patient.pontuacao} pts
                          </span>
                        </div>
                      </div>

                      {patient.diagnostico && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                          Dx: {patient.diagnostico}
                        </p>
                      )}
                    </div>

                    {/* Tags & Clinical Badges (REQUIRED FIELDS) */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {/* Classificação do Paciente */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                        {patient.classificacao}
                      </span>

                      {/* TRAQUEOSTOMIA HIGHLIGHT */}
                      {patient.traqueostomia ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                          <ShieldAlert className="w-3 h-3" />
                          TRAQUEOSTOMIA [TQT]
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          Sem TQT
                        </span>
                      )}

                      {/* Tipo de Isolamento */}
                      {patient.tipoIsolamento !== 'Padrão' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          Isolamento: {patient.tipoIsolamento}
                        </span>
                      )}

                      {/* Curativo Frequency */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Curativo: {patient.curativo}
                      </span>

                      {/* Alergias */}
                      {patient.alergia && patient.alergia !== 'Nenhuma conhecida' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                          Alergia: {patient.alergia}
                        </span>
                      )}
                    </div>

                    {/* Vital Signs Interval & Support Details */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Sinais Vitais
                        </span>
                        <span className="font-semibold text-slate-700">
                          {patient.sinaisVitais}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Oxigenação
                        </span>
                        <span className="font-semibold text-slate-700 truncate block" title={patient.oxigenacao}>
                          {patient.oxigenacao}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Alimentação
                        </span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {patient.alimentacao}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Estado Mental
                        </span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {patient.estadoMental}
                        </span>
                      </div>
                    </div>
                  </>
                ) : bed.status === 'BLOQUEADO' ? (
                  <div className="p-4 text-center space-y-2">
                    <Ban className="w-7 h-7 text-slate-400 mx-auto" />
                    <div className="font-bold text-xs text-slate-700">
                      Leito Temporariamente Bloqueado
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {bed.motivoBloqueio || 'Manutenção predial / higienização terminal'}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                    <div className="font-bold text-xs text-emerald-800">
                      Leito Desocupado e Disponível
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pronto para internação de novo paciente ou acolhimento de transferência.
                    </p>
                  </div>
                )}
              </div>

              {/* Bed Action Bar */}
              <div className="p-2.5 sm:p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                {bed.status === 'OCUPADO' ? (
                  <>
                    <button
                      onClick={() => onOpenPatientModal(bed, patient)}
                      className="flex-1 py-2 sm:py-1.5 px-2 bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-sky-600" />
                      Prontuário
                    </button>

                    {/* Vaga mesmo que ocupado (Specific prompt requirement!) */}
                    <button
                      onClick={() => onRequestVacancyForBed(bed)}
                      className="py-2 sm:py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Cadastrar solicitação de vaga para quando este leito for desocupado"
                    >
                      <GitPullRequest className="w-3.5 h-3.5 text-amber-700" />
                      Pedir Vaga
                    </button>
                  </>
                ) : bed.status === 'DESOCUPADO' ? (
                  <>
                    <button
                      onClick={() => onOpenPatientModal(bed)}
                      className="flex-1 py-2 sm:py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Internar Paciente
                    </button>

                    <button
                      onClick={() => onRequestVacancyForBed(bed)}
                      className="py-2 sm:py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <GitPullRequest className="w-3.5 h-3.5 text-slate-600" />
                      Reservar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onUpdateBedStatus(bed.id, 'DESOCUPADO')}
                    className="w-full py-2 sm:py-1.5 px-3 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Desbloquear Leito
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

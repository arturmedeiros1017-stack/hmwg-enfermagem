import React, { useState } from 'react';
import {
  Bed,
  Nurse,
  Patient,
  Sector,
  ShiftConfig,
  Technician,
} from '../types';
import { generateNursingAssignment } from '../utils/assignment';
import { HMWGLogo } from './HMWGLogo';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Sparkles,
  Bed as BedIcon,
  CheckCircle2,
  Ban,
  AlertTriangle,
  RotateCw,
  Plus,
  UserCheck,
  UserX,
} from 'lucide-react';

interface CareAssignmentProps {
  currentSector: Sector;
  beds: Bed[];
  patients: Patient[];
  nurses: Nurse[];
  technicians: Technician[];
  currentShift: ShiftConfig;
  onToggleTechnicianPresence: (techId: string) => void;
  onOpenPrintReport: () => void;
  onAddNewTechnician: (nome: string, coren: string) => void;
}

export const CareAssignment: React.FC<CareAssignmentProps> = ({
  currentSector,
  beds,
  patients,
  nurses,
  technicians,
  currentShift,
  onToggleTechnicianPresence,
  onOpenPrintReport,
  onAddNewTechnician,
}) => {
  const [showAddTech, setShowAddTech] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [newTechCoren, setNewTechCoren] = useState('');

  // Generate assignment dynamically
  const assignment = generateNursingAssignment(
    currentSector,
    beds,
    patients,
    nurses,
    technicians,
    currentShift
  );

  const presentTechs = technicians.filter(
    (t) => t.presenteNoPlantao && (!t.setorId || t.setorId === currentSector.id)
  );

  const handleAddTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName.trim()) return;
    onAddNewTechnician(
      newTechName.trim(),
      newTechCoren.trim() || `COREN-RN ${Math.floor(100000 + Math.random() * 900000)}-TE`
    );
    setNewTechName('');
    setNewTechCoren('');
    setShowAddTech(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Action to Print */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HMWGLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Escala de Distribuição de Cuidados de Enfermagem
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                {currentSector.nome}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Distribuição balanceada por grau de dependência clínica, pontuação e pacientes traqueostomizados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPrintReport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Visualizar & Imprimir em Folha A4
          </button>
        </div>
      </div>

      {/* 1. SEÇÃO: ENFERMEIROS RESPONSÁVEIS PELO PLANTÃO E SEUS LEITOS */}
      {/* Requirement: "cada plantão deverá ter mais de um enfermeiro responsável, cada enfermeiro será atribuído com vários leitos" */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-700" />
            Enfermeiros Responsáveis pelo Plantão ({assignment.enfermeirosResponsaveis.length})
          </h3>
          <span className="text-[11px] text-sky-700 font-medium">
            Turno: <strong>{currentShift.turno}</strong> • Data: <strong>{currentShift.data}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignment.enfermeirosResponsaveis.map(({ enfermeiro, leitosAtribuidos }) => (
            <div
              key={enfermeiro.id}
              className="bg-white rounded-xl p-4 border border-sky-200 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    {enfermeiro.nome}
                  </div>
                  <div className="text-xs text-slate-500">
                    {enfermeiro.coren} • <span className="text-sky-700 font-medium">{enfermeiro.cargo}</span>
                  </div>
                </div>
                <span className="text-xs font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                  {leitosAtribuidos.length} leitos
                </span>
              </div>

              {/* Leitos atribuídos ao enfermeiro */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Leitos Atribuídos sob Supervisão:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {leitosAtribuidos.length > 0 ? (
                    leitosAtribuidos.map((b) => (
                      <span
                        key={b.id}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          b.status === 'OCUPADO'
                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                            : b.status === 'BLOQUEADO'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {b.numero}
                        <span className="text-[9px] ml-1 opacity-70">({b.status[0]})</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Nenhum leito mapeado especificamente.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CONTROLE DE PRESENÇA DE TÉCNICOS EM ENFERMAGEM */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" />
              Técnicos em Enfermagem Escalados ({presentTechs.length} presentes de {technicians.length})
            </h3>
            <p className="text-xs text-slate-500">
              Marque quem está presente no plantão para recalcular a divisão equitativa de leitos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddTech(!showAddTech)}
              className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Técnico
            </button>
          </div>
        </div>

        {/* Add Tech Inline Form */}
        {showAddTech && (
          <form
            onSubmit={handleAddTechSubmit}
            className="my-3 p-3 bg-cyan-50 border border-cyan-200 rounded-xl flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 animate-in fade-in duration-150"
          >
            <span className="text-xs font-bold text-cyan-900">Novo Técnico:</span>
            <input
              type="text"
              required
              placeholder="Nome do Técnico (ex: Téc. João Silva)"
              value={newTechName}
              onChange={(e) => setNewTechName(e.target.value)}
              className="px-3 py-2 sm:py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-56"
            />
            <input
              type="text"
              placeholder="COREN-RN (ex: 456.789-TE)"
              value={newTechCoren}
              onChange={(e) => setNewTechCoren(e.target.value)}
              className="px-3 py-2 sm:py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-44 font-mono"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-2 sm:py-1.5 text-xs font-semibold bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 flex-1 sm:flex-initial"
              >
                Cadastrar
              </button>
              <button
                type="button"
                onClick={() => setShowAddTech(false)}
                className="px-3 py-2 sm:py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Presence Pills */}
        <div className="flex flex-wrap gap-2 pt-3">
          {technicians.map((tech) => (
            <button
              key={tech.id}
              onClick={() => onToggleTechnicianPresence(tech.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                tech.presenteNoPlantao
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-400/40'
                  : 'bg-slate-50 border-slate-200 text-slate-500 line-through opacity-70 hover:opacity-100'
              }`}
              title="Clique para alternar presença no plantão"
            >
              {tech.presenteNoPlantao ? (
                <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <UserX className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <div className="text-left leading-tight">
                <div>{tech.nome}</div>
                <div className="text-[10px] text-slate-400">{tech.coren}</div>
              </div>
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                  tech.presenteNoPlantao
                    ? 'bg-emerald-200 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tech.presenteNoPlantao ? 'Presente' : 'Ausente'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. ATRIBUIÇÃO BALANCEADA: LEITOS DISTRIBUÍDOS POR TÉCNICO PRESENTE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Distribuição por Técnico de Enfermagem
            </h3>
            <p className="text-xs text-slate-500">
              Total de leitos ocupados distribuídos com equidade de complexidade e traqueostomias
            </p>
          </div>

          <div className="text-[10px] sm:text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-lg whitespace-nowrap">
            Algoritmo Ativo: <strong>Balanceamento Fugulin + TQT</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {assignment.distribuicaoTecnicos.map((item) => (
            <div
              key={item.tecnico.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Header do Técnico */}
              <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    {item.tecnico.nome}
                  </h4>
                  <span className="text-xs text-slate-300 font-mono">
                    {item.tecnico.coren}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* TQT Indicator */}
                  {item.totalTraqueostomizados > 0 && (
                    <span className="text-[11px] font-black bg-rose-600 text-white px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {item.totalTraqueostomizados} TQT
                    </span>
                  )}

                  {/* Score Pill */}
                  <span className="text-xs font-black bg-white/10 text-cyan-200 px-2.5 py-1 rounded border border-white/20">
                    {item.totalPontuacao} pts ({item.leitos.length} leitos)
                  </span>
                </div>
              </div>

              {/* Lista de Leitos e Pacientes Atribuídos */}
              <div className="p-4 space-y-3 flex-1">
                {item.leitos.length > 0 ? (
                  item.leitos.map(({ leito, paciente }) => (
                    <div
                      key={leito.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-sky-300 transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 bg-sky-700 text-white rounded">
                            {leito.numero}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {paciente ? paciente.nome : 'Sem identificação'}
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {paciente?.traqueostomia && (
                            <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              TQT
                            </span>
                          )}

                          <span className="text-[10px] font-black bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                            {paciente?.pontuacao} pts
                          </span>
                        </div>
                      </div>

                      {paciente && (
                        <>
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-semibold">
                              {paciente.classificacao}
                            </span>
                            {paciente.tipoIsolamento !== 'Padrão' && (
                              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                Isolamento: {paciente.tipoIsolamento}
                              </span>
                            )}
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              Curativo: {paciente.curativo}
                            </span>
                            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              SV: {paciente.sinaisVitais}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-1 pt-1 border-t border-slate-200/60">
                            <div>
                              <strong className="text-slate-500">O2:</strong> {paciente.oxigenacao}
                            </div>
                            <div>
                              <strong className="text-slate-500">Dieta:</strong> {paciente.alimentacao}
                            </div>
                            <div>
                              <strong className="text-slate-500">Estado:</strong> {paciente.estadoMental}
                            </div>
                            <div>
                              <strong className="text-slate-500">Alergia:</strong>{' '}
                              <span className={paciente.alergia && paciente.alergia !== 'Nenhuma conhecida' ? 'text-rose-700 font-bold' : ''}>
                                {paciente.alergia}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    Nenhum leito atribuído a este profissional.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. LEITOS DESOCUPADOS E LEITOS BLOQUEADOS */}
      {/* Requirement: "indicar os leitos desocupados e bloqueados" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leitos Desocupados */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Leitos Desocupados / Vagos ({assignment.leitosDesocupados.length})
            </h4>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Disponíveis para Regulação
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {assignment.leitosDesocupados.length > 0 ? (
              assignment.leitosDesocupados.map((bed) => (
                <div
                  key={bed.id}
                  className="bg-white px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {bed.numero}
                </div>
              ))
            ) : (
              <span className="text-xs text-emerald-700 italic">
                Setor com 100% de taxa de ocupação. Nenhum leito vago.
              </span>
            )}
          </div>
        </div>

        {/* Leitos Bloqueados */}
        <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-slate-500" />
              Leitos Bloqueados ({assignment.leitosBloqueados.length})
            </h4>
            <span className="text-[11px] text-slate-600 font-medium">
              Indisponíveis temporariamente
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {assignment.leitosBloqueados.length > 0 ? (
              assignment.leitosBloqueados.map((bed) => (
                <div
                  key={bed.id}
                  className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center justify-between"
                >
                  <span className="font-bold">{bed.numero}</span>
                  <span className="text-[11px] text-slate-500 italic">
                    {bed.motivoBloqueio || 'Manutenção ou isolamento'}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">
                Nenhum leito bloqueado no momento.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Bed, Nurse, Sector, ShiftConfig, Technician } from '../types';
import { HMWGLogo } from './HMWGLogo';
import {
  Users,
  ShieldCheck,
  Plus,
  Calendar,
  Clock,
  Key,
  Mail,
  UserCheck,
  CheckSquare,
  Square,
  Edit2,
  Lock,
} from 'lucide-react';

interface ShiftManagementProps {
  currentSector: Sector;
  beds: Bed[];
  nurses: Nurse[];
  technicians: Technician[];
  currentShift: ShiftConfig;
  onUpdateShiftConfig: (config: ShiftConfig) => void;
  onAddNewNurse: (nurse: Nurse) => void;
  onAddNewTechnician: (tech: Technician) => void;
  onToggleTechnicianPresence: (techId: string) => void;
}

export const ShiftManagement: React.FC<ShiftManagementProps> = ({
  currentSector,
  beds,
  nurses,
  technicians,
  currentShift,
  onUpdateShiftConfig,
  onAddNewNurse,
  onAddNewTechnician,
  onToggleTechnicianPresence,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'plantao' | 'enfermeiros' | 'tecnicos'>('plantao');

  // New Nurse Form State
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [nurseNome, setNurseNome] = useState('');
  const [nurseCoren, setNurseCoren] = useState('');
  const [nurseCargo, setNurseCargo] = useState<
    'Enfermeiro Assistencial' | 'Enfermeiro Chefe / RT' | 'Enfermeiro Rotina' | 'Coordenador de Enfermagem'
  >('Enfermeiro Assistencial');
  const [nurseEmail, setNurseEmail] = useState('');
  const [nurseSenha, setNurseSenha] = useState('enfermagem123');
  const [nurseTurno, setNurseTurno] = useState<'Diurno (07h-19h)' | 'Noturno (19h-07h)' | 'Ambos'>('Diurno (07h-19h)');
  const [nurseTelefone, setNurseTelefone] = useState('');

  // New Tech Form State
  const [showTechModal, setShowTechModal] = useState(false);
  const [techNome, setTechNome] = useState('');
  const [techCoren, setTechCoren] = useState('');
  const [techTurno, setTechTurno] = useState<'Diurno (07h-19h)' | 'Noturno (19h-07h)'>('Diurno (07h-19h)');

  const sectorBeds = beds.filter((b) => b.setorId === currentSector.id);

  // Toggle nurse responsible for shift
  const handleToggleNurseResponsible = (nurseId: string) => {
    let newIds = [...currentShift.enfermeirosResponsaveisIds];
    if (newIds.includes(nurseId)) {
      if (newIds.length <= 1) {
        alert('O plantão deve ter ao menos um enfermeiro responsável.');
        return;
      }
      newIds = newIds.filter((id) => id !== nurseId);
    } else {
      newIds.push(nurseId);
    }

    onUpdateShiftConfig({
      ...currentShift,
      enfermeirosResponsaveisIds: newIds,
    });
  };

  // Toggle bed assignment to nurse
  const handleToggleBedToNurse = (nurseId: string, bedId: string) => {
    const currentMap = { ...(currentShift.enfermeiroLeitosMap || {}) };
    const bedsForNurse = currentMap[nurseId] || [];

    if (bedsForNurse.includes(bedId)) {
      currentMap[nurseId] = bedsForNurse.filter((id) => id !== bedId);
    } else {
      currentMap[nurseId] = [...bedsForNurse, bedId];
    }

    onUpdateShiftConfig({
      ...currentShift,
      enfermeiroLeitosMap: currentMap,
    });
  };

  const handleCreateNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseNome.trim()) return;

    const newNurse: Nurse = {
      id: `nurse-${Date.now()}`,
      nome: nurseNome.trim().startsWith('Enf.') ? nurseNome.trim() : `Enf. ${nurseNome.trim()}`,
      coren: nurseCoren.trim() || `COREN-RN ${Math.floor(100000 + Math.random() * 900000)}-ENF`,
      cargo: nurseCargo,
      email: nurseEmail.trim() || `enfermeiro.${Date.now()}@hmwg.rn.gov.br`,
      senha: nurseSenha.trim() || '123456',
      turno: nurseTurno,
      telefone: nurseTelefone.trim() || '(84) 99999-0000',
    };

    onAddNewNurse(newNurse);
    setShowNurseModal(false);
    setNurseNome('');
    setNurseCoren('');
    setNurseEmail('');
  };

  const handleCreateTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techNome.trim()) return;

    const newTech: Technician = {
      id: `tec-${Date.now()}`,
      nome: techNome.trim().startsWith('Téc.') ? techNome.trim() : `Téc. ${techNome.trim()}`,
      coren: techCoren.trim() || `COREN-RN ${Math.floor(100000 + Math.random() * 900000)}-TE`,
      turno: techTurno,
      presenteNoPlantao: true,
      setorId: currentSector.id,
    };

    onAddNewTechnician(newTech);
    setShowTechModal(false);
    setTechNome('');
    setTechCoren('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <HMWGLogo size="md" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                Gestão do Plantão & Equipe de Enfermagem
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Hospital Walfredo Gurgel
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500">
              Escala de enfermeiros responsáveis, atribuição de múltiplos leitos e controle de técnicos
            </p>
          </div>
        </div>

        {/* Subtabs - scrollable on mobile */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 p-0.5 sm:p-1 rounded-xl overflow-x-auto scrollbar-none flex-shrink-0">
          <button
            onClick={() => setActiveSubTab('plantao')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'plantao'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Configurar Plantão
          </button>
          <button
            onClick={() => setActiveSubTab('enfermeiros')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'enfermeiros'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Enfermeiros ({nurses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('tecnicos')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'tecnicos'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Técnicos ({technicians.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CONFIGURAÇÃO DO PLANTÃO ATUAL */}
      {activeSubTab === 'plantao' && (
        <div className="space-y-6">
          {/* Shift Details (Turno, Data) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Parâmetros do Plantão Atual
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data do Plantão
                </label>
                <input
                  type="date"
                  value={currentShift.data}
                  onChange={(e) =>
                    onUpdateShiftConfig({ ...currentShift, data: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turno de Atendimento
                </label>
                <select
                  value={currentShift.turno}
                  onChange={(e) =>
                    onUpdateShiftConfig({
                      ...currentShift,
                      turno: e.target.value as 'Diurno (07h às 19h)' | 'Noturno (19h às 07h)',
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  <option value="Diurno (07h às 19h)">Diurno (07h às 19h) — 12 Horas</option>
                  <option value="Noturno (19h às 07h)">Noturno (19h às 07h) — 12 Horas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Gerais do Plantão
                </label>
                <input
                  type="text"
                  placeholder="Informações gerais da passagem de plantão..."
                  value={currentShift.observacoesPlantao || ''}
                  onChange={(e) =>
                    onUpdateShiftConfig({
                      ...currentShift,
                      observacoesPlantao: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* MULTIPLE RESPONSIBLE NURSES REQUIREMENT */}
          {/* Requirement: "cada plantão deverá ter mais de um enfermeiro responsável, cada enfermeiro será atribuído com vários leitos" */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-700" />
                  Enfermeiros Responsáveis pelo Plantão (Múltiplos)
                </h3>
                <p className="text-xs text-indigo-700">
                  Selecione dois ou mais enfermeiros para responder pelo plantão assistencial
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 bg-indigo-200 text-indigo-900 rounded-full">
                {currentShift.enfermeirosResponsaveisIds.length} Enfermeiro(s) Selecionado(s)
              </span>
            </div>

            {/* Nurse Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {nurses.map((nurse) => {
                const isSelected = currentShift.enfermeirosResponsaveisIds.includes(nurse.id);

                return (
                  <button
                    key={nurse.id}
                    type="button"
                    onClick={() => handleToggleNurseResponsible(nurse.id)}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-indigo-500 shadow-xs ring-2 ring-indigo-400'
                        : 'bg-white/80 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-[11px] sm:text-xs text-slate-900">{nurse.nome}</div>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {nurse.coren} • <span className="text-indigo-700 font-semibold">{nurse.cargo}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Turno padrão: {nurse.turno}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* NURSE-TO-BEDS ASSIGNMENT */}
          {/* Requirement: "cada enfermeiro será atribuído com vários leitos" */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                Atribuição de Múltiplos Leitos por Enfermeiro Responsável
              </h3>
              <p className="text-xs text-slate-500">
                Selecione quais leitos de {currentSector.nome} cada enfermeiro irá supervisionar diretamente
              </p>
            </div>

            <div className="space-y-4">
              {currentShift.enfermeirosResponsaveisIds.map((nurseId) => {
                const nurse = nurses.find((n) => n.id === nurseId);
                if (!nurse) return null;

                const assignedBeds = currentShift.enfermeiroLeitosMap?.[nurseId] || [];

                return (
                  <div
                    key={nurse.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                        <span className="font-bold text-xs text-slate-900">{nurse.nome}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({nurse.coren})
                        </span>
                      </div>
                      <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                        {assignedBeds.length} leitos atribuídos
                      </span>
                    </div>

                    {/* Bed Selection Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {sectorBeds.map((bed) => {
                        const isAssigned = assignedBeds.includes(bed.id);

                        return (
                          <button
                            key={bed.id}
                            type="button"
                            onClick={() => handleToggleBedToNurse(nurse.id, bed.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                              isAssigned
                                ? 'bg-sky-700 text-white border-sky-800 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                            }`}
                          >
                            {bed.numero}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CADASTRO DE ENFERMEIROS (COM LOGIN E SENHA) */}
      {/* Requirement: "cadastro de enfermeiros e técnicos em enfermagem... acesso com login e senha para os enfermeiros acessarem o sistema" */}
      {activeSubTab === 'enfermeiros' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quadro de Enfermeiros Cadastrados ({nurses.length})
              </h3>
              <p className="text-xs text-slate-500">
                Profissionais de enfermagem com credenciais de acesso e senha ao sistema
              </p>
            </div>

            <button
              onClick={() => setShowNurseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Novo Enfermeiro
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nurses.map((nurse) => (
              <div
                key={nurse.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{nurse.nome}</h4>
                    <span className="text-[11px] font-mono text-slate-500">{nurse.coren}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                    {nurse.cargo}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{nurse.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Senha configurada: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono">{nurse.senha || '••••••'}</code></span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Turno: {nurse.turno}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CADASTRO DE TÉCNICOS EM ENFERMAGEM */}
      {activeSubTab === 'tecnicos' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quadro de Técnicos em Enfermagem ({technicians.length})
              </h3>
              <p className="text-xs text-slate-500">
                Técnicos disponíveis para distribuição dos cuidados aos leitos
              </p>
            </div>

            <button
              onClick={() => setShowTechModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Novo Técnico
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-cyan-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{tech.nome}</h4>
                    <span className="text-[11px] font-mono text-slate-500">{tech.coren}</span>
                  </div>

                  <button
                    onClick={() => onToggleTechnicianPresence(tech.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                      tech.presenteNoPlantao
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tech.presenteNoPlantao ? 'Presente' : 'Ausente'}
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  Turno: <strong>{tech.turno}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL NOVO ENFERMEIRO */}
      {showNurseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 w-full max-w-md space-y-4 max-h-[95vh] flex flex-col">
            <h3 className="font-bold text-sm text-slate-900">Cadastrar Novo Enfermeiro(a)</h3>
            <form onSubmit={handleCreateNurse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Enf. Maria Helena Santos"
                  value={nurseNome}
                  onChange={(e) => setNurseNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">COREN-RN *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: COREN-RN 189.442-ENF"
                  value={nurseCoren}
                  onChange={(e) => setNurseCoren(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo / Função</label>
                <select
                  value={nurseCargo}
                  onChange={(e) => setNurseCargo(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Enfermeiro Assistencial">Enfermeiro Assistencial</option>
                  <option value="Enfermeiro Chefe / RT">Enfermeiro Chefe / RT</option>
                  <option value="Enfermeiro Rotina">Enfermeiro Rotina</option>
                  <option value="Coordenador de Enfermagem">Coordenador de Enfermagem</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail para Login</label>
                <input
                  type="email"
                  required
                  placeholder="ex: maria.santos@hmwg.rn.gov.br"
                  value={nurseEmail}
                  onChange={(e) => setNurseEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Senha de Acesso *</label>
                <input
                  type="password"
                  required
                  placeholder="Senha para login"
                  value={nurseSenha}
                  onChange={(e) => setNurseSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNurseModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 text-white font-semibold rounded-lg"
                >
                  Salvar Enfermeiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO TÉCNICO */}
      {showTechModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-6 w-full max-w-md space-y-4 max-h-[95vh] flex flex-col">
            <h3 className="font-bold text-sm text-slate-900">Cadastrar Novo Técnico de Enfermagem</h3>
            <form onSubmit={handleCreateTech} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Téc. Roberto Carlos de Melo"
                  value={techNome}
                  onChange={(e) => setTechNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">COREN-RN *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: COREN-RN 521.840-TE"
                  value={techCoren}
                  onChange={(e) => setTechCoren(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Turno</label>
                <select
                  value={techTurno}
                  onChange={(e) => setTechTurno(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Diurno (07h-19h)">Diurno (07h-19h)</option>
                  <option value="Noturno (19h-07h)">Noturno (19h-07h)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTechModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-700 text-white font-semibold rounded-lg"
                >
                  Salvar Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Bed, Sector, VacancyRequest } from '../types';
import { calculateAge } from '../utils/dateUtils';
import { HMWGLogo } from './HMWGLogo';
import {
  GitPullRequest,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Filter,
  User,
  Bed as BedIcon,
  Calendar,
} from 'lucide-react';

interface VacancyRequestsProps {
  vacancies: VacancyRequest[];
  sectors: Sector[];
  beds: Bed[];
  onAddVacancyRequest: (req: VacancyRequest) => void;
  onUpdateVacancyStatus: (
    id: string,
    status: 'PENDENTE' | 'APROVADA' | 'AGUARDANDO_DESOCUPACAO' | 'CANCELADA' | 'CONCLUIDA'
  ) => void;
  preSelectedBed?: Bed | null;
  onClearPreSelectedBed?: () => void;
}

export const VacancyRequests: React.FC<VacancyRequestsProps> = ({
  vacancies,
  sectors,
  beds,
  onAddVacancyRequest,
  onUpdateVacancyStatus,
  preSelectedBed,
  onClearPreSelectedBed,
}) => {
  const [showModal, setShowModal] = useState<boolean>(!!preSelectedBed);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  // Form states
  const [pacienteNome, setPacienteNome] = useState('');
  const [prontuario, setProntuario] = useState(`HMWG-${Math.floor(10000 + Math.random() * 90000)}`);
  const [dataNascimento, setDataNascimento] = useState('');
  const [idade, setIdade] = useState<number | ''>('');
  const [setorOrigem, setSetorOrigem] = useState('Pronto-Socorro / Sala Vermelha');
  const [setorDestinoId, setSetorDestinoId] = useState(
    preSelectedBed ? preSelectedBed.setorId : sectors[0]?.id || ''
  );
  const [leitoDesejadoId, setLeitoDesejadoId] = useState(preSelectedBed?.id || '');
  const [prioridade, setPrioridade] = useState<
    'VERMELHA (Emergência)' | 'AMARELA (Urgente)' | 'VERDE (Eletiva/Transferência)'
  >('VERMELHA (Emergência)');
  const [diagnostico, setDiagnostico] = useState('');
  const [justificativaClinica, setJustificativaClinica] = useState('');
  const [solicitanteNome, setSolicitanteNome] = useState('Plantão de Enfermagem / Médico');

  const handleDataNascimentoChange = (newDate: string) => {
    setDataNascimento(newDate);
    if (newDate) {
      const calculated = calculateAge(newDate);
      setIdade(calculated);
    }
  };

  // When preSelectedBed changes
  React.useEffect(() => {
    if (preSelectedBed) {
      setSetorDestinoId(preSelectedBed.setorId);
      setLeitoDesejadoId(preSelectedBed.id);
      setShowModal(true);
    }
  }, [preSelectedBed]);

  const targetBeds = beds.filter((b) => b.setorId === setorDestinoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteNome.trim()) return;

    const selectedBedObj = beds.find((b) => b.id === leitoDesejadoId);
    const isOccupied = selectedBedObj?.status === 'OCUPADO';

    const newReq: VacancyRequest = {
      id: `req-${Date.now()}`,
      pacienteNome: pacienteNome.trim(),
      prontuario: prontuario.trim(),
      dataNascimento: dataNascimento || undefined,
      idade: idade !== '' ? Number(idade) : undefined,
      setorOrigem: setorOrigem.trim(),
      setorDestinoId,
      leitoDesejadoId: leitoDesejadoId || undefined,
      prioridade,
      diagnostico: diagnostico.trim(),
      justificativaClinica: justificativaClinica.trim(),
      dataSolicitacao: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      // Even if occupied, registers as AGUARDANDO_DESOCUPACAO
      status: isOccupied ? 'AGUARDANDO_DESOCUPACAO' : 'PENDENTE',
      solicitanteNome: solicitanteNome.trim(),
    };

    onAddVacancyRequest(newReq);
    setShowModal(false);
    if (onClearPreSelectedBed) onClearPreSelectedBed();

    // Reset form
    setPacienteNome('');
    setDiagnostico('');
    setJustificativaClinica('');
  };

  const filteredVacancies = vacancies.filter((v) => {
    if (filterStatus === 'TODOS') return true;
    return v.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <HMWGLogo size="md" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                Regulação e Solicitação de Vagas de Leitos
              </h2>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                Fila de Espera HMWG
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500">
              Permite cadastrar solicitações para vagas imediatas ou vincular reserva a leitos atualmente ocupados
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Solicitação de Vaga
        </button>
      </div>

      {/* Filter Tabs - scrollable on mobile */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 scrollbar-none">
        <button
          onClick={() => setFilterStatus('TODOS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterStatus === 'TODOS'
              ? 'bg-purple-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todas ({vacancies.length})
        </button>
        <button
          onClick={() => setFilterStatus('AGUARDANDO_DESOCUPACAO')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterStatus === 'AGUARDANDO_DESOCUPACAO'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          Aguardando Desocupação de Leito ({vacancies.filter((v) => v.status === 'AGUARDANDO_DESOCUPACAO').length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDENTE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterStatus === 'PENDENTE'
              ? 'bg-sky-700 text-white'
              : 'bg-sky-50 text-sky-900 hover:bg-sky-100'
          }`}
        >
          Pendentes Regulação ({vacancies.filter((v) => v.status === 'PENDENTE').length})
        </button>
        <button
          onClick={() => setFilterStatus('APROVADA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterStatus === 'APROVADA'
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
          }`}
        >
          Aprovadas ({vacancies.filter((v) => v.status === 'APROVADA').length})
        </button>
      </div>

      {/* Vacancy Requests Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVacancies.length > 0 ? (
          filteredVacancies.map((req) => {
            const destSector = sectors.find((s) => s.id === req.setorDestinoId);
            const destBed = beds.find((b) => b.id === req.leitoDesejadoId);

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:border-purple-300 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{req.pacienteNome}</h3>
                      <span className="text-[11px] font-mono text-slate-500">
                        {req.prontuario}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Idade: <strong>{req.idade || '—'} anos</strong> • Solicitado por:{' '}
                      <span className="text-slate-700 font-medium">{req.solicitanteNome}</span>
                    </div>
                  </div>

                  {/* Priority Tag */}
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                      req.prioridade.includes('VERMELHA')
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : req.prioridade.includes('AMARELA')
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {req.prioridade.split(' ')[0]}
                  </span>
                </div>

                {/* Body Details */}
                <div className="space-y-2 text-xs">
                  {/* Origin to Destination */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Origem
                      </span>
                      <span className="font-semibold">{req.setorOrigem}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Destino Solicitado
                      </span>
                      <span className="font-semibold text-purple-900">
                        {destSector ? destSector.nome : 'Setor Indefinido'}
                      </span>
                      {destBed && (
                        <div className="text-[11px] font-bold text-purple-700">
                          {destBed.numero}{' '}
                          <span className={`text-[9px] px-1 rounded ${
                            destBed.status === 'OCUPADO' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            ({destBed.status})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnóstico e Justificativa */}
                  {req.diagnostico && (
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">
                        Diagnóstico / Motivo
                      </span>
                      <p className="text-slate-700 font-medium">{req.diagnostico}</p>
                    </div>
                  )}

                  {req.justificativaClinica && (
                    <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-100 text-purple-950">
                      <span className="text-purple-800 text-[10px] font-bold uppercase block">
                        Justificativa Clínica
                      </span>
                      <p className="text-[11px] italic">{req.justificativaClinica}</p>
                    </div>
                  )}
                </div>

                {/* Footer & Status Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'AGUARDANDO_DESOCUPACAO'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : req.status === 'APROVADA'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : req.status === 'CONCLUIDA'
                          ? 'bg-slate-100 text-slate-700'
                          : req.status === 'CANCELADA'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      Status: {req.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {req.dataSolicitacao}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {req.status !== 'APROVADA' && req.status !== 'CONCLUIDA' && (
                      <button
                        onClick={() => onUpdateVacancyStatus(req.id, 'APROVADA')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Aprovar Vaga
                      </button>
                    )}

                    {req.status === 'APROVADA' && (
                      <button
                        onClick={() => onUpdateVacancyStatus(req.id, 'CONCLUIDA')}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold"
                      >
                        Concluir Internação
                      </button>
                    )}

                    {req.status !== 'CANCELADA' && req.status !== 'CONCLUIDA' && (
                      <button
                        onClick={() => onUpdateVacancyStatus(req.id, 'CANCELADA')}
                        className="px-2 py-1 text-slate-500 hover:text-rose-700 text-xs"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white rounded-2xl p-8 text-center border border-slate-200">
            <GitPullRequest className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-sm text-slate-700">
              Nenhuma solicitação encontrada neste filtro.
            </div>
            <p className="text-xs text-slate-500">
              Clique em &quot;Nova Solicitação de Vaga&quot; para cadastrar pedidos para leitos vagos ou ocupados.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: NOVA SOLICITAÇÃO DE VAGA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <HMWGLogo size="sm" className="flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                    Solicitar Vaga de Leito Hospitalar
                  </h3>
                  <p className="text-[10px] sm:text-xs text-purple-200">
                    Regulação Interna HMWG
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  if (onClearPreSelectedBed) onClearPreSelectedBed();
                }}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo do Paciente Solicitante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do paciente"
                    value={pacienteNome}
                    onChange={(e) => setPacienteNome(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prontuário HMWG
                  </label>
                  <input
                    type="text"
                    value={prontuario}
                    onChange={(e) => setProntuario(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      Data de Nascimento
                    </span>
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={dataNascimento}
                    onChange={(e) => handleDataNascimentoChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-purple-50/40 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Idade (anos)</span>
                    <span className="text-[10px] text-purple-700 font-semibold">
                      {idade !== '' && idade > 0 ? `${idade} anos` : 'Automática'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    placeholder="Calculada da data de nasc."
                    value={idade}
                    onChange={(e) => setIdade(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold text-slate-800 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setor de Origem *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: PS Sala Vermelha, UPA Esperança, CTI..."
                    value={setorOrigem}
                    onChange={(e) => setSetorOrigem(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridade Clínica
                  </label>
                  <select
                    value={prioridade}
                    onChange={(e) =>
                      setPrioridade(
                        e.target.value as
                          | 'VERMELHA (Emergência)'
                          | 'AMARELA (Urgente)'
                          | 'VERDE (Eletiva/Transferência)'
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="VERMELHA (Emergência)">VERMELHA (Emergência / Risco Iminente)</option>
                    <option value="AMARELA (Urgente)">AMARELA (Urgente / Sem risco imediato)</option>
                    <option value="VERDE (Eletiva/Transferência)">VERDE (Eletiva / Transferência)</option>
                  </select>
                </div>

                {/* DESTINO & LEITO (MESMO SE OCUPADO) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setor de Destino Solicitado *
                  </label>
                  <select
                    value={setorDestinoId}
                    onChange={(e) => {
                      setSetorDestinoId(e.target.value);
                      setLeitoDesejadoId('');
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} ({s.sigla})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Leito Específico Solicitado (Mesmo se ocupado!)
                  </label>
                  <select
                    value={leitoDesejadoId}
                    onChange={(e) => setLeitoDesejadoId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white font-medium"
                  >
                    <option value="">Qualquer leito disponível do setor</option>
                    {targetBeds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.numero} — [{b.status}]
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-purple-700 font-medium block mt-1">
                    💡 Dica: Você pode selecionar um leito mesmo com status OCUPADO. O sistema colocará em fila de desocupação.
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diagnóstico Clínico / Justificativa da Vaga
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Choque Séptico, TCE pós trauma, necessita suporte de VM"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observações e Justificativa Detalhada
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes clínicos, previsão de alta do leito pretendido, exames..."
                    value={justificativaClinica}
                    onChange={(e) => setJustificativaClinica(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profissional Solicitante
                  </label>
                  <input
                    type="text"
                    value={solicitanteNome}
                    onChange={(e) => setSolicitanteNome(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (onClearPreSelectedBed) onClearPreSelectedBed();
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  Confirmar Solicitação de Vaga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

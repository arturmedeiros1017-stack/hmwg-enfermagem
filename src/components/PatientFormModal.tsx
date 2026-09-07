import React, { useEffect, useState } from 'react';
import {
  Bed,
  DeambulationType,
  DressingFrequency,
  IsolationType,
  MentalState,
  MobilityType,
  NutritionType,
  OxygenationType,
  Patient,
  PatientClassification,
  TissueImpairment,
  VitalSignsInterval,
} from '../types';
import { calculatePatientScore } from '../utils/assignment';
import { calculateAge } from '../utils/dateUtils';
import { HMWGLogo } from './HMWGLogo';
import {
  X,
  AlertTriangle,
  HeartPulse,
  Activity,
  Wind,
  Brain,
  Utensils,
  Bandage,
  ShieldAlert,
  Save,
  Trash2,
  Calendar,
} from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: Bed | null;
  patientToEdit?: Patient | null;
  onSavePatient: (patient: Patient) => void;
  onDischargePatient?: (patientId: string, bedId: string) => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  bed,
  patientToEdit,
  onSavePatient,
  onDischargePatient,
}) => {
  const [nome, setNome] = useState('');
  const [prontuario, setProntuario] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [idade, setIdade] = useState<number>(0);
  const [dataInternacao, setDataInternacao] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [classificacao, setClassificacao] =
    useState<PatientClassification>('Cuidados Intermediários');
  const [traqueostomia, setTraqueostomia] = useState(false);
  const [tipoIsolamento, setTipoIsolamento] = useState<IsolationType>('Padrão');
  const [alergia, setAlergia] = useState('Nenhuma conhecida');
  const [estadoMental, setEstadoMental] = useState<MentalState>('Lúcido e Orientado');
  const [oxigenacao, setOxigenacao] = useState<OxygenationType>('Ar Ambiente');
  const [sinaisVitais, setSinaisVitais] = useState<VitalSignsInterval>('4 em 4 horas');
  const [mobilidade, setMobilidade] = useState<MobilityType>('Ativa no leito');
  const [deambulacao, setDeambulacao] = useState<DeambulationType>('Deambula sem auxílio');
  const [alimentacao, setAlimentacao] = useState<NutritionType>('Oral livre');
  const [curativo, setCurativo] = useState<DressingFrequency>('sem curativo');
  const [comprometimentoTecidual, setComprometimentoTecidual] =
    useState<TissueImpairment>('Pele íntegra');
  const [diagnostico, setDiagnostico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [pontuacaoManual, setPontuacaoManual] = useState<number | null>(null);

  const handleDataNascimentoChange = (newDate: string) => {
    setDataNascimento(newDate);
    if (newDate) {
      const calculated = calculateAge(newDate);
      setIdade(calculated);
    }
  };

  useEffect(() => {
    if (patientToEdit) {
      setNome(patientToEdit.nome);
      setProntuario(patientToEdit.prontuario);
      setDataNascimento(patientToEdit.dataNascimento || '');
      if (patientToEdit.dataNascimento) {
        setIdade(calculateAge(patientToEdit.dataNascimento));
      } else {
        setIdade(patientToEdit.idade || 0);
      }
      setDataInternacao(patientToEdit.dataInternacao);
      setClassificacao(patientToEdit.classificacao);
      setTraqueostomia(patientToEdit.traqueostomia);
      setTipoIsolamento(patientToEdit.tipoIsolamento);
      setAlergia(patientToEdit.alergia);
      setEstadoMental(patientToEdit.estadoMental);
      setOxigenacao(patientToEdit.oxigenacao);
      setSinaisVitais(patientToEdit.sinaisVitais);
      setMobilidade(patientToEdit.mobilidade);
      setDeambulacao(patientToEdit.deambulacao);
      setAlimentacao(patientToEdit.alimentacao);
      setCurativo(patientToEdit.curativo);
      setComprometimentoTecidual(patientToEdit.comprometimentoTecidual);
      setDiagnostico(patientToEdit.diagnostico || '');
      setObservacoes(patientToEdit.observacoes || '');
      setPontuacaoManual(patientToEdit.pontuacao);
    } else {
      setNome('');
      setProntuario('');
      setDataNascimento('');
      setIdade(0);
      setDataInternacao(new Date().toISOString().split('T')[0]);
      setClassificacao('Cuidados Intermediários');
      setTraqueostomia(false);
      setTipoIsolamento('Padrão');
      setAlergia('Nenhuma conhecida');
      setEstadoMental('Lúcido e Orientado');
      setOxigenacao('Ar Ambiente');
      setSinaisVitais('4 em 4 horas');
      setMobilidade('Ativa no leito');
      setDeambulacao('Deambula sem auxílio');
      setAlimentacao('Oral livre');
      setCurativo('sem curativo');
      setComprometimentoTecidual('Pele íntegra');
      setDiagnostico('');
      setObservacoes('');
      setPontuacaoManual(null);
    }
  }, [patientToEdit, bed, isOpen]);

  if (!isOpen || !bed) return null;

  // Auto-calculated score
  const calculatedScore = calculatePatientScore({
    classificacao,
    traqueostomia,
    estadoMental,
    oxigenacao,
    sinaisVitais,
    mobilidade,
    deambulacao,
    alimentacao,
    curativo,
    comprometimentoTecidual,
  });

  const finalScore = pontuacaoManual !== null ? pontuacaoManual : calculatedScore;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const patientData: Patient = {
      id: patientToEdit ? patientToEdit.id : `pat-${Date.now()}`,
      leitoId: bed.id,
      setorId: bed.setorId,
      nome: nome.trim(),
      prontuario: prontuario.trim(),
      dataNascimento: dataNascimento || undefined,
      idade: Number(idade) || 0,
      dataInternacao,
      classificacao,
      traqueostomia,
      tipoIsolamento,
      alergia: alergia.trim() || 'Nenhuma informada',
      estadoMental,
      oxigenacao,
      sinaisVitais,
      mobilidade,
      deambulacao,
      alimentacao,
      curativo,
      comprometimentoTecidual,
      pontuacao: finalScore,
      diagnostico: diagnostico.trim(),
      observacoes: observacoes.trim(),
    };

    onSavePatient(patientData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 to-cyan-900 text-white p-3 sm:p-5 flex items-start sm:items-center justify-between border-b border-sky-700 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <HMWGLogo size="sm" className="flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-bold text-white leading-tight">
                  {patientToEdit ? 'Editar Prontuário de Enfermagem' : 'Internar Paciente no Leito'}
                </h2>
                <span className="bg-sky-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                  {bed.numero}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-sky-200 hidden sm:block">
                Hospital Monsenhor Walfredo Gurgel • Avaliação Clínica e Cuidados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live Pontuação / Score Badge */}
            <div className="bg-white/10 border border-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-right">
              <span className="text-[9px] sm:text-[10px] text-cyan-200 uppercase font-bold block leading-none">
                Pontuação Total
              </span>
              <span className="text-base sm:text-lg font-black text-white leading-tight">
                {finalScore} <span className="text-[10px] sm:text-xs font-normal text-cyan-300">pts</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Dados de Identificação */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              1. Identificação Básica do Paciente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Paciente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do paciente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nº do Prontuário HMWG *
                </label>
                <input
                  type="text"
                  placeholder="Preencher manualmente"
                  value={prontuario}
                  onChange={(e) => setProntuario(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    Data de Nascimento *
                  </span>
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={dataNascimento}
                  onChange={(e) => handleDataNascimentoChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-sky-50/50 font-medium text-slate-800"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Idade (em anos)</span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                    Calculada automaticamente
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="130"
                    value={idade !== 0 ? idade : ''}
                    onChange={(e) => setIdade(Number(e.target.value))}
                    placeholder="Definida pela data de nascimento"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-slate-800 bg-slate-50"
                  />
                  {idade > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded pointer-events-none">
                      {idade} {idade === 1 ? 'ano' : 'anos'}
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnóstico Médico / Hipótese Diagnóstica
                </label>
                <input
                  type="text"
                  placeholder="ex: Politraumatismo, TCE, Pós-Op Laparotomia..."
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Internação
                </label>
                <input
                  type="date"
                  value={dataInternacao}
                  onChange={(e) => setDataInternacao(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Alertas Críticos (Traqueostomia, Alergias, Isolamento) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              2. Alertas Críticos & Precauções de Biossegurança
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Traqueostomia Toggle */}
              <div className="sm:col-span-4 bg-white p-3 rounded-lg border border-amber-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Possui Traqueostomia?
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Aparelho TQT / Cânula
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={traqueostomia}
                    onChange={(e) => {
                      setTraqueostomia(e.target.checked);
                      if (e.target.checked && oxigenacao === 'Ar Ambiente') {
                        setOxigenacao('Traqueostomia com Macronebulização');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  <span
                    className={`ml-2 text-xs font-black ${
                      traqueostomia ? 'text-rose-700' : 'text-slate-400'
                    }`}
                  >
                    {traqueostomia ? 'SIM (TQT)' : 'NÃO'}
                  </span>
                </label>
              </div>

              {/* Tipo de Isolamento */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Isolamento / Precaução
                </label>
                <select
                  value={tipoIsolamento}
                  onChange={(e) => setTipoIsolamento(e.target.value as IsolationType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Padrão">Padrão</option>
                  <option value="Contato">Contato (Bactéria Multirresistente)</option>
                  <option value="Gotículas">Gotículas</option>
                  <option value="Aerossóis">Aerossóis (TB / COVID / Varicela)</option>
                  <option value="Protetor / Reverso">Protetor / Reverso (Neutropênico)</option>
                </select>
              </div>

              {/* Alergias */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-rose-800 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Alergias Relatadas
                </label>
                <input
                  type="text"
                  placeholder="ex: Dipirona, Penicilina, Látex..."
                  value={alergia}
                  onChange={(e) => setAlergia(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-rose-50/50 text-rose-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Classificação e Estado Geral */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-sky-600" />
              3. Classificação & Estado Geral do Paciente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Classificação (Estado geral) */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classificação de Complexidade *
                </label>
                <select
                  value={classificacao}
                  onChange={(e) =>
                    setClassificacao(e.target.value as PatientClassification)
                  }
                  className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Cuidados Mínimos">Cuidados Mínimos</option>
                  <option value="Cuidados Intermediários">Cuidados Intermediários</option>
                  <option value="Alta Dependência">Alta Dependência</option>
                  <option value="Semi-Intensivo">Semi-Intensivo</option>
                  <option value="Intensivo">Intensivo (Crítico)</option>
                </select>
              </div>

              {/* Estado Mental */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  Estado Mental
                </label>
                <select
                  value={estadoMental}
                  onChange={(e) => setEstadoMental(e.target.value as MentalState)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Lúcido e Orientado">Lúcido e Orientado</option>
                  <option value="Confuso / Desorientado">Confuso / Desorientado</option>
                  <option value="Sonolento">Sonolento</option>
                  <option value="Torporoso">Torporoso</option>
                  <option value="Comatoso (Glasgow ≤ 8)">Comatoso (Glasgow ≤ 8)</option>
                  <option value="Sedado (RASS -3 a -5)">Sedado (RASS -3 a -5)</option>
                </select>
              </div>

              {/* Oxigenação */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-cyan-600" />
                  Suporte Ventilatório / Oxigenação
                </label>
                <select
                  value={oxigenacao}
                  onChange={(e) => setOxigenacao(e.target.value as OxygenationType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Ar Ambiente">Ar Ambiente</option>
                  <option value="Cateter Nasal O2">Cateter Nasal O2</option>
                  <option value="Máscara de Venturi">Máscara de Venturi</option>
                  <option value="Máscara com Reservatório">Máscara com Reservatório</option>
                  <option value="Cânula de Alto Fluxo (CNAF)">Cânula de Alto Fluxo (CNAF)</option>
                  <option value="Traqueostomia com Macronebulização">Traqueostomia com Macronebulização</option>
                  <option value="Ventilação Mecânica (VM/TOT)">Ventilação Mecânica (VM/TOT)</option>
                  <option value="Ventilação Mecânica via TQT">Ventilação Mecânica via TQT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Monitorização, Mobilidade, Alimentação */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              4. Rotina Assistencial & Dependência Física
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Sinais Vitais (intervalo) */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sinais Vitais (Intervalos) *
                </label>
                <select
                  value={sinaisVitais}
                  onChange={(e) => setSinaisVitais(e.target.value as VitalSignsInterval)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="2 em 2 horas">2 em 2 horas (Crítico)</option>
                  <option value="4 em 4 horas">4 em 4 horas (Vigilância)</option>
                  <option value="6 em 6 horas">6 em 6 horas (Padrão)</option>
                  <option value="12 em 12 horas">12 em 12 horas (Mínimo)</option>
                </select>
              </div>

              {/* Mobilidade */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobilidade no Leito
                </label>
                <select
                  value={mobilidade}
                  onChange={(e) => setMobilidade(e.target.value as MobilityType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Ativa no leito">Ativa no leito</option>
                  <option value="Passiva">Passiva (Auxílio 100%)</option>
                  <option value="Restrita">Restrita</option>
                  <option value="Repouso Absoluto">Repouso Absoluto</option>
                </select>
              </div>

              {/* Deambulação */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deambulação
                </label>
                <select
                  value={deambulacao}
                  onChange={(e) => setDeambulacao(e.target.value as DeambulationType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Deambula sem auxílio">Deambula sem auxílio</option>
                  <option value="Deambula com auxílio">Deambula com auxílio</option>
                  <option value="Cadeirante">Cadeirante</option>
                  <option value="Acamado">Acamado</option>
                </select>
              </div>

              {/* Alimentação */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  Alimentação / Dieta
                </label>
                <select
                  value={alimentacao}
                  onChange={(e) => setAlimentacao(e.target.value as NutritionType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Oral livre">Oral livre</option>
                  <option value="Oral pastosa / branda">Oral pastosa / branda</option>
                  <option value="Sonda Nasoenteral (SNE)">Sonda Nasoenteral (SNE)</option>
                  <option value="Gastrostomia (GTT)">Gastrostomia (GTT)</option>
                  <option value="Nutrição Parenteral (NPT)">Nutrição Parenteral (NPT)</option>
                  <option value="Jejum">Jejum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Curativo e Comprometimento Tecidual */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bandage className="w-4 h-4 text-emerald-600" />
              5. Integridade Cutânea & Curativos (Exato Requisito)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Curativo Frequency - REQUIRED EXACT OPTIONS */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Frequência de Curativo *
                </label>
                <select
                  value={curativo}
                  onChange={(e) => setCurativo(e.target.value as DressingFrequency)}
                  className="w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="troca 3x dia">troca 3x dia (Alta complexidade)</option>
                  <option value="troca 2x dia">troca 2x dia</option>
                  <option value="troca 1x dia">troca 1x dia</option>
                  <option value="sem curativo">sem curativo</option>
                  <option value="a definir">a definir</option>
                </select>
              </div>

              {/* Comprometimento Tecidual */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Comprometimento Tecidual (Lesão / Risco)
                </label>
                <select
                  value={comprometimentoTecidual}
                  onChange={(e) =>
                    setComprometimentoTecidual(e.target.value as TissueImpairment)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Pele íntegra">Pele íntegra</option>
                  <option value="Risco de Lesão por Pressão (Braden)">
                    Risco de Lesão por Pressão (Escala Braden)
                  </option>
                  <option value="Lesão por Pressão Estágio 1">
                    Lesão por Pressão Estágio 1 (Hiperemia não branqueável)
                  </option>
                  <option value="Lesão por Pressão Estágio 2">
                    Lesão por Pressão Estágio 2 (Perda parcial)
                  </option>
                  <option value="Lesão por Pressão Estágio 3">
                    Lesão por Pressão Estágio 3 (Perda total de tecido)
                  </option>
                  <option value="Lesão por Pressão Estágio 4">
                    Lesão por Pressão Estágio 4 (Exposição óssea/tendínea)
                  </option>
                  <option value="Lesão Não Classificável">
                    Lesão Não Classificável (Necrose/Escara)
                  </option>
                  <option value="Ferida Operatória / Lesão por Fricção">
                    Ferida Operatória / Lesão por Fricção
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Observações de Enfermagem & Pontuação */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Observações de Enfermagem / Metas do Plantão
              </label>
              <span className="text-[11px] text-slate-500">
                Cálculo Automático de Score: <strong>{calculatedScore} pts</strong>
              </span>
            </div>
            <textarea
              rows={2}
              placeholder="Anotações importantes sobre acessos vasculares, drenos, sondas, orientações à família..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 px-4 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            {patientToEdit && onDischargePatient && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Confirmar alta / liberação do ${bed.numero} para o paciente ${patientToEdit.nome}?`
                    )
                  ) {
                    onDischargePatient(patientToEdit.id, bed.id);
                    onClose();
                  }
                }}
                className="w-full sm:w-auto px-3 py-2.5 sm:py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Registrar Alta / Desocupar Leito
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Dados do Paciente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

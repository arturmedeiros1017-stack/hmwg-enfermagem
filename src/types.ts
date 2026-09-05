export type BedStatus = 'OCUPADO' | 'DESOCUPADO' | 'BLOQUEADO' | 'HIGIENIZACAO';

export type PatientClassification =
  | 'Cuidados Mínimos'
  | 'Cuidados Intermediários'
  | 'Alta Dependência'
  | 'Semi-Intensivo'
  | 'Intensivo';

export type IsolationType =
  | 'Padrão'
  | 'Contato'
  | 'Gotículas'
  | 'Aerossóis'
  | 'Protetor / Reverso';

export type MentalState =
  | 'Lúcido e Orientado'
  | 'Confuso / Desorientado'
  | 'Sonolento'
  | 'Torporoso'
  | 'Comatoso (Glasgow ≤ 8)'
  | 'Sedado (RASS -3 a -5)';

export type OxygenationType =
  | 'Ar Ambiente'
  | 'Cateter Nasal O2'
  | 'Máscara de Venturi'
  | 'Máscara com Reservatório'
  | 'Cânula de Alto Fluxo (CNAF)'
  | 'Traqueostomia com Macronebulização'
  | 'Ventilação Mecânica (VM/TOT)'
  | 'Ventilação Mecânica via TQT';

export type VitalSignsInterval =
  | '2 em 2 horas'
  | '4 em 4 horas'
  | '6 em 6 horas'
  | '12 em 12 horas';

export type MobilityType =
  | 'Ativa no leito'
  | 'Passiva'
  | 'Restrita'
  | 'Repouso Absoluto';

export type DeambulationType =
  | 'Deambula sem auxílio'
  | 'Deambula com auxílio'
  | 'Cadeirante'
  | 'Acamado';

export type NutritionType =
  | 'Oral livre'
  | 'Oral pastosa / branda'
  | 'Sonda Nasoenteral (SNE)'
  | 'Nutrição Parenteral (NPT)'
  | 'Gastrostomia (GTT)'
  | 'Jejum';

export type DressingFrequency =
  | 'troca 3x dia'
  | 'troca 2x dia'
  | 'troca 1x dia'
  | 'sem curativo'
  | 'a definir';

export type TissueImpairment =
  | 'Pele íntegra'
  | 'Risco de Lesão por Pressão (Braden)'
  | 'Lesão por Pressão Estágio 1'
  | 'Lesão por Pressão Estágio 2'
  | 'Lesão por Pressão Estágio 3'
  | 'Lesão por Pressão Estágio 4'
  | 'Lesão Não Classificável'
  | 'Ferida Operatória / Lesão por Fricção';

export interface Patient {
  id: string;
  leitoId: string;
  setorId: string;
  nome: string;
  prontuario: string;
  idade: number;
  dataInternacao: string;
  classificacao: PatientClassification;
  traqueostomia: boolean;
  tipoIsolamento: IsolationType;
  alergia: string;
  estadoMental: MentalState;
  oxigenacao: OxygenationType;
  sinaisVitais: VitalSignsInterval;
  mobilidade: MobilityType;
  deambulacao: DeambulationType;
  alimentacao: NutritionType;
  curativo: DressingFrequency;
  comprometimentoTecidual: TissueImpairment;
  pontuacao: number; // Fugulin / Perroca score
  diagnostico?: string;
  observacoes?: string;
  previsaoAlta?: string;
}

export interface Bed {
  id: string;
  numero: string; // e.g. "Leito 01", "Leito 102-A"
  setorId: string;
  status: BedStatus;
  motivoBloqueio?: string;
  solicitacaoVagaAtiva?: boolean;
}

export interface Sector {
  id: string;
  nome: string;
  sigla: string;
  descricao: string;
  cor: string;
  capacidadeTotal: number;
}

export interface Nurse {
  id: string;
  nome: string;
  coren: string;
  cargo: 'Enfermeiro Assistencial' | 'Enfermeiro Chefe / RT' | 'Enfermeiro Rotina' | 'Coordenador de Enfermagem';
  email: string;
  senha?: string;
  turno: 'Diurno (07h-19h)' | 'Noturno (19h-07h)' | 'Ambos';
  telefone: string;
  fotoUrl?: string;
}

export interface Technician {
  id: string;
  nome: string;
  coren: string;
  turno: 'Diurno (07h-19h)' | 'Noturno (19h-07h)';
  presenteNoPlantao: boolean;
  setorId?: string;
  observacao?: string;
}

export type EmployeeCategory =
  | 'Enfermeiro(a)'
  | 'Técnico(a) de Enfermagem'
  | 'Auxiliar de Enfermagem'
  | 'Médico(a)'
  | 'Fisioterapeuta'
  | 'Apoio / Administrativo';

export type EmployeeStatus = 'ATIVO' | 'INATIVO' | 'LICENCA' | 'AFASTADO';

export type ContractType =
  | 'Efetivo SESAP/RN'
  | 'Contrato Temporário'
  | 'Cooperado'
  | 'Residente'
  | 'Terceirizado';

export type CouncilType = 'COREN' | 'CRM' | 'CREFITO' | 'OUTRO' | 'NÃO APLICÁVEL';

export type EmployeeTurn =
  | 'Diurno (07h-19h)'
  | 'Noturno (19h-07h)'
  | 'Diarista 30h'
  | 'Diarista 40h'
  | 'Ambos / Plantonista';

export interface Employee {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  categoria: EmployeeCategory;
  cargo: string;
  conselhoTipo: CouncilType;
  conselhoNumero: string;
  email: string;
  telefone: string;
  setorPadraoId: string;
  regimeContratual: ContractType;
  turnoPadrao: EmployeeTurn;
  status: EmployeeStatus;
  dataAdmissao: string;
  fotoUrl?: string;
  observacoes?: string;
  senha?: string;
}


export interface VacancyRequest {
  id: string;
  pacienteNome: string;
  prontuario: string;
  idade?: number;
  setorOrigem: string;
  setorDestinoId: string;
  leitoDesejadoId?: string; // Pode ser solicitado mesmo que o leito esteja ocupado
  prioridade: 'VERMELHA (Emergência)' | 'AMARELA (Urgente)' | 'VERDE (Eletiva/Transferência)';
  diagnostico: string;
  justificativaClinica: string;
  dataSolicitacao: string;
  status: 'PENDENTE' | 'APROVADA' | 'AGUARDANDO_DESOCUPACAO' | 'CANCELADA' | 'CONCLUIDA';
  solicitanteNome: string;
}

export interface ShiftConfig {
  id: string;
  data: string;
  turno: 'Diurno (07h às 19h)' | 'Noturno (19h às 07h)';
  setorId: string;
  enfermeirosResponsaveisIds: string[]; // Multiplos enfermeiros por plantão
  enfermeiroLeitosMap: Record<string, string[]>; // enfermeiroId -> array de leitoIds
  observacoesPlantao?: string;
}

export interface TechnicianCareAssignment {
  tecnicoId: string;
  tecnicoNome: string;
  tecnicoCoren: string;
  leitoIds: string[];
  totalPontuacao: number;
  totalPacientes: number;
  totalTraqueostomizados: number;
}

export interface NursingAssignmentResult {
  dataGeracao: string;
  setor: Sector;
  turno: string;
  enfermeirosResponsaveis: {
    enfermeiro: Nurse;
    leitosAtribuidos: Bed[];
  }[];
  distribuicaoTecnicos: {
    tecnico: Technician;
    leitos: {
      leito: Bed;
      paciente?: Patient;
    }[];
    totalPontuacao: number;
    totalTraqueostomizados: number;
  }[];
  leitosDesocupados: Bed[];
  leitosBloqueados: Bed[];
}

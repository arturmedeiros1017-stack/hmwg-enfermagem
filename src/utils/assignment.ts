import {
  Bed,
  Nurse,
  NursingAssignmentResult,
  Patient,
  PatientClassification,
  Sector,
  ShiftConfig,
  Technician,
} from '../types';

/**
 * Calculates Fugulin/HMWG Nursing Care Complexity Score based on clinical parameters
 */
export function calculatePatientScore(p: Partial<Patient>): number {
  let score = 0;

  // 1. Classification weight
  const classWeights: Record<PatientClassification, number> = {
    'Cuidados Mínimos': 2,
    'Cuidados Intermediários': 4,
    'Alta Dependência': 6,
    'Semi-Intensivo': 8,
    'Intensivo': 10,
  };
  score += classWeights[p.classificacao || 'Cuidados Mínimos'] || 2;

  // 2. Traqueostomia (Airway management)
  if (p.traqueostomia) {
    score += 4; // High nursing demand: suction, cannula cleaning, cuff pressure
  }

  // 3. Estado Mental
  if (p.estadoMental?.includes('Sedado') || p.estadoMental?.includes('Comatoso')) {
    score += 4;
  } else if (p.estadoMental?.includes('Torporoso')) {
    score += 3;
  } else if (p.estadoMental?.includes('Confuso') || p.estadoMental?.includes('Sonolento')) {
    score += 2;
  } else {
    score += 1;
  }

  // 4. Oxigenação
  if (p.oxigenacao?.includes('Ventilação Mecânica')) {
    score += 4;
  } else if (p.oxigenacao?.includes('CNAF') || p.oxigenacao?.includes('Macronebulização') || p.oxigenacao?.includes('Reservatório')) {
    score += 3;
  } else if (p.oxigenacao?.includes('Cateter Nasal')) {
    score += 2;
  } else {
    score += 1;
  }

  // 5. Sinais Vitais Interval
  if (p.sinaisVitais === '2 em 2 horas') score += 4;
  else if (p.sinaisVitais === '4 em 4 horas') score += 3;
  else if (p.sinaisVitais === '6 em 6 horas') score += 2;
  else score += 1;

  // 6. Mobilidade & Deambulação
  if (p.mobilidade === 'Repouso Absoluto' || p.deambulacao === 'Acamado') score += 4;
  else if (p.deambulacao === 'Cadeirante' || p.mobilidade === 'Passiva') score += 3;
  else if (p.deambulacao === 'Deambula com auxílio' || p.mobilidade === 'Restrita') score += 2;
  else score += 1;

  // 7. Alimentação
  if (p.alimentacao === 'Nutrição Parenteral (NPT)' || p.alimentacao === 'Jejum') score += 4;
  else if (p.alimentacao === 'Sonda Nasoenteral (SNE)' || p.alimentacao === 'Gastrostomia (GTT)') score += 3;
  else if (p.alimentacao === 'Oral pastosa / branda') score += 2;
  else score += 1;

  // 8. Curativo
  if (p.curativo === 'troca 3x dia') score += 4;
  else if (p.curativo === 'troca 2x dia') score += 3;
  else if (p.curativo === 'troca 1x dia') score += 2;
  else score += 1;

  // 9. Comprometimento Tecidual
  if (
    p.comprometimentoTecidual?.includes('Estágio 3') ||
    p.comprometimentoTecidual?.includes('Estágio 4') ||
    p.comprometimentoTecidual?.includes('Não Classificável')
  ) {
    score += 4;
  } else if (
    p.comprometimentoTecidual?.includes('Estágio 1') ||
    p.comprometimentoTecidual?.includes('Estágio 2') ||
    p.comprometimentoTecidual?.includes('Ferida')
  ) {
    score += 3;
  } else if (p.comprometimentoTecidual?.includes('Risco')) {
    score += 2;
  } else {
    score += 1;
  }

  return score;
}

/**
 * Distributes occupied beds across present technicians in an equitable manner,
 * taking into account patient complexity and tracheostomy status.
 */
export function generateNursingAssignment(
  sector: Sector,
  beds: Bed[],
  patients: Patient[],
  nurses: Nurse[],
  technicians: Technician[],
  shift: ShiftConfig
): NursingAssignmentResult {
  const sectorBeds = beds.filter((b) => b.setorId === sector.id);

  // Group beds by status
  const occupiedBeds = sectorBeds.filter((b) => b.status === 'OCUPADO');
  const leitosDesocupados = sectorBeds.filter((b) => b.status === 'DESOCUPADO' || b.status === 'HIGIENIZACAO');
  const leitosBloqueados = sectorBeds.filter((b) => b.status === 'BLOQUEADO');

  // Find present technicians
  const presentTechs = technicians.filter(
    (t) => t.presenteNoPlantao && (!t.setorId || t.setorId === sector.id)
  );

  // Map occupied beds to their patients
  const patientMap = new Map<string, Patient>();
  patients.forEach((p) => {
    patientMap.set(p.leitoId, p);
  });

  const occupiedBedItems = occupiedBeds.map((bed) => ({
    bed,
    patient: patientMap.get(bed.id),
  }));

  // Sort occupied beds by:
  // 1. Tracheostomy (TQT first)
  // 2. Total score descending
  occupiedBedItems.sort((a, b) => {
    const aTqt = a.patient?.traqueostomia ? 1 : 0;
    const bTqt = b.patient?.traqueostomia ? 1 : 0;
    if (aTqt !== bTqt) return bTqt - aTqt;
    const aScore = a.patient?.pontuacao || 0;
    const bScore = b.patient?.pontuacao || 0;
    return bScore - aScore;
  });

  // Prepare technician distribution buckets
  type TechBucket = {
    tecnico: Technician;
    leitos: { leito: Bed; paciente?: Patient }[];
    totalPontuacao: number;
    totalTraqueostomizados: number;
  };

  const distributionTecnicos: TechBucket[] = presentTechs.length > 0
    ? presentTechs.map((tech) => ({
        tecnico: tech,
        leitos: [],
        totalPontuacao: 0,
        totalTraqueostomizados: 0,
      }))
    : [
        {
          tecnico: {
            id: 'temp-tec',
            nome: 'Técnico Plantonista Geral',
            coren: 'COREN-RN (Plantão)',
            turno: 'Diurno (07h-19h)',
            presenteNoPlantao: true,
          },
          leitos: [],
          totalPontuacao: 0,
          totalTraqueostomizados: 0,
        },
      ];

  // Distribute beds balancing tracheostomies and total score
  for (const item of occupiedBedItems) {
    const isTqt = item.patient?.traqueostomia || false;
    const score = item.patient?.pontuacao || 15;

    // Pick the technician with lowest score (and if tie or TQT, lowest TQT count)
    distributionTecnicos.sort((a, b) => {
      if (isTqt && a.totalTraqueostomizados !== b.totalTraqueostomizados) {
        return a.totalTraqueostomizados - b.totalTraqueostomizados;
      }
      return a.totalPontuacao - b.totalPontuacao;
    });

    const targetTech = distributionTecnicos[0];
    targetTech.leitos.push({
      leito: item.bed,
      paciente: item.patient,
    });
    targetTech.totalPontuacao += score;
    if (isTqt) {
      targetTech.totalTraqueostomizados += 1;
    }
  }

  // Sort back by technician name
  distributionTecnicos.sort((a, b) => a.tecnico.nome.localeCompare(b.tecnico.nome));

  // Build assigned nurses structure with their assigned beds
  const enfermeirosResponsaveis = shift.enfermeirosResponsaveisIds.map((nurseId) => {
    const nurse = nurses.find((n) => n.id === nurseId) || {
      id: nurseId,
      nome: 'Enfermeiro Responsável',
      coren: 'COREN-RN',
      cargo: 'Enfermeiro Assistencial' as const,
      email: '',
      turno: 'Diurno (07h-19h)' as const,
      telefone: '',
    };

    const assignedBedIds = shift.enfermeiroLeitosMap?.[nurseId] || [];
    const leitosAtribuidos = sectorBeds.filter((b) => assignedBedIds.includes(b.id));

    return {
      enfermeiro: nurse,
      leitosAtribuidos,
    };
  });

  return {
    dataGeracao: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    setor: sector,
    turno: shift.turno,
    enfermeirosResponsaveis,
    distribuicaoTecnicos: distributionTecnicos,
    leitosDesocupados,
    leitosBloqueados,
  };
}

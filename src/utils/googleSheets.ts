/**
 * Google Sheets API Client
 *
 * Este módulo conecta o frontend ao Google Apps Script que serve como backend.
 *
 * CONFIGURAÇÃO:
 * 1. Crie uma planilha no Google Sheets
 * 2. Adicione o Google Apps Script (veja googleAppsScript.ts)
 * 3. Implante como aplicativo da web
 * 4. Configure a URL no arquivo .env:
 *    VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/SUA_URL/exec
 */

import {
  Bed,
  Employee,
  Nurse,
  Patient,
  Sector,
  ShiftConfig,
  SystemUser,
  Technician,
  VacancyRequest,
} from '../types';

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxz_pw7OWeyRXOQx1hDJ2guFCS9J0K24GprgStc8-cIrJjJqwDUCvEQ8MFkjdadq5iP/exec';
const rawEnvUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
const API_URL = (rawEnvUrl && rawEnvUrl.trim())
  ? rawEnvUrl.trim().replace(/^["']|["']$/g, '')
  : DEFAULT_API_URL;
const USE_GOOGLE_SHEETS = Boolean(API_URL);

// Helper para fazer requisições
async function request(action: string, sheet: string, params: Record<string, any> = {}): Promise<any> {
  if (!USE_GOOGLE_SHEETS) {
    throw new Error('Google Sheets não configurado. Defina VITE_GOOGLE_SHEETS_URL no .env');
  }

  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('sheet', sheet);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
}

async function requestPost(action: string, sheet: string, data: any): Promise<any> {
  if (!USE_GOOGLE_SHEETS) {
    throw new Error('Google Sheets não configurado. Defina VITE_GOOGLE_SHEETS_URL no .env');
  }

  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('sheet', sheet);

  const body = JSON.stringify(data);
  console.log(`[GS POST] ${action} → ${sheet} (${body.length} bytes)`);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: body,
      redirect: 'follow',
    });

    const text = await response.text();
    console.log(`[GS POST] ${action} ← ${sheet} status=${response.status} body=${text.substring(0, 300)}`);
    try {
      return JSON.parse(text);
    } catch {
      console.warn('[GS POST] Resposta não-JSON do Google Sheets:', text.substring(0, 200));
      return { success: true };
    }
  } catch (err) {
    console.warn(`[GS POST] Fetch padrão falhou para ${sheet}, tentando fallback no-cors:`, err);
    try {
      await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: body,
        mode: 'no-cors',
      });
      console.log(`[GS POST] Fallback no-cors disparado com sucesso para ${sheet}`);
      return { success: true };
    } catch (fallbackErr) {
      console.error(`[GS POST] Erro fatal ao postar em ${sheet}:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

// Exportar uso do Google Sheets
export { USE_GOOGLE_SHEETS };

// ==================== SECTORS ====================

export async function fetchSectors(): Promise<Sector[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'setores');
  return (result.data || []).map((s: any) => ({
    ...s,
    capacidadeTotal: Number(s.capacidadeTotal) || 0,
  }));
}

export async function saveSector(sector: Sector): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'setores', sector);
}

export async function saveAllSectors(sectors: Sector[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'setores', { data: sectors });
}

export async function deleteSector(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'setores', { id });
}

// ==================== BEDS ====================

export async function fetchBeds(): Promise<Bed[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'leitos');
  return (result.data || []).map((b: any) => ({
    ...b,
    numero: String(b.numero),
  }));
}

export async function saveBed(bed: Bed): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'leitos', bed);
}

export async function saveAllBeds(beds: Bed[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'leitos', { data: beds });
}

export async function deleteBed(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'leitos', { id });
}

// ==================== PATIENTS ====================

export async function fetchPatients(): Promise<Patient[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'pacientes');
  return (result.data || []).map((p: any) => ({
    ...p,
    dataNascimento: p.dataNascimento ? String(p.dataNascimento) : undefined,
    idade: Number(p.idade) || 0,
    pontuacao: Number(p.pontuacao) || 0,
    traqueostomia: p.traqueostomia === true || p.traqueostomia === 'true',
  }));
}

export async function savePatient(patient: Patient): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'pacientes', patient);
}

export async function saveAllPatients(patients: Patient[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'pacientes', { data: patients });
}

export async function deletePatient(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'pacientes', { id });
}

// ==================== NURSES ====================

export async function fetchNurses(): Promise<Nurse[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'enfermeiros');
  return (result.data || []).map((n: any) => ({
    ...n,
    senha: n.senha !== undefined && n.senha !== null ? String(n.senha) : '',
  }));
}

export async function saveNurse(nurse: Nurse): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'enfermeiros', nurse);
}

export async function saveAllNurses(nurses: Nurse[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'enfermeiros', { data: nurses });
}

export async function deleteNurse(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'enfermeiros', { id });
}

// ==================== TECHNICIANS ====================

export async function fetchTechnicians(): Promise<Technician[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'tecnicos');
  return (result.data || []).map((t: any) => ({
    ...t,
    presenteNoPlantao: t.presenteNoPlantao === true || t.presenteNoPlantao === 'true',
  }));
}

export async function saveTechnician(technician: Technician): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'tecnicos', technician);
}

export async function saveAllTechnicians(technicians: Technician[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'tecnicos', { data: technicians });
}

export async function deleteTechnician(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'tecnicos', { id });
}

// ==================== EMPLOYEES ====================

export async function fetchEmployees(): Promise<Employee[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'funcionarios');
  return (result.data || []).map((e: any) => ({
    ...e,
    senha: e.senha !== undefined && e.senha !== null ? String(e.senha) : '',
  }));
}

export async function saveEmployee(employee: Employee): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'funcionarios', employee);
}

export async function saveAllEmployees(employees: Employee[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'funcionarios', { data: employees });
}

export async function deleteEmployee(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'funcionarios', { id });
}

// ==================== SHIFTS ====================

export async function fetchShifts(): Promise<ShiftConfig[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'plantoes');
  return (result.data || []).map((s: any) => {
    let enfIds: string[] = [];
    if (Array.isArray(s.enfermeirosResponsaveisIds)) {
      enfIds = s.enfermeirosResponsaveisIds;
    } else if (typeof s.enfermeirosResponsaveisIds === 'string' && s.enfermeirosResponsaveisIds.trim()) {
      try {
        enfIds = JSON.parse(s.enfermeirosResponsaveisIds);
      } catch {
        enfIds = s.enfermeirosResponsaveisIds.split(',').map((id: string) => id.trim()).filter(Boolean);
      }
    }

    let leitosMap: Record<string, string[]> = {};
    if (s.enfermeiroLeitosMap && typeof s.enfermeiroLeitosMap === 'object' && !Array.isArray(s.enfermeiroLeitosMap)) {
      leitosMap = s.enfermeiroLeitosMap;
    } else if (typeof s.enfermeiroLeitosMap === 'string' && s.enfermeiroLeitosMap.trim()) {
      try {
        leitosMap = JSON.parse(s.enfermeiroLeitosMap);
      } catch {
        leitosMap = {};
      }
    }

    return {
      ...s,
      enfermeirosResponsaveisIds: enfIds,
      enfermeiroLeitosMap: leitosMap,
    };
  });
}

export async function saveShift(shift: ShiftConfig): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'plantoes', shift);
}

export async function saveAllShifts(shifts: ShiftConfig[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'plantoes', { data: shifts });
}

export async function deleteShift(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'plantoes', { id });
}

// ==================== VACANCIES ====================

export async function fetchVacancies(): Promise<VacancyRequest[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'vagas');
  return (result.data || []).map((v: any) => ({
    ...v,
    dataNascimento: v.dataNascimento ? String(v.dataNascimento) : undefined,
    idade: v.idade !== undefined && v.idade !== '' ? Number(v.idade) : undefined,
  }));
}

export async function saveVacancy(vacancy: VacancyRequest): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'vagas', vacancy);
}

export async function saveAllVacancies(vacancies: VacancyRequest[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'vagas', { data: vacancies });
}

export async function deleteVacancy(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'vagas', { id });
}

// ==================== SYSTEM USERS ====================

export async function fetchSystemUsers(): Promise<SystemUser[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'usuarios_sistema');
  return (result.data || []).map((u: any) => {
    let access = String(u.nivelAcesso || 'Visualização Restrita').trim();
    if (access.includes('Visualiza')) access = 'Visualização Restrita';
    else if (access.includes('Tcnico') || access.includes('Técnico')) access = 'Técnico(a) de Enfermagem';
    else if (access.includes('Mdico') || access.includes('Médico')) access = 'Médico(a)';
    else if (access.includes('Enfermeiro')) access = 'Enfermeiro(a)';
    else if (access.includes('Administrador Total')) access = 'Administrador Total';
    else if (access.includes('Administrador Setor')) access = 'Administrador Setor';

    return {
      id: String(u.id || `su-${Date.now()}`),
      nome: String(u.nome || 'Usuário Sem Nome'),
      login: String(u.login || u.email?.split('@')[0] || u.email || 'usuario'),
      email: u.email ? String(u.email) : '',
      senha: u.senha !== undefined && u.senha !== null ? String(u.senha) : '',
      nivelAcesso: access as any,
      cargo: u.cargo ? String(u.cargo) : '',
      ativo: u.ativo === true || u.ativo === 'true' || u.ativo === 'TRUE',
      criadoEm: u.criadoEm ? String(u.criadoEm) : new Date().toISOString(),
      ultimoAcesso: u.ultimoAcesso ? String(u.ultimoAcesso) : undefined,
      setorPermitidoIds: Array.isArray(u.setorPermitidoIds)
        ? u.setorPermitidoIds
        : typeof u.setorPermitidoIds === 'string' && u.setorPermitidoIds.trim()
          ? (() => { try { return JSON.parse(u.setorPermitidoIds); } catch { return u.setorPermitidoIds.split(',').map((s: string) => s.trim()).filter(Boolean); } })()
          : [],
    };
  });
}

export async function saveSystemUser(user: SystemUser): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('save', 'usuarios_sistema', user);
}

export async function saveAllSystemUsers(users: SystemUser[]): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await requestPost('saveAll', 'usuarios_sistema', { data: users });
}

export async function deleteSystemUser(id: string): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;
  await request('delete', 'usuarios_sistema', { id });
}

// ==================== SYNC ====================

// Sincronizar todos os dados do localStorage para Google Sheets
export async function syncToGoogleSheets(data: {
  sectors: Sector[];
  beds: Bed[];
  patients: Patient[];
  nurses: Nurse[];
  technicians: Technician[];
  employees: Employee[];
  shifts: ShiftConfig[];
  vacancies: VacancyRequest[];
  systemUsers?: SystemUser[];
}): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;

  const tasks: (() => Promise<void>)[] = [
    () => saveAllSectors(data.sectors),
    () => saveAllBeds(data.beds),
    () => saveAllPatients(data.patients),
    () => saveAllNurses(data.nurses),
    () => saveAllTechnicians(data.technicians),
    () => saveAllEmployees(data.employees),
    () => saveAllShifts(data.shifts),
    () => saveAllVacancies(data.vacancies),
  ];

  if (data.systemUsers) {
    tasks.push(() => saveAllSystemUsers(data.systemUsers!));
  }

  // Execução sequencial resiliente para evitar colisão de lock no Google Apps Script
  for (const task of tasks) {
    try {
      await task();
    } catch (itemErr) {
      console.warn('Aviso ao sincronizar item para Google Sheets:', itemErr);
    }
  }
}

// Carregar todos os dados do Google Sheets
export async function loadFromGoogleSheets(): Promise<{
  sectors: Sector[];
  beds: Bed[];
  patients: Patient[];
  nurses: Nurse[];
  technicians: Technician[];
  employees: Employee[];
  shifts: ShiftConfig[];
  vacancies: VacancyRequest[];
  systemUsers: SystemUser[];
} | null> {
  if (!USE_GOOGLE_SHEETS) return null;

  try {
    const [sectors, beds, patients, nurses, technicians, employees, shifts, vacancies, systemUsers] =
      await Promise.all([
        fetchSectors(),
        fetchBeds(),
        fetchPatients(),
        fetchNurses(),
        fetchTechnicians(),
        fetchEmployees(),
        fetchShifts(),
        fetchVacancies(),
        fetchSystemUsers(),
      ]);

    return { sectors, beds, patients, nurses, technicians, employees, shifts, vacancies, systemUsers };
  } catch (error) {
    console.error('Erro ao carregar dados do Google Sheets:', error);
    return null;
  }
}
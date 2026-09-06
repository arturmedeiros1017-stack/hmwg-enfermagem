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
  Technician,
  VacancyRequest,
} from '../types';

const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || '';
const USE_GOOGLE_SHEETS = !!API_URL;

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

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
}

// Exportar uso do Google Sheets
export { USE_GOOGLE_SHEETS };

// ==================== SECTORS ====================

export async function fetchSectors(): Promise<Sector[]> {
  if (!USE_GOOGLE_SHEETS) return [];
  const result = await request('getAll', 'setores');
  return result.data || [];
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
  return result.data || [];
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
  return result.data || [];
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
  return result.data || [];
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
  return result.data || [];
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
  return result.data || [];
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
  return result.data || [];
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
  return result.data || [];
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
}): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;

  await Promise.all([
    saveAllSectors(data.sectors),
    saveAllBeds(data.beds),
    saveAllPatients(data.patients),
    saveAllNurses(data.nurses),
    saveAllTechnicians(data.technicians),
    saveAllEmployees(data.employees),
    saveAllShifts(data.shifts),
    saveAllVacancies(data.vacancies),
  ]);
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
} | null> {
  if (!USE_GOOGLE_SHEETS) return null;

  try {
    const [sectors, beds, patients, nurses, technicians, employees, shifts, vacancies] =
      await Promise.all([
        fetchSectors(),
        fetchBeds(),
        fetchPatients(),
        fetchNurses(),
        fetchTechnicians(),
        fetchEmployees(),
        fetchShifts(),
        fetchVacancies(),
      ]);

    return { sectors, beds, patients, nurses, technicians, employees, shifts, vacancies };
  } catch (error) {
    console.error('Erro ao carregar dados do Google Sheets:', error);
    return null;
  }
}
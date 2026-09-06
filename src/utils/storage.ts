import {
  INITIAL_BEDS,
  INITIAL_EMPLOYEES,
  INITIAL_NURSES,
  INITIAL_PATIENTS,
  INITIAL_SECTORS,
  INITIAL_SHIFT_CONFIGS,
  INITIAL_TECHNICIANS,
  INITIAL_VACANCY_REQUESTS,
} from '../data/initialData';
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
import {
  USE_GOOGLE_SHEETS,
  fetchSectors,
  fetchBeds,
  fetchPatients,
  fetchNurses,
  fetchTechnicians,
  fetchEmployees,
  fetchShifts,
  fetchVacancies,
  saveSector,
  saveAllSectors,
  saveBed,
  saveAllBeds,
  savePatient,
  saveAllPatients,
  saveNurse,
  saveAllNurses,
  saveTechnician,
  saveAllTechnicians,
  saveEmployee,
  saveAllEmployees,
  saveShift,
  saveAllShifts,
  saveVacancy,
  saveAllVacancies,
  deleteSector as gsDeleteSector,
  deleteBed as gsDeleteBed,
  deletePatient as gsDeletePatient,
} from './googleSheets';

const STORAGE_KEYS = {
  SECTORS: 'hmwg_nursing_sectors_v1',
  BEDS: 'hmwg_nursing_beds_v1',
  PATIENTS: 'hmwg_nursing_patients_v1',
  NURSES: 'hmwg_nursing_nurses_v1',
  TECHNICIANS: 'hmwg_nursing_technicians_v1',
  EMPLOYEES: 'hmwg_nursing_employees_v1',
  SHIFTS: 'hmwg_nursing_shifts_v1',
  VACANCIES: 'hmwg_nursing_vacancies_v1',
  CURRENT_USER: 'hmwg_nursing_current_user_v1',
  SELECTED_SECTOR: 'hmwg_nursing_selected_sector_v1',
  SYNC_STATUS: 'hmwg_nursing_sync_status_v1',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Função auxiliar para salvar dados localmente
function saveLocally<T>(key: string, data: T): void {
  setItem(key, data);
}

// Verificar se há dados no Google Sheets
async function checkGoogleSheetsData(): Promise<boolean> {
  if (!USE_GOOGLE_SHEETS) return false;
  try {
    const sectors = await fetchSectors();
    return sectors.length > 0;
  } catch {
    return false;
  }
}

export interface CloudData {
  sectors: Sector[];
  beds: Bed[];
  patients: Patient[];
  nurses: Nurse[];
  technicians: Technician[];
  employees: Employee[];
  shifts: ShiftConfig[];
  vacancies: VacancyRequest[];
}

// Carregar dados do Google Sheets e salvar localmente
async function syncFromGoogleSheets(): Promise<CloudData | null> {
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

    if (sectors && sectors.length > 0) {
      saveLocally(STORAGE_KEYS.SECTORS, sectors);
      saveLocally(STORAGE_KEYS.BEDS, beds);
      saveLocally(STORAGE_KEYS.PATIENTS, patients);
      saveLocally(STORAGE_KEYS.NURSES, nurses);
      saveLocally(STORAGE_KEYS.TECHNICIANS, technicians);
      saveLocally(STORAGE_KEYS.EMPLOYEES, employees);
      saveLocally(STORAGE_KEYS.SHIFTS, shifts);
      saveLocally(STORAGE_KEYS.VACANCIES, vacancies);
      saveLocally(STORAGE_KEYS.SYNC_STATUS, { lastSync: new Date().toISOString() });
      return { sectors, beds, patients, nurses, technicians, employees, shifts, vacancies };
    }
    return null;
  } catch (error) {
    console.error('Erro ao sincronizar do Google Sheets:', error);
    return null;
  }
}

// Sincronizar dados locais para Google Sheets
async function syncToGoogleSheets(data: {
  sectors?: Sector[];
  beds?: Bed[];
  patients?: Patient[];
  nurses?: Nurse[];
  technicians?: Technician[];
  employees?: Employee[];
  shifts?: ShiftConfig[];
  vacancies?: VacancyRequest[];
}): Promise<void> {
  if (!USE_GOOGLE_SHEETS) return;

  try {
    const tasks: (() => Promise<void>)[] = [];
    if (data.sectors && data.sectors.length > 0) tasks.push(() => saveAllSectors(data.sectors!));
    if (data.beds && data.beds.length > 0) tasks.push(() => saveAllBeds(data.beds!));
    if (data.patients) tasks.push(() => saveAllPatients(data.patients!));
    if (data.nurses && data.nurses.length > 0) tasks.push(() => saveAllNurses(data.nurses!));
    if (data.technicians && data.technicians.length > 0) tasks.push(() => saveAllTechnicians(data.technicians!));
    if (data.employees && data.employees.length > 0) tasks.push(() => saveAllEmployees(data.employees!));
    if (data.shifts && data.shifts.length > 0) tasks.push(() => saveAllShifts(data.shifts!));
    if (data.vacancies) tasks.push(() => saveAllVacancies(data.vacancies!));

    // Execução sequencial resiliente para evitar colisão de lock no Google Apps Script
    for (const task of tasks) {
      try {
        await task();
      } catch (itemErr) {
        console.warn('Aviso ao sincronizar item para Google Sheets:', itemErr);
      }
    }

    saveLocally(STORAGE_KEYS.SYNC_STATUS, { lastSync: new Date().toISOString() });
  } catch (error) {
    console.error('Erro ao sincronizar para Google Sheets:', error);
    throw error;
  }
}

export const Storage = {
  // Verificar se está usando Google Sheets
  isUsingGoogleSheets: () => USE_GOOGLE_SHEETS,

  // Forçar sincronização do Google Sheets
  syncFromGoogleSheets,

  // Sincronizar para Google Sheets
  syncToGoogleSheets,

  // Operações diretas de nuvem para funcionários (rápido e atômico)
  saveEmployeeCloud: async (emp: Employee) => {
    if (USE_GOOGLE_SHEETS) await saveEmployee(emp);
  },
  deleteEmployeeCloud: async (id: string) => {
    if (USE_GOOGLE_SHEETS) await deleteEmployee(id);
  },
  saveNurseCloud: async (nurse: Nurse) => {
    if (USE_GOOGLE_SHEETS) await saveNurse(nurse);
  },
  saveTechnicianCloud: async (tech: Technician) => {
    if (USE_GOOGLE_SHEETS) await saveTechnician(tech);
  },

  // Verificar status da sincronização
  getSyncStatus: () => getItem<{ lastSync?: string }>(STORAGE_KEYS.SYNC_STATUS, {}),

  getSectors: (): Sector[] => getItem<Sector[]>(STORAGE_KEYS.SECTORS, INITIAL_SECTORS),
  saveSectors: (sectors: Sector[]) => saveLocally(STORAGE_KEYS.SECTORS, sectors),

  getBeds: (): Bed[] => getItem<Bed[]>(STORAGE_KEYS.BEDS, INITIAL_BEDS),
  saveBeds: (beds: Bed[]) => saveLocally(STORAGE_KEYS.BEDS, beds),

  getPatients: (): Patient[] => getItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS),
  savePatients: (patients: Patient[]) => saveLocally(STORAGE_KEYS.PATIENTS, patients),

  getNurses: (): Nurse[] => getItem<Nurse[]>(STORAGE_KEYS.NURSES, INITIAL_NURSES),
  saveNurses: (nurses: Nurse[]) => saveLocally(STORAGE_KEYS.NURSES, nurses),

  getTechnicians: (): Technician[] => getItem<Technician[]>(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS),
  saveTechnicians: (technicians: Technician[]) => saveLocally(STORAGE_KEYS.TECHNICIANS, technicians),

  getEmployees: (): Employee[] => getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES),
  saveEmployees: (employees: Employee[]) => saveLocally(STORAGE_KEYS.EMPLOYEES, employees),

  getShifts: (): ShiftConfig[] => getItem<ShiftConfig[]>(STORAGE_KEYS.SHIFTS, INITIAL_SHIFT_CONFIGS),
  saveShifts: (shifts: ShiftConfig[]) => saveLocally(STORAGE_KEYS.SHIFTS, shifts),

  getVacancies: (): VacancyRequest[] => getItem<VacancyRequest[]>(STORAGE_KEYS.VACANCIES, INITIAL_VACANCY_REQUESTS),
  saveVacancies: (vacancies: VacancyRequest[]) => saveLocally(STORAGE_KEYS.VACANCIES, vacancies),

  getCurrentUser: (): Nurse | null => getItem<Nurse | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_NURSES[0]),
  saveCurrentUser: (nurse: Nurse | null) => setItem(STORAGE_KEYS.CURRENT_USER, nurse),

  getSelectedSectorId: (): string => getItem<string>(STORAGE_KEYS.SELECTED_SECTOR, 'sec-uti'),
  saveSelectedSectorId: (id: string) => setItem(STORAGE_KEYS.SELECTED_SECTOR, id),

  // Deletar setor (local + Google Sheets)
  deleteSector: async (sectorId: string) => {
    const sectors = getItem<Sector[]>(STORAGE_KEYS.SECTORS, []);
    const beds = getItem<Bed[]>(STORAGE_KEYS.BEDS, []);
    saveLocally(STORAGE_KEYS.SECTORS, sectors.filter((s) => s.id !== sectorId));
    saveLocally(STORAGE_KEYS.BEDS, beds.filter((b) => b.setorId !== sectorId));
    if (USE_GOOGLE_SHEETS) {
      await gsDeleteSector(sectorId).catch(console.error);
    }
  },

  // Deletar leito (local + Google Sheets)
  deleteBed: async (bedId: string) => {
    const beds = getItem<Bed[]>(STORAGE_KEYS.BEDS, []);
    const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
    saveLocally(STORAGE_KEYS.BEDS, beds.filter((b) => b.id !== bedId));
    saveLocally(STORAGE_KEYS.PATIENTS, patients.filter((p) => p.leitoId !== bedId));
    if (USE_GOOGLE_SHEETS) {
      await gsDeleteBed(bedId).catch(console.error);
    }
  },

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.SECTORS);
    localStorage.removeItem(STORAGE_KEYS.BEDS);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.NURSES);
    localStorage.removeItem(STORAGE_KEYS.TECHNICIANS);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.VACANCIES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_SECTOR);
    localStorage.removeItem(STORAGE_KEYS.SYNC_STATUS);
    window.location.reload();
  },
};

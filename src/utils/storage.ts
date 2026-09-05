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

export const Storage = {
  getSectors: (): Sector[] => getItem<Sector[]>(STORAGE_KEYS.SECTORS, INITIAL_SECTORS),
  saveSectors: (sectors: Sector[]) => setItem(STORAGE_KEYS.SECTORS, sectors),

  getBeds: (): Bed[] => getItem<Bed[]>(STORAGE_KEYS.BEDS, INITIAL_BEDS),
  saveBeds: (beds: Bed[]) => setItem(STORAGE_KEYS.BEDS, beds),

  getPatients: (): Patient[] => getItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS),
  savePatients: (patients: Patient[]) => setItem(STORAGE_KEYS.PATIENTS, patients),

  getNurses: (): Nurse[] => getItem<Nurse[]>(STORAGE_KEYS.NURSES, INITIAL_NURSES),
  saveNurses: (nurses: Nurse[]) => setItem(STORAGE_KEYS.NURSES, nurses),

  getTechnicians: (): Technician[] => getItem<Technician[]>(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS),
  saveTechnicians: (technicians: Technician[]) => setItem(STORAGE_KEYS.TECHNICIANS, technicians),

  getEmployees: (): Employee[] => getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES),
  saveEmployees: (employees: Employee[]) => setItem(STORAGE_KEYS.EMPLOYEES, employees),

  getShifts: (): ShiftConfig[] => getItem<ShiftConfig[]>(STORAGE_KEYS.SHIFTS, INITIAL_SHIFT_CONFIGS),
  saveShifts: (shifts: ShiftConfig[]) => setItem(STORAGE_KEYS.SHIFTS, shifts),

  getVacancies: (): VacancyRequest[] => getItem<VacancyRequest[]>(STORAGE_KEYS.VACANCIES, INITIAL_VACANCY_REQUESTS),
  saveVacancies: (vacancies: VacancyRequest[]) => setItem(STORAGE_KEYS.VACANCIES, vacancies),

  getCurrentUser: (): Nurse | null => getItem<Nurse | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_NURSES[0]),
  saveCurrentUser: (nurse: Nurse | null) => setItem(STORAGE_KEYS.CURRENT_USER, nurse),

  getSelectedSectorId: (): string => getItem<string>(STORAGE_KEYS.SELECTED_SECTOR, 'sec-uti'),
  saveSelectedSectorId: (id: string) => setItem(STORAGE_KEYS.SELECTED_SECTOR, id),

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
    window.location.reload();
  },
};

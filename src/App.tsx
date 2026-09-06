/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bed,
  BedStatus,
  Employee,
  Nurse,
  Patient,
  Sector,
  ShiftConfig,
  Technician,
  VacancyRequest,
} from './types';
import { Storage } from './utils/storage';
import { calculateAge } from './utils/dateUtils';
import { Header } from './components/Header';
import { BedMap } from './components/BedMap';
import { CareAssignment } from './components/CareAssignment';
import { PrintableA4Report } from './components/PrintableA4Report';
import { VacancyRequests } from './components/VacancyRequests';
import { ShiftManagement } from './components/ShiftManagement';
import { EmployeeManagement } from './components/EmployeeManagement';
import { SectorManagement } from './components/SectorManagement';
import { PatientFormModal } from './components/PatientFormModal';
import { LoginModal } from './components/LoginModal';
import { HMWGLogo } from './components/HMWGLogo';
import {
  RotateCcw,
  CheckCircle2,
  HeartHandshake,
  FileSpreadsheet,
  Building,
  Building2,
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [sectors, setSectors] = useState<Sector[]>(() => Storage.getSectors());
  const [beds, setBeds] = useState<Bed[]>(() => Storage.getBeds());
  const [patients, setPatients] = useState<Patient[]>(() => Storage.getPatients());
  const [nurses, setNurses] = useState<Nurse[]>(() => Storage.getNurses());
  const [technicians, setTechnicians] = useState<Technician[]>(() => Storage.getTechnicians());
  const [employees, setEmployees] = useState<Employee[]>(() => Storage.getEmployees());
  const [shifts, setShifts] = useState<ShiftConfig[]>(() => Storage.getShifts());
  const [vacancies, setVacancies] = useState<VacancyRequest[]>(() => Storage.getVacancies());
  const [currentUser, setCurrentUser] = useState<Nurse | null>(() => Storage.getCurrentUser());
  const [selectedSectorId, setSelectedSectorId] = useState<string>(() => Storage.getSelectedSectorId());

  // UI Navigation State com persistência no LocalStorage
  const [activeTab, setActiveTab] = useState<'mapa' | 'atribuicao' | 'vagas' | 'plantao' | 'funcionarios' | 'setores' | 'impressao'>(() => {
    try {
      const saved = localStorage.getItem('hmwg_active_tab');
      const validTabs = ['mapa', 'atribuicao', 'vagas', 'plantao', 'funcionarios', 'setores', 'impressao'];
      if (saved && validTabs.includes(saved)) {
        return saved as any;
      }
    } catch {
      // Ignora erro no localStorage
    }
    return 'mapa';
  });

  // Salva aba ativa sempre que ela mudar
  useEffect(() => {
    try {
      localStorage.setItem('hmwg_active_tab', activeTab);
    } catch (e) {
      console.warn('Erro ao persistir aba ativa:', e);
    }
  }, [activeTab]);

  // Modals States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [selectedBedForPatient, setSelectedBedForPatient] = useState<Bed | null>(null);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<Patient | null>(null);
  const [vacancyPreSelectedBed, setVacancyPreSelectedBed] = useState<Bed | null>(null);

  // Sync with Storage on change
  useEffect(() => { Storage.saveSectors(sectors); }, [sectors]);
  useEffect(() => { Storage.saveBeds(beds); }, [beds]);
  useEffect(() => { Storage.savePatients(patients); }, [patients]);
  useEffect(() => { Storage.saveNurses(nurses); }, [nurses]);
  useEffect(() => { Storage.saveTechnicians(technicians); }, [technicians]);
  useEffect(() => { Storage.saveEmployees(employees); }, [employees]);
  useEffect(() => { Storage.saveShifts(shifts); }, [shifts]);
  useEffect(() => { Storage.saveVacancies(vacancies); }, [vacancies]);
  useEffect(() => { Storage.saveCurrentUser(currentUser); }, [currentUser]);
  useEffect(() => { Storage.saveSelectedSectorId(selectedSectorId); }, [selectedSectorId]);

  // Cloud Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const status = Storage.getSyncStatus();
    return status.lastSync ? new Date(status.lastSync) : null;
  });
  const isInitialSyncDone = useRef(false);
  const isPushing = useRef(false);
  const lastLocalMutationTime = useRef<number>(0);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setSyncToast({ show: true, message, type });
    setTimeout(() => {
      setSyncToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Pull latest data from Google Sheets
  const pullFromCloud = useCallback(async (isSilent = false) => {
    if (!Storage.isUsingGoogleSheets() || isPushing.current) return;

    // Se o usuário estiver com qualquer modal aberto, NÃO roda atualização em segundo plano para não atrapalhar
    if (isSilent && typeof document !== 'undefined' && document.querySelector('.fixed.inset-0')) {
      return;
    }

    // Se houve alteração local recente (últimos 60 segundos) e for um pull em segundo plano,
    // não sobrescrever para evitar desfazer edições do usuário
    if (Date.now() - lastLocalMutationTime.current < 60000 && isSilent) {
      return;
    }

    if (!isSilent) setIsSyncing(true);

    try {
      const data = await Storage.syncFromGoogleSheets();
      if (data) {
        if (data.sectors && data.sectors.length > 0) setSectors(data.sectors);
        if (data.beds) setBeds(data.beds);
        if (data.patients) setPatients(data.patients);
        if (data.nurses && data.nurses.length > 0) {
          if (Date.now() - lastLocalMutationTime.current >= 60000 || !isSilent) {
            setNurses(data.nurses);
          }
        }
        if (data.technicians && data.technicians.length > 0) {
          if (Date.now() - lastLocalMutationTime.current >= 60000 || !isSilent) {
            setTechnicians(data.technicians);
          }
        }
        if (data.employees && data.employees.length > 0) {
          // Protege colaboradores recém-salvos contra sobrescrita pela nuvem
          if (Date.now() - lastLocalMutationTime.current >= 60000 || !isSilent) {
            setEmployees(data.employees);
          }
        }
        if (data.shifts && data.shifts.length > 0) setShifts(data.shifts);
        if (data.vacancies) setVacancies(data.vacancies);
        setLastSyncTime(new Date());
        if (!isSilent) showToast('Sistema atualizado com a nuvem!');
      }
    } catch (err) {
      console.error('Erro ao sincronizar do Google Sheets:', err);
      if (!isSilent) showToast('Falha na sincronização com a nuvem', 'error');
    } finally {
      isInitialSyncDone.current = true;
      if (!isSilent) setIsSyncing(false);
    }
  }, [showToast]);

  // Push local data to Google Sheets
  const pushToCloud = useCallback(async () => {
    if (!Storage.isUsingGoogleSheets() || !isInitialSyncDone.current || isPushing.current) return;
    isPushing.current = true;
    setIsSyncing(true);
    try {
      await Storage.syncToGoogleSheets({
        sectors,
        beds,
        patients,
        nurses,
        technicians,
        employees,
        shifts,
        vacancies,
      });
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Erro ao salvar no Google Sheets:', err);
    } finally {
      isPushing.current = false;
      setIsSyncing(false);
    }
  }, [sectors, beds, patients, nurses, technicians, employees, shifts, vacancies]);

  // Initial mount sync & visibility / interval auto-pull
  useEffect(() => {
    pullFromCloud(false);

    // Pull when tab becomes visible (user returns to mobile browser)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pullFromCloud(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic pull every 20 seconds so mobile stays updated with PC
    const interval = setInterval(() => {
      pullFromCloud(true);
    }, 20000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [pullFromCloud]);

  // Debounced auto-push when data changes AFTER initial sync has completed
  useEffect(() => {
    if (!isInitialSyncDone.current || !Storage.isUsingGoogleSheets()) return;

    const timer = setTimeout(() => {
      pushToCloud();
    }, 2000);

    return () => clearTimeout(timer);
  }, [sectors, beds, patients, nurses, technicians, employees, shifts, vacancies, pushToCloud]);

  // Current Active Sector & Shift
  const currentSector = sectors.find((s) => s.id === selectedSectorId) || sectors[0];
  const currentShift =
    shifts.find((sh) => sh.setorId === currentSector.id) ||
    shifts[0] || {
      id: `shift-${currentSector.id}`,
      data: new Date().toISOString().split('T')[0],
      turno: 'Diurno (07h às 19h)',
      setorId: currentSector.id,
      enfermeirosResponsaveisIds: nurses.slice(0, 2).map((n) => n.id),
      enfermeiroLeitosMap: {},
    };

  // Handlers for Patients
  const handleOpenPatientModal = (bed: Bed, patient?: Patient) => {
    setSelectedBedForPatient(bed);
    setSelectedPatientForEdit(patient || null);
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = (savedPatient: Patient) => {
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === savedPatient.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPatient.id ? savedPatient : p));
      }
      return [...prev, savedPatient];
    });

    // Ensure bed is marked as OCUPADO
    setBeds((prev) =>
      prev.map((b) => (b.id === savedPatient.leitoId ? { ...b, status: 'OCUPADO' } : b))
    );
  };

  const handleDischargePatient = (patientId: string, bedId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status: 'DESOCUPADO' } : b))
    );
  };

  // Handlers for Beds
  const handleUpdateBedStatus = (bedId: string, status: BedStatus, motivo?: string) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === bedId) {
          return {
            ...b,
            status,
            motivoBloqueio: status === 'BLOQUEADO' ? motivo : undefined,
          };
        }
        return b;
      })
    );

    // If bed is no longer occupied, ask to remove or keep patient record
    if (status !== 'OCUPADO') {
      const pat = patients.find((p) => p.leitoId === bedId);
      if (pat && status === 'DESOCUPADO') {
        setPatients((prev) => prev.filter((p) => p.leitoId !== bedId));
      }
    }
  };

  const handleAddNewBed = (numero: string, setorId: string) => {
    const newBed: Bed = {
      id: `bed-${Date.now()}`,
      numero,
      setorId,
      status: 'DESOCUPADO',
    };
    setBeds((prev) => [...prev, newBed]);
  };

  // Handlers for Vacancy Requests
  const handleRequestVacancyForBed = (bed: Bed) => {
    setVacancyPreSelectedBed(bed);
    setActiveTab('vagas');
  };

  const handleAddVacancyRequest = (req: VacancyRequest) => {
    setVacancies((prev) => [req, ...prev]);
    // If request has a targeted bed, set active indicator on that bed
    if (req.leitoDesejadoId) {
      setBeds((prev) =>
        prev.map((b) => (b.id === req.leitoDesejadoId ? { ...b, solicitacaoVagaAtiva: true } : b))
      );
    }
  };

  const handleUpdateVacancyStatus = (
    id: string,
    status: 'PENDENTE' | 'APROVADA' | 'AGUARDANDO_DESOCUPACAO' | 'CANCELADA' | 'CONCLUIDA'
  ) => {
    setVacancies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  // Handlers for Shift Config
  const handleUpdateShiftConfig = (updated: ShiftConfig) => {
    setShifts((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
  };

  // Handlers for Technicians
  const handleToggleTechnicianPresence = (techId: string) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === techId ? { ...t, presenteNoPlantao: !t.presenteNoPlantao } : t))
    );
  };

  const handleAddNewTechnician = (nome: string, coren: string) => {
    const techId = `tec-${Date.now()}`;
    const formattedNome = nome.startsWith('Téc.') ? nome : `Téc. ${nome}`;
    const newTech: Technician = {
      id: techId,
      nome: formattedNome,
      coren,
      turno: 'Diurno (07h-19h)',
      presenteNoPlantao: true,
      setorId: currentSector.id,
    };
    setTechnicians((prev) => [...prev, newTech]);

    // Sincroniza com employees
    const newEmp: Employee = {
      id: techId,
      matricula: `SESAP-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
      nome: formattedNome,
      cpf: '',
      categoria: 'Técnico(a) de Enfermagem',
      cargo: 'Técnico de Enfermagem',
      conselhoTipo: 'COREN',
      conselhoNumero: coren,
      email: `${formattedNome.toLowerCase().replace(/[^a-z0-9]/g, '.')}@hmwg.rn.gov.br`,
      telefone: '',
      setorPadraoId: currentSector.id,
      regimeContratual: 'Efetivo SESAP/RN',
      turnoPadrao: 'Diurno (07h-19h)',
      status: 'ATIVO',
      dataAdmissao: new Date().toISOString().split('T')[0],
    };
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const handleAddNewNurse = (newNurse: Nurse) => {
    setNurses((prev) => [...prev, newNurse]);

    // Sincroniza com employees
    setEmployees((prev) => {
      if (prev.some((e) => e.id === newNurse.id)) return prev;
      const newEmp: Employee = {
        id: newNurse.id,
        matricula: `SESAP-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
        nome: newNurse.nome,
        cpf: '',
        categoria: 'Enfermeiro(a)',
        cargo: newNurse.cargo,
        conselhoTipo: 'COREN',
        conselhoNumero: newNurse.coren,
        email: newNurse.email,
        telefone: newNurse.telefone,
        setorPadraoId: currentSector.id,
        regimeContratual: 'Efetivo SESAP/RN',
        turnoPadrao:
          newNurse.turno === 'Noturno (19h-07h)'
            ? 'Noturno (19h-07h)'
            : newNurse.turno === 'Diurno (07h-19h)'
            ? 'Diurno (07h-19h)'
            : 'Ambos / Plantonista',
        status: 'ATIVO',
        dataAdmissao: new Date().toISOString().split('T')[0],
        senha: newNurse.senha || 'enfermagem123',
      };
      return [newEmp, ...prev];
    });
  };

  // Handlers for Sectors
  const handleSaveSector = (sector: Sector) => {
    setSectors((prev) => {
      const idx = prev.findIndex((s) => s.id === sector.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = sector;
        return copy;
      }
      return [...prev, sector];
    });
  };

  const handleDeleteSector = (sectorId: string) => {
    setBeds((prev) => prev.filter((b) => b.setorId !== sectorId));
    setSectors((prev) => prev.filter((s) => s.id !== sectorId));
    if (selectedSectorId === sectorId) {
      setSelectedSectorId(sectors.find((s) => s.id !== sectorId)?.id || '');
    }
  };

  // Handlers for Beds (CRUD from SectorManagement)
  const handleSaveBedFromSectorMgmt = (bed: Bed) => {
    setBeds((prev) => {
      const idx = prev.findIndex((b) => b.id === bed.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = bed;
        return copy;
      }
      return [...prev, bed];
    });
  };

  const handleDeleteBed = (bedId: string) => {
    setBeds((prev) => prev.filter((b) => b.id !== bedId));
    setPatients((prev) => prev.filter((p) => p.leitoId !== bedId));
  };

  // Handler for CSV Import
  const handleImportCsv = (type: 'setores' | 'leitos' | 'pacientes', data: any[]) => {
    if (type === 'setores') {
      setSectors((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newSectors = data
          .filter((d) => !existingIds.has(d.id))
          .map((d) => ({
            id: d.id,
            nome: d.nome,
            sigla: d.sigla,
            descricao: d.descricao,
            cor: d.cor,
            capacidadeTotal: parseInt(d.capacitatetotal || '10', 10) || 10,
          }));
        return [...prev, ...newSectors];
      });
    } else if (type === 'leitos') {
      setBeds((prev) => {
        const existingIds = new Set(prev.map((b) => b.id));
        const newBeds = data
          .filter((d) => !existingIds.has(d.id))
          .map((d) => ({
            id: d.id,
            numero: d.numero,
            setorId: d.setorid,
            status: (['OCUPADO', 'DESOCUPADO', 'BLOQUEADO', 'HIGIENIZACAO'].includes(d.status?.toUpperCase())
              ? d.status.toUpperCase()
              : 'DESOCUPADO') as Bed['status'],
            motivoBloqueio: d.motivobloqueio || undefined,
          }));
        return [...prev, ...newBeds];
      });
    } else if (type === 'pacientes') {
      setPatients((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPatients = data
          .filter((d) => !existingIds.has(d.id))
          .map((d) => ({
            id: d.id,
            leitoId: d.leitoid,
            setorId: d.setorid,
            nome: d.nome,
            prontuario: d.prontuario,
            dataNascimento: d.datanascimento || undefined,
            idade: d.datanascimento ? calculateAge(d.datanascimento) : (parseInt(d.idade || '0', 10) || 0),
            dataInternacao: d.datanacao || d.datainternacao || new Date().toISOString().split('T')[0],
            classificacao: d.classificacao || 'Cuidados Mínimos',
            traqueostomia: d.traqueostomia === 'true',
            tipoIsolamento: d.tipoisolamento || 'Padrão',
            alergia: d.alergia || 'Nenhuma conhecida',
            estadoMental: d.estadomental || 'Lúcido e Orientado',
            oxigenacao: d.oxigenacao || 'Ar Ambiente',
            sinaisVitais: d.sinaisvitais || '4 em 4 horas',
            mobilidade: d.mobilidade || 'Ativa no leito',
            deambulacao: d.deambulacao || 'Deambula sem auxílio',
            alimentacao: d.alimentacao || 'Oral livre',
            curativo: d.curativo || 'sem curativo',
            comprometimentoTecidual: d.comprometimentotecidual || 'Pele íntegra',
            pontuacao: parseInt(d.pontuacao || '0', 10) || 0,
            diagnostico: d.diagnostico || undefined,
            observacoes: d.observacoes || undefined,
          }));
        return [...prev, ...newPatients];
      });
    }
  };

  // Handlers for Employees (Quadro Geral de Funcionários)
  const handleSaveEmployee = async (savedEmp: Employee) => {
    // 1. Marca imediatamente imunidade contra pulls de background
    lastLocalMutationTime.current = Date.now();
    isPushing.current = true;

    // 2. Atualização SÍNCRONA E IMEDIATA no Storage e no React State
    const currentEmployees = Storage.getEmployees();
    const idx = currentEmployees.findIndex((e) => e.id === savedEmp.id);
    const updatedEmployees = idx >= 0
      ? currentEmployees.map((e) => (e.id === savedEmp.id ? savedEmp : e))
      : [savedEmp, ...currentEmployees];

    Storage.saveEmployees(updatedEmployees);
    setEmployees(updatedEmployees);

    let nurseDataToSync: Nurse | null = null;
    let techDataToSync: Technician | null = null;

    // Sincronização com Enfermeiros (Nurse)
    if (savedEmp.categoria === 'Enfermeiro(a)') {
      nurseDataToSync = {
        id: savedEmp.id,
        nome: savedEmp.nome,
        coren: savedEmp.conselhoNumero || 'COREN-RN',
        cargo: (savedEmp.cargo as any) || 'Enfermeiro Assistencial',
        email: savedEmp.email,
        senha: savedEmp.senha || 'enfermagem123',
        turno: savedEmp.turnoPadrao.includes('Noturno')
          ? 'Noturno (19h-07h)'
          : savedEmp.turnoPadrao.includes('Diurno')
          ? 'Diurno (07h-19h)'
          : 'Ambos',
        telefone: savedEmp.telefone,
      };
      const currentNurses = Storage.getNurses();
      const nIdx = currentNurses.findIndex((n) => n.id === savedEmp.id);
      const updatedNurses = nIdx >= 0
        ? currentNurses.map((n) => (n.id === savedEmp.id ? nurseDataToSync! : n))
        : [...currentNurses, nurseDataToSync!];
      Storage.saveNurses(updatedNurses);
      setNurses(updatedNurses);
    }

    // Sincronização com Técnicos (Technician)
    if (savedEmp.categoria === 'Técnico(a) de Enfermagem') {
      techDataToSync = {
        id: savedEmp.id,
        nome: savedEmp.nome,
        coren: savedEmp.conselhoNumero || 'COREN-RN',
        turno: savedEmp.turnoPadrao.includes('Noturno')
          ? 'Noturno (19h-07h)'
          : 'Diurno (07h-19h)',
        presenteNoPlantao: savedEmp.status === 'ATIVO',
        setorId: savedEmp.setorPadraoId,
        observacao: savedEmp.observacoes,
      };
      const currentTechs = Storage.getTechnicians();
      const tIdx = currentTechs.findIndex((t) => t.id === savedEmp.id);
      const updatedTechs = tIdx >= 0
        ? currentTechs.map((t) => (t.id === savedEmp.id ? techDataToSync! : t))
        : [...currentTechs, techDataToSync!];
      Storage.saveTechnicians(updatedTechs);
      setTechnicians(updatedTechs);
    }

    showToast(`Cadastro de ${savedEmp.nome} salvo com sucesso!`, 'success');

    // 3. Salvar diretamente no Google Sheets de forma atômica em segundo plano
    try {
      if (Storage.isUsingGoogleSheets()) {
        await Storage.saveEmployeeCloud(savedEmp);
        if (nurseDataToSync) await Storage.saveNurseCloud(nurseDataToSync);
        if (techDataToSync) await Storage.saveTechnicianCloud(techDataToSync);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Sincronização em nuvem do funcionário continuará em background:', err);
    } finally {
      isPushing.current = false;
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    lastLocalMutationTime.current = Date.now();
    isPushing.current = true;

    const currentEmployees = Storage.getEmployees();
    const updated = currentEmployees.filter((e) => e.id !== employeeId);
    Storage.saveEmployees(updated);
    setEmployees(updated);

    const currentNurses = Storage.getNurses();
    const updatedNurses = currentNurses.filter((n) => n.id !== employeeId);
    Storage.saveNurses(updatedNurses);
    setNurses(updatedNurses);

    const currentTechs = Storage.getTechnicians();
    const updatedTechs = currentTechs.filter((t) => t.id !== employeeId);
    Storage.saveTechnicians(updatedTechs);
    setTechnicians(updatedTechs);

    showToast('Funcionário removido com sucesso!', 'success');

    try {
      if (Storage.isUsingGoogleSheets()) {
        await Storage.deleteEmployeeCloud(employeeId);
      }
    } catch (err) {
      console.error('Erro ao excluir funcionário na nuvem:', err);
    } finally {
      isPushing.current = false;
    }
  };

  const handleToggleEmployeeStatus = async (employeeId: string) => {
    lastLocalMutationTime.current = Date.now();
    let updatedEmp: Employee | null = null;

    const currentEmployees = Storage.getEmployees();
    const updated = currentEmployees.map((e) => {
      if (e.id === employeeId) {
        const newStatus = e.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
        updatedEmp = { ...e, status: newStatus };
        return updatedEmp;
      }
      return e;
    });
    Storage.saveEmployees(updated);
    setEmployees(updated);

    // Se for técnico, atualiza a presença no plantão
    const currentTechs = Storage.getTechnicians();
    const updatedTechs = currentTechs.map((t) =>
      t.id === employeeId ? { ...t, presenteNoPlantao: !t.presenteNoPlantao } : t
    );
    Storage.saveTechnicians(updatedTechs);
    setTechnicians(updatedTechs);

    if (updatedEmp) {
      try {
        if (Storage.isUsingGoogleSheets()) {
          await Storage.saveEmployeeCloud(updatedEmp);
        }
      } catch (err) {
        console.error('Erro ao atualizar status do funcionário na nuvem:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-sky-600 selection:text-white overflow-x-hidden">
      {/* Primary Header with HMWG Logo & Hospital Navigation */}
      <Header
        sectors={sectors}
        selectedSectorId={selectedSectorId}
        onSelectSector={(id) => {
          setSelectedSectorId(id);
          // Permanece na mesma aba que o usuário estiver usando (não força reset para 'mapa')
        }}
        currentUser={currentUser}
        currentShift={currentShift}
        nurses={nurses}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onManualSync={() => pullFromCloud(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 overflow-x-auto">
        {activeTab === 'mapa' && (
          <BedMap
            currentSector={currentSector}
            beds={beds}
            patients={patients}
            vacancies={vacancies}
            onSelectBed={(bed) => handleOpenPatientModal(bed, patients.find((p) => p.leitoId === bed.id))}
            onOpenPatientModal={handleOpenPatientModal}
            onRequestVacancyForBed={handleRequestVacancyForBed}
            onUpdateBedStatus={handleUpdateBedStatus}
            onAddNewBed={handleAddNewBed}
          />
        )}

        {activeTab === 'atribuicao' && (
          <CareAssignment
            currentSector={currentSector}
            beds={beds}
            patients={patients}
            nurses={nurses}
            technicians={technicians}
            currentShift={currentShift}
            onToggleTechnicianPresence={handleToggleTechnicianPresence}
            onOpenPrintReport={() => setActiveTab('impressao')}
            onAddNewTechnician={handleAddNewTechnician}
          />
        )}

        {activeTab === 'vagas' && (
          <VacancyRequests
            vacancies={vacancies}
            sectors={sectors}
            beds={beds}
            onAddVacancyRequest={handleAddVacancyRequest}
            onUpdateVacancyStatus={handleUpdateVacancyStatus}
            preSelectedBed={vacancyPreSelectedBed}
            onClearPreSelectedBed={() => setVacancyPreSelectedBed(null)}
          />
        )}

        {activeTab === 'plantao' && (
          <ShiftManagement
            currentSector={currentSector}
            beds={beds}
            nurses={nurses}
            technicians={technicians}
            currentShift={currentShift}
            onUpdateShiftConfig={handleUpdateShiftConfig}
            onAddNewNurse={handleAddNewNurse}
            onAddNewTechnician={(tech) => setTechnicians((prev) => [...prev, tech])}
            onToggleTechnicianPresence={handleToggleTechnicianPresence}
          />
        )}

        {activeTab === 'funcionarios' && (
          <EmployeeManagement
            employees={employees}
            sectors={sectors}
            onSaveEmployee={handleSaveEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onToggleStatus={handleToggleEmployeeStatus}
          />
        )}

        {activeTab === 'setores' && (
          <SectorManagement
            sectors={sectors}
            beds={beds}
            onSaveSector={handleSaveSector}
            onDeleteSector={handleDeleteSector}
            onSaveBed={handleSaveBedFromSectorMgmt}
            onDeleteBed={handleDeleteBed}
            onImportCsv={handleImportCsv}
          />
        )}

        {activeTab === 'impressao' && (
          <PrintableA4Report
            currentSector={currentSector}
            beds={beds}
            patients={patients}
            nurses={nurses}
            technicians={technicians}
            currentShift={currentShift}
            onBack={() => setActiveTab('atribuicao')}
          />
        )}
      </main>

      {/* Global Modals */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        bed={selectedBedForPatient}
        patientToEdit={selectedPatientForEdit}
        onSavePatient={handleSavePatient}
        onDischargePatient={handleDischargePatient}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        nurses={nurses}
        currentUser={currentUser}
        onLoginSuccess={(nurse) => setCurrentUser(nurse)}
      />

      {/* Hospital Footer */}
      <footer className="bg-slate-900 text-slate-400 text-[10px] sm:text-xs py-4 sm:py-6 border-t border-slate-800 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <HMWGLogo size="sm" showText={true} inverted={true} />
          </div>

          <div className="text-center sm:text-right text-[10px] sm:text-[11px] space-y-1">
            <p className="text-slate-300 font-semibold">
              Hospital Monsenhor Walfredo Gurgel — Pronto-Socorro Clóvis Sarinho
            </p>
            <p className="text-slate-500">
              Secretaria de Estado da Saúde Pública (SESAP / RN) • Gestão Assistencial de Enfermagem
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-3 pt-1">
              <button
                onClick={() => {
                  if (window.confirm('Deseja restaurar os dados de demonstração originais do HMWG?')) {
                    Storage.resetToDefaults();
                  }
                }}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Restaurar Dados Padrão HMWG
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Sync Toast Notification */}
      {syncToast && syncToast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              syncToast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-900/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{syncToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

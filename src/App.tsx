/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { Header } from './components/Header';
import { BedMap } from './components/BedMap';
import { CareAssignment } from './components/CareAssignment';
import { PrintableA4Report } from './components/PrintableA4Report';
import { VacancyRequests } from './components/VacancyRequests';
import { ShiftManagement } from './components/ShiftManagement';
import { EmployeeManagement } from './components/EmployeeManagement';
import { PatientFormModal } from './components/PatientFormModal';
import { LoginModal } from './components/LoginModal';
import { HMWGLogo } from './components/HMWGLogo';
import {
  RotateCcw,
  CheckCircle2,
  HeartHandshake,
  FileSpreadsheet,
  Building,
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

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<'mapa' | 'atribuicao' | 'vagas' | 'plantao' | 'funcionarios' | 'impressao'>('mapa');

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

  // Handlers for Employees (Quadro Geral de Funcionários)
  const handleSaveEmployee = (savedEmp: Employee) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === savedEmp.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedEmp;
        return copy;
      }
      return [savedEmp, ...prev];
    });

    // Sincronização com Enfermeiros (Nurse)
    if (savedEmp.categoria === 'Enfermeiro(a)') {
      const nurseData: Nurse = {
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
      setNurses((prev) => {
        const idx = prev.findIndex((n) => n.id === savedEmp.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = nurseData;
          return copy;
        }
        return [...prev, nurseData];
      });
    }

    // Sincronização com Técnicos (Technician)
    if (savedEmp.categoria === 'Técnico(a) de Enfermagem') {
      const techData: Technician = {
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
      setTechnicians((prev) => {
        const idx = prev.findIndex((t) => t.id === savedEmp.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = techData;
          return copy;
        }
        return [...prev, techData];
      });
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    setNurses((prev) => prev.filter((n) => n.id !== employeeId));
    setTechnicians((prev) => prev.filter((t) => t.id !== employeeId));
  };

  const handleToggleEmployeeStatus = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          const newStatus = e.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
          return { ...e, status: newStatus };
        }
        return e;
      })
    );

    // Se for técnico, atualiza a presença no plantão
    setTechnicians((prev) =>
      prev.map((t) => (t.id === employeeId ? { ...t, presenteNoPlantao: !t.presenteNoPlantao } : t))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-sky-600 selection:text-white">
      {/* Primary Header with HMWG Logo & Hospital Navigation */}
      <Header
        sectors={sectors}
        selectedSectorId={selectedSectorId}
        onSelectSector={setSelectedSectorId}
        currentUser={currentUser}
        currentShift={currentShift}
        nurses={nurses}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
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
    </div>
  );
}

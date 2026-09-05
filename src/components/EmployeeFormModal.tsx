import React, { useState, useEffect } from 'react';
import {
  Employee,
  EmployeeCategory,
  EmployeeStatus,
  ContractType,
  CouncilType,
  EmployeeTurn,
  Sector,
} from '../types';
import { HMWGLogo } from './HMWGLogo';
import {
  X,
  User,
  Shield,
  Briefcase,
  Building,
  Key,
  Calendar,
  Sparkles,
  Save,
  FileCheck,
} from 'lucide-react';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit?: Employee | null;
  sectors: Sector[];
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  sectors,
}) => {
  const isEditing = Boolean(employeeToEdit);

  // Form Fields
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [categoria, setCategoria] = useState<EmployeeCategory>('Enfermeiro(a)');
  const [cargo, setCargo] = useState('Enfermeiro Assistencial');
  const [conselhoTipo, setConselhoTipo] = useState<CouncilType>('COREN');
  const [conselhoNumero, setConselhoNumero] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [setorPadraoId, setSetorPadraoId] = useState('');
  const [regimeContratual, setRegimeContratual] = useState<ContractType>('Efetivo SESAP/RN');
  const [turnoPadrao, setTurnoPadrao] = useState<EmployeeTurn>('Diurno (07h-19h)');
  const [status, setStatus] = useState<EmployeeStatus>('ATIVO');
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [senha, setSenha] = useState('hmwg123');

  // Form Tab
  const [activeSection, setActiveSection] = useState<'pessoal' | 'funcional' | 'lotacao'>('pessoal');

  // Reset or initialize on open/change
  useEffect(() => {
    if (isOpen) {
      if (employeeToEdit) {
        setMatricula(employeeToEdit.matricula || '');
        setNome(employeeToEdit.nome || '');
        setCpf(employeeToEdit.cpf || '');
        setCategoria(employeeToEdit.categoria || 'Enfermeiro(a)');
        setCargo(employeeToEdit.cargo || '');
        setConselhoTipo(employeeToEdit.conselhoTipo || 'COREN');
        setConselhoNumero(employeeToEdit.conselhoNumero || '');
        setEmail(employeeToEdit.email || '');
        setTelefone(employeeToEdit.telefone || '');
        setSetorPadraoId(employeeToEdit.setorPadraoId || sectors[0]?.id || 'sec-uti');
        setRegimeContratual(employeeToEdit.regimeContratual || 'Efetivo SESAP/RN');
        setTurnoPadrao(employeeToEdit.turnoPadrao || 'Diurno (07h-19h)');
        setStatus(employeeToEdit.status || 'ATIVO');
        setDataAdmissao(employeeToEdit.dataAdmissao || new Date().toISOString().split('T')[0]);
        setObservacoes(employeeToEdit.observacoes || '');
        setSenha(employeeToEdit.senha || 'hmwg123');
      } else {
        // Defaults for new employee
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const randomDigit = Math.floor(Math.random() * 9);
        setMatricula(`SESAP-${randomNum}-${randomDigit}`);
        setNome('');
        setCpf('');
        setCategoria('Enfermeiro(a)');
        setCargo('Enfermeiro Assistencial');
        setConselhoTipo('COREN');
        setConselhoNumero(`COREN-RN ${randomNum}-ENF`);
        setEmail('');
        setTelefone('(84) 9');
        setSetorPadraoId(sectors[0]?.id || 'sec-uti');
        setRegimeContratual('Efetivo SESAP/RN');
        setTurnoPadrao('Diurno (07h-19h)');
        setStatus('ATIVO');
        setDataAdmissao(new Date().toISOString().split('T')[0]);
        setObservacoes('');
        setSenha('enfermagem123');
      }
      setActiveSection('pessoal');
    }
  }, [isOpen, employeeToEdit, sectors]);

  // Adjust defaults when category changes
  const handleCategoryChange = (newCat: EmployeeCategory) => {
    setCategoria(newCat);
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    if (newCat === 'Enfermeiro(a)') {
      setCargo('Enfermeiro Assistencial');
      setConselhoTipo('COREN');
      if (!isEditing) setConselhoNumero(`COREN-RN ${randomNum}-ENF`);
    } else if (newCat === 'Técnico(a) de Enfermagem') {
      setCargo('Técnico de Enfermagem');
      setConselhoTipo('COREN');
      if (!isEditing) setConselhoNumero(`COREN-RN ${randomNum}-TE`);
    } else if (newCat === 'Auxiliar de Enfermagem') {
      setCargo('Auxiliar de Enfermagem');
      setConselhoTipo('COREN');
      if (!isEditing) setConselhoNumero(`COREN-RN ${randomNum}-AE`);
    } else if (newCat === 'Médico(a)') {
      setCargo('Médico Plantonista');
      setConselhoTipo('CRM');
      if (!isEditing) setConselhoNumero(`CRM-RN ${Math.floor(5000 + Math.random() * 4000)}`);
    } else if (newCat === 'Fisioterapeuta') {
      setCargo('Fisioterapeuta Respiratório');
      setConselhoTipo('CREFITO');
      if (!isEditing) setConselhoNumero(`CREFITO-1 ${randomNum}-F`);
    } else {
      setCargo('Assistente Administrativo');
      setConselhoTipo('NÃO APLICÁVEL');
      setConselhoNumero('');
    }
  };

  const handleGenerateMatricula = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const randomDigit = Math.floor(Math.random() * 9);
    setMatricula(`SESAP-${randomNum}-${randomDigit}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !matricula.trim()) {
      alert('Por favor, informe ao menos o Nome Completo e a Matrícula do funcionário.');
      return;
    }

    // Auto-prefix formatting for nursing/medical staff if missing
    let formattedName = nome.trim();
    if (categoria === 'Enfermeiro(a)' && !formattedName.startsWith('Enf.')) {
      formattedName = `Enf. ${formattedName}`;
    } else if (categoria === 'Técnico(a) de Enfermagem' && !formattedName.startsWith('Téc.')) {
      formattedName = `Téc. ${formattedName}`;
    } else if (categoria === 'Médico(a)' && !formattedName.startsWith('Dr.') && !formattedName.startsWith('Dra.')) {
      formattedName = `Dr. ${formattedName}`;
    }

    // Fallback email
    const safeEmail =
      email.trim() ||
      `${formattedName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')}@hmwg.rn.gov.br`;

    const savedEmployee: Employee = {
      id: employeeToEdit ? employeeToEdit.id : `emp-${Date.now()}`,
      matricula: matricula.trim(),
      nome: formattedName,
      cpf: cpf.trim(),
      categoria,
      cargo: cargo.trim() || categoria,
      conselhoTipo,
      conselhoNumero: conselhoNumero.trim(),
      email: safeEmail,
      telefone: telefone.trim(),
      setorPadraoId: setorPadraoId || sectors[0]?.id || 'sec-uti',
      regimeContratual,
      turnoPadrao,
      status,
      dataAdmissao: dataAdmissao || new Date().toISOString().split('T')[0],
      observacoes: observacoes.trim(),
      senha: senha.trim() || 'hmwg123',
    };

    onSave(savedEmployee);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HMWGLogo size="sm" inverted={true} showText={false} />
            <div>
              <h3 className="font-bold text-sm sm:text-base tracking-tight">
                {isEditing ? 'Editar Cadastro de Funcionário' : 'Novo Cadastro de Funcionário — HMWG'}
              </h3>
              <p className="text-[11px] text-cyan-200">
                Hospital Monsenhor Walfredo Gurgel • Registro no Quadro de Colaboradores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('pessoal')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'pessoal'
                ? 'border-sky-600 text-sky-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1. Dados Pessoais & Contato
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('funcional')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'funcional'
                ? 'border-sky-600 text-sky-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            2. Cargo & Conselho
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('lotacao')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'lotacao'
                ? 'border-sky-600 text-sky-900 font-bold bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            3. Lotação & Acesso
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* SECTION 1: DADOS PESSOAIS */}
          {activeSection === 'pessoal' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Nome Completo do Funcionário *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Juliana Vasconcelos de Souza"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    O prefixo profissional (Enf., Téc., Dr.) será ajustado automaticamente conforme a categoria.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    CPF (Cadastro de Pessoa Física)
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(84) 99999-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    E-mail Institucional / Pessoal
                  </label>
                  <input
                    type="email"
                    placeholder="ex: juliana.vasconcelos@hmwg.rn.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 flex items-start gap-2.5 text-sky-900">
                <FileCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Dica de Organização:</strong> O e-mail e o telefone são utilizados para comunicação interna do HMWG e identificação nas folhas de passagem de plantão.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: DADOS FUNCIONAIS E CONSELHO */}
          {activeSection === 'funcional' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Matrícula SESAP */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">
                      Matrícula Funcional SESAP/RN *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateMatricula}
                      className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-sky-600" />
                      Gerar Matrícula Sugerida
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ex: SESAP-182405-2"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono font-bold text-slate-900"
                  />
                </div>

                {/* Categoria Profissional */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Categoria Profissional *
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => handleCategoryChange(e.target.value as EmployeeCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    <option value="Enfermeiro(a)">Enfermeiro(a)</option>
                    <option value="Técnico(a) de Enfermagem">Técnico(a) de Enfermagem</option>
                    <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
                    <option value="Médico(a)">Médico(a)</option>
                    <option value="Fisioterapeuta">Fisioterapeuta</option>
                    <option value="Apoio / Administrativo">Apoio / Administrativo</option>
                  </select>
                </div>

                {/* Cargo Específico */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Cargo / Especialidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Enfermeiro Chefe / RT ou Plantonista"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>

                {/* Órgão de Classe */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Conselho Profissional
                  </label>
                  <select
                    value={conselhoTipo}
                    onChange={(e) => setConselhoTipo(e.target.value as CouncilType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    <option value="COREN">COREN (Conselho Regional de Enfermagem)</option>
                    <option value="CRM">CRM (Conselho Regional de Medicina)</option>
                    <option value="CREFITO">CREFITO (Fisioterapia & TO)</option>
                    <option value="OUTRO">Outro Conselho</option>
                    <option value="NÃO APLICÁVEL">Não Aplicável</option>
                  </select>
                </div>

                {/* Número do Registro */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nº do Registro no Conselho
                  </label>
                  <input
                    type="text"
                    placeholder="ex: COREN-RN 182.405-ENF"
                    value={conselhoNumero}
                    onChange={(e) => setConselhoNumero(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                {/* Vínculo Empregatício */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Regime / Vínculo Contratual
                  </label>
                  <select
                    value={regimeContratual}
                    onChange={(e) => setRegimeContratual(e.target.value as ContractType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    <option value="Efetivo SESAP/RN">Efetivo SESAP/RN (Concursado)</option>
                    <option value="Contrato Temporário">Contrato Temporário (Processo Seletivo)</option>
                    <option value="Cooperado">Cooperado / Convênio Médico</option>
                    <option value="Residente">Residente Multiprofissional / Médico</option>
                    <option value="Terceirizado">Prestador Terceirizado</option>
                  </select>
                </div>

                {/* Data de Admissão */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Data de Admissão / Início
                  </label>
                  <input
                    type="date"
                    value={dataAdmissao}
                    onChange={(e) => setDataAdmissao(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: LOTAÇÃO, ESCALA E ACESSO */}
          {activeSection === 'lotacao' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Setor de Lotação */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Setor Padrão de Lotação
                  </label>
                  <select
                    value={setorPadraoId}
                    onChange={(e) => setSetorPadraoId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    {sectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.nome} ({sec.sigla})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Turno de Escala */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Turno / Regime de Horário
                  </label>
                  <select
                    value={turnoPadrao}
                    onChange={(e) => setTurnoPadrao(e.target.value as EmployeeTurn)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    <option value="Diurno (07h-19h)">Plantão Diurno (07h às 19h) — 12h</option>
                    <option value="Noturno (19h-07h)">Plantão Noturno (19h às 07h) — 12h</option>
                    <option value="Diarista 30h">Diarista Semanal (30h)</option>
                    <option value="Diarista 40h">Diarista Semanal (40h)</option>
                    <option value="Ambos / Plantonista">Plantonista Flexível / Ambos</option>
                  </select>
                </div>

                {/* Status Funcional */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Situação / Status Funcional
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    <option value="ATIVO">🟢 Ativo (Em exercício)</option>
                    <option value="LICENCA">🟡 Em Licença (Médica / Prêmio / Maternidade)</option>
                    <option value="AFASTADO">🔴 Afastado / Cedido</option>
                    <option value="INATIVO">⚪ Inativo (Desligado / Aposentado)</option>
                  </select>
                </div>

                {/* Senha de Acesso ao Sistema */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Senha de Acesso ao Sistema
                  </label>
                  <input
                    type="password"
                    placeholder="Senha para login"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Utilizada por enfermeiros e gestores para autenticação no sistema.
                  </p>
                </div>

                {/* Observações / Especializações */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Observações Funcionais / Especializações
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ex: Especialista em Terapia Intensiva e PICC. Restrições de plantão ou folgas programadas."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-sky-700" />
              <span>Dados sincronizados com escalas e plantões do HMWG</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-sky-800 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

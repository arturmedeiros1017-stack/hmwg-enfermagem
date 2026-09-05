import React from 'react';
import { Employee, Sector } from '../types';
import { HMWGLogo } from './HMWGLogo';
import { X, Printer, Shield, Building, Calendar, Phone, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmployeeBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  sectors: Sector[];
}

export const EmployeeBadgeModal: React.FC<EmployeeBadgeModalProps> = ({
  isOpen,
  onClose,
  employee,
  sectors,
}) => {
  if (!isOpen || !employee) return null;

  const sector = sectors.find((s) => s.id === employee.setorPadraoId);

  const handlePrint = () => {
    window.print();
  };

  const getCategoryColor = (categoria: Employee['categoria']) => {
    switch (categoria) {
      case 'Enfermeiro(a)':
        return 'bg-sky-600 text-white';
      case 'Técnico(a) de Enfermagem':
        return 'bg-cyan-600 text-white';
      case 'Médico(a)':
        return 'bg-indigo-600 text-white';
      case 'Fisioterapeuta':
        return 'bg-teal-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'ATIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ATIVO / EM EXERCÍCIO
          </span>
        );
      case 'LICENCA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            EM LICENÇA
          </span>
        );
      case 'AFASTADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            AFASTADO
          </span>
        );
      case 'INATIVO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            INATIVO
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Ficha Funcional & Identificação do Colaborador
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Ficha
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Institutional Badge Design */}
          <div className="border-2 border-slate-300 rounded-2xl p-6 bg-gradient-to-b from-slate-50 via-white to-slate-50 shadow-sm relative overflow-hidden">
            {/* Top Badge Brand */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <HMWGLogo size="md" />
                <div>
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-800">
                    Governo do Estado do Rio Grande do Norte
                  </h4>
                  <p className="text-[11px] font-semibold text-sky-800">
                    SESAP • Hospital Monsenhor Walfredo Gurgel
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pronto-Socorro Clóvis Sarinho • Identificação Funcional
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-center sm:items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Matrícula SESAP
                </span>
                <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {employee.matricula}
                </span>
              </div>
            </div>

            {/* Middle Badge Info */}
            <div className="py-6 flex flex-col sm:flex-row items-center gap-6">
              {/* Photo / Avatar Placeholder */}
              <div className="w-28 h-32 rounded-xl bg-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-600 shadow-inner flex-shrink-0 relative">
                <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-xl">
                  {employee.nome.charAt(0)}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold mt-2 text-slate-500">
                  HMWG / SESAP
                </span>
                <div className="absolute -bottom-2 px-2 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-white uppercase tracking-wider">
                  {employee.categoria.split('(')[0]}
                </div>
              </div>

              {/* Employee Key Specs */}
              <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {employee.nome}
                  </h2>
                  <p className="text-sm font-bold text-sky-700">{employee.cargo}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs ${getCategoryColor(employee.categoria)}`}>
                    {employee.categoria}
                  </span>
                  {employee.conselhoNumero && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-white border border-slate-700">
                      {employee.conselhoNumero}
                    </span>
                  )}
                  {getStatusBadge(employee.status)}
                </div>
              </div>
            </div>

            {/* Bottom Details Grid */}
            <div className="border-t border-slate-200 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Lotação</span>
                <span className="font-bold text-slate-800">{sector ? sector.nome : 'Geral'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Vínculo</span>
                <span className="font-bold text-slate-800">{employee.regimeContratual}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Escala / Turno</span>
                <span className="font-bold text-slate-800">{employee.turnoPadrao}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Admissão</span>
                <span className="font-bold text-slate-800">{employee.dataAdmissao}</span>
              </div>
            </div>
          </div>

          {/* Complementary Records */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              Informações Complementares de Cadastro
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-semibold text-slate-800">CPF:</span>
                <span className="font-mono text-slate-900">{employee.cpf || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{employee.telefone || 'Não informado'}</span>
              </div>
            </div>

            {employee.observacoes && (
              <div className="border-t border-slate-200/60 pt-2 text-slate-600">
                <span className="font-semibold text-slate-800">Observações:</span> {employee.observacoes}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Imprimir Crachá / Ficha
          </button>
        </div>
      </div>
    </div>
  );
};

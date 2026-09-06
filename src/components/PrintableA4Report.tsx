import React, { useRef, useState } from 'react';
import { Bed, Nurse, Patient, Sector, ShiftConfig, Technician } from '../types';
import { generateNursingAssignment } from '../utils/assignment';
import { formatDateBR } from '../utils/dateUtils';
import { HMWGLogo } from './HMWGLogo';
import {
  Printer,
  ArrowLeft,
  FileDown,
  ShieldAlert,
  CheckCircle2,
  Ban,
  Calendar,
  Clock,
  Building2,
} from 'lucide-react';

interface PrintableA4ReportProps {
  currentSector: Sector;
  beds: Bed[];
  patients: Patient[];
  nurses: Nurse[];
  technicians: Technician[];
  currentShift: ShiftConfig;
  onBack: () => void;
}

export const PrintableA4Report: React.FC<PrintableA4ReportProps> = ({
  currentSector,
  beds,
  patients,
  nurses,
  technicians,
  currentShift,
  onBack,
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const printContainerRef = useRef<HTMLDivElement>(null);

  const assignment = generateNursingAssignment(
    currentSector,
    beds,
    patients,
    nurses,
    technicians,
    currentShift
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar (Hidden during actual print) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Sistema</span>
            <span className="sm:hidden">Voltar</span>
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
              Visualização de Impressão em Folha A4
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
              Documento oficial da assistência de enfermagem formatado para folha A4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Orientation Toggle */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl text-[10px] sm:text-xs font-semibold">
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg transition-colors ${
                orientation === 'landscape'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paisagem
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg transition-colors ${
                orientation === 'portrait'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retrato
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            <span className="sm:hidden">Imprimir</span>
          </button>
        </div>
      </div>

      {/* A4 PRINT CONTAINER */}
      <div
        ref={printContainerRef}
        id="a4-print-document"
        className={`mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-lg text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full ${
          orientation === 'landscape' ? 'max-w-[1200px]' : 'max-w-[850px]'
        }`}
        style={{
          minHeight: '297mm',
        }}
      >
        {/* OFFICIAL HOSPITAL HEADER */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Left */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <HMWGLogo size="print" className="print:w-16 print:h-16" />
              <div className="leading-tight">
                <div className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                  GOVERNO DO ESTADO DO RIO GRANDE DO NORTE
                </div>
                <div className="text-[11px] font-black uppercase text-slate-800">
                  SECRETARIA DE ESTADO DA SAÚDE PÚBLICA — SESAP
                </div>
                <div className="text-base font-black text-slate-950 uppercase tracking-tight">
                  HOSPITAL MONSENHOR WALFREDO GURGEL — HMWG
                </div>
                <div className="text-[10px] font-semibold text-slate-600">
                  DIVISÃO DE ENFERMAGEM • COORDENAÇÃO DE PLANTÃO ASSISTENCIAL
                </div>
              </div>
            </div>

            {/* Document Title & Badge Right */}
            <div className="text-right border-l-2 border-slate-300 pl-4">
              <div className="text-xs font-black uppercase bg-slate-900 text-white px-2.5 py-1 rounded inline-block">
                FOLHA DE ATRIBUIÇÃO DE CUIDADOS
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Emissão: {assignment.dataGeracao}
              </div>
              <div className="text-[10px] font-bold text-slate-700">
                Setor: <span className="uppercase text-sky-900">{assignment.setor.nome}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SHIFT & RESPONSIBLE NURSES BOX */}
        {/* Requirement: "essa atribuição deverá constar os enfermeiros e os leitos que eles estavam atribuídos" */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <div className="md:col-span-3">
              <span className="text-[10px] font-black text-slate-500 uppercase block">
                Turno / Plantão
              </span>
              <span className="font-bold text-slate-900">{currentShift.turno}</span>
              <span className="text-[10px] text-slate-500 block">Data: {currentShift.data}</span>
            </div>

            <div className="md:col-span-9">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                Enfermeiros Responsáveis pelo Plantão e Leitos Atribuídos:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assignment.enfermeirosResponsaveis.map(({ enfermeiro, leitosAtribuidos }) => (
                  <div
                    key={enfermeiro.id}
                    className="bg-white p-2 rounded border border-slate-200 text-xs"
                  >
                    <div className="font-bold text-slate-900">
                      {enfermeiro.nome}{' '}
                      <span className="text-[10px] font-normal text-slate-500">
                        ({enfermeiro.coren})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      <strong>Leitos Atribuídos:</strong>{' '}
                      {leitosAtribuidos.length > 0 ? (
                        <span className="font-semibold text-sky-900">
                          {leitosAtribuidos.map((b) => b.numero).join(', ')}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Geral / Supervisão</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN TABLE: CARE ASSIGNMENT PER TECHNICIAN */}
        {/* Requirement: "distribuir pela quantidade de técnicos presentes os leitos conforme a classificação e indicar na atribuição se o paciente e traqueostomizado" */}
        <div className="mb-4">
          <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-200">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Distribuição de Leitos por Técnicos de Enfermagem Presentes
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">
              Distribuído conforme Classificação de Complexidade (Fugulin) & Prioridade TQT
            </span>
          </div>

          <div className="space-y-3">
            {assignment.distribuicaoTecnicos.map((item, idx) => (
              <div
                key={item.tecnico.id}
                className="border border-slate-400 rounded-lg overflow-hidden text-xs break-inside-avoid"
              >
                {/* Technician Bar */}
                <div className="bg-slate-200 text-slate-900 px-3 py-1.5 font-bold flex items-center justify-between border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      TEC #{idx + 1}
                    </span>
                    <span className="text-sm font-black">{item.tecnico.nome}</span>
                    <span className="text-xs font-mono font-normal text-slate-600">
                      ({item.tecnico.coren})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {item.totalTraqueostomizados > 0 && (
                      <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        {item.totalTraqueostomizados} Traqueostomizado(s)
                      </span>
                    )}

                    <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-black text-slate-800">
                      Total: {item.leitos.length} leitos • {item.totalPontuacao} pts
                    </span>
                  </div>
                </div>

                {/* Patient Table for this Technician */}
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase text-[9px] font-bold border-b border-slate-300">
                      <th className="p-1.5 w-24">Leito</th>
                      <th className="p-1.5 w-44">Paciente / Prontuário</th>
                      <th className="p-1.5 w-32">Classificação</th>
                      <th className="p-1.5 w-28 text-center bg-rose-50/50">Traqueostomia?</th>
                      <th className="p-1.5 w-28">Isolamento</th>
                      <th className="p-1.5 w-32">Curativo</th>
                      <th className="p-1.5 w-24">Sinais Vitais</th>
                      <th className="p-1.5">Oxigenação / Cuidados Específicos</th>
                      <th className="p-1.5 w-16 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {item.leitos.length > 0 ? (
                      item.leitos.map(({ leito, paciente }) => (
                        <tr
                          key={leito.id}
                          className={`${
                            paciente?.traqueostomia ? 'bg-rose-50/30' : 'bg-white'
                          } hover:bg-slate-50`}
                        >
                          <td className="p-1.5 font-bold text-slate-900 whitespace-nowrap">
                            {leito.numero}
                          </td>
                          <td className="p-1.5 font-semibold text-slate-800">
                            {paciente ? (
                              <div>
                                <div className="leading-tight">{paciente.nome}</div>
                                <div className="text-[9px] text-slate-500 font-mono">
                                  {paciente.prontuario} • {paciente.idade}a{paciente.dataNascimento ? ` (${formatDateBR(paciente.dataNascimento)})` : ''}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Sem identificação</span>
                            )}
                          </td>
                          <td className="p-1.5 font-medium text-slate-700">
                            {paciente?.classificacao || '—'}
                          </td>

                          {/* TRAQUEOSTOMIA REQUIREMENT - HIGHLIGHTED */}
                          <td className="p-1.5 text-center font-bold">
                            {paciente?.traqueostomia ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] uppercase">
                                SIM [TQT]
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">NÃO</span>
                            )}
                          </td>

                          <td className="p-1.5">
                            {paciente?.tipoIsolamento && paciente.tipoIsolamento !== 'Padrão' ? (
                              <span className="font-bold text-amber-900 bg-amber-100 px-1 py-0.5 rounded text-[10px]">
                                {paciente.tipoIsolamento}
                              </span>
                            ) : (
                              <span className="text-slate-500">Padrão</span>
                            )}
                          </td>

                          <td className="p-1.5 font-medium">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-[10px]">
                              {paciente?.curativo || 'sem curativo'}
                            </span>
                          </td>

                          <td className="p-1.5 text-slate-700 whitespace-nowrap">
                            {paciente?.sinaisVitais || '—'}
                          </td>

                          <td className="p-1.5 text-slate-600 leading-tight">
                            <div>
                              <strong className="text-slate-700">O2:</strong>{' '}
                              {paciente?.oxigenacao || 'Ar ambiente'}
                            </div>
                            {paciente?.alergia && paciente.alergia !== 'Nenhuma conhecida' && (
                              <div className="text-rose-700 font-bold text-[10px]">
                                Alergia: {paciente.alergia}
                              </div>
                            )}
                          </td>

                          <td className="p-1.5 text-right font-black text-slate-900">
                            {paciente?.pontuacao ? `${paciente.pontuacao}p` : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-3 text-center text-slate-400 italic">
                          Nenhum leito atribuído.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: LEITOS DESOCUPADOS E LEITOS BLOQUEADOS */}
        {/* Requirement: "indicar os leitos desocupados e bloqueados" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 break-inside-avoid">
          {/* Desocupados */}
          <div className="border border-emerald-400 bg-emerald-50/50 rounded-lg p-2.5 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-black text-emerald-950 uppercase text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Leitos Desocupados / Vagos ({assignment.leitosDesocupados.length})
              </span>
              <span className="text-[10px] text-emerald-800 font-bold">Disponíveis</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-900">
              {assignment.leitosDesocupados.length > 0 ? (
                assignment.leitosDesocupados.map((b) => b.numero).join(' • ')
              ) : (
                <span className="italic text-slate-500">Nenhum leito desocupado no momento.</span>
              )}
            </div>
          </div>

          {/* Bloqueados */}
          <div className="border border-slate-400 bg-slate-100 rounded-lg p-2.5 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-black text-slate-800 uppercase text-[10px] flex items-center gap-1">
                <Ban className="w-3.5 h-3.5 text-slate-500" />
                Leitos Bloqueados ({assignment.leitosBloqueados.length})
              </span>
              <span className="text-[10px] text-slate-600 font-bold">Indisponíveis</span>
            </div>
            <div className="text-[11px] text-slate-800 space-y-0.5">
              {assignment.leitosBloqueados.length > 0 ? (
                assignment.leitosBloqueados.map((b) => (
                  <div key={b.id} className="truncate">
                    <strong>{b.numero}:</strong> {b.motivoBloqueio || 'Manutenção'}
                  </div>
                ))
              ) : (
                <span className="italic text-slate-500">Nenhum leito bloqueado.</span>
              )}
            </div>
          </div>
        </div>

        {/* SIGNATURE & CARIMBO FOOTER */}
        <div className="border-t-2 border-slate-300 pt-6 mt-6 break-inside-avoid">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 h-10 mb-1" />
              <div className="font-bold text-slate-900">Enfermeiro(a) Responsável 1</div>
              <div className="text-[10px] text-slate-500">Carimbo e Assinatura COREN</div>
            </div>

            <div>
              <div className="border-b border-slate-400 h-10 mb-1" />
              <div className="font-bold text-slate-900">Enfermeiro(a) Responsável 2</div>
              <div className="text-[10px] text-slate-500">Carimbo e Assinatura COREN</div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="border-b border-slate-400 h-10 mb-1" />
              <div className="font-bold text-slate-900">Coordenação de Enfermagem HMWG</div>
              <div className="text-[10px] text-slate-500">Visto da Chefia de Plantão</div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 mt-4">
            Hospital Monsenhor Walfredo Gurgel • Av. Senador Salgado Filho, S/N - Tirol, Natal - RN
            • Sistema de Gestão de Enfermagem (HMWG)
          </div>
        </div>
      </div>
    </div>
  );
};

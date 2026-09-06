import React, { useState } from 'react';
import { Sector, Bed, BedStatus } from '../types';
import { SectorFormModal } from './SectorFormModal';
import { BedFormModal } from './BedFormModal';
import { CsvImportModal } from './CsvImportModal';
import {
  Building2,
  BedDouble,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Palette,
  Upload,
} from 'lucide-react';

interface SectorManagementProps {
  sectors: Sector[];
  beds: Bed[];
  onSaveSector: (sector: Sector) => void;
  onDeleteSector: (sectorId: string) => void;
  onSaveBed: (bed: Bed) => void;
  onDeleteBed: (bedId: string) => void;
  onImportCsv: (type: 'setores' | 'leitos' | 'pacientes', data: any[]) => void;
}

const statusConfig: Record<BedStatus, { color: string; bg: string; label: string }> = {
  OCUPADO: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Ocupado' },
  DESOCUPADO: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Desocupado' },
  BLOQUEADO: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Bloqueado' },
  HIGIENIZACAO: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Higienização' },
};

export const SectorManagement: React.FC<SectorManagementProps> = ({
  sectors,
  beds,
  onSaveSector,
  onDeleteSector,
  onSaveBed,
  onDeleteBed,
  onImportCsv,
}) => {
  const [expandedSector, setExpandedSector] = useState<string | null>(sectors[0]?.id || null);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [bedModalSectorId, setBedModalSectorId] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const getBedStats = (sectorId: string) => {
    const sectorBeds = beds.filter((b) => b.setorId === sectorId);
    const ocupados = sectorBeds.filter((b) => b.status === 'OCUPADO').length;
    const desocupados = sectorBeds.filter((b) => b.status === 'DESOCUPADO').length;
    const bloqueados = sectorBeds.filter((b) => b.status === 'BLOQUEADO').length;
    const higienizacao = sectorBeds.filter((b) => b.status === 'HIGIENIZACAO').length;
    return { total: sectorBeds.length, ocupados, desocupados, bloqueados, higienizacao };
  };

  const handleEditSector = (sector: Sector) => {
    setEditingSector(sector);
    setIsSectorModalOpen(true);
  };

  const handleNewSector = () => {
    setEditingSector(null);
    setIsSectorModalOpen(true);
  };

  const handleNewBed = (sectorId: string) => {
    setEditingBed(null);
    setBedModalSectorId(sectorId);
    setIsBedModalOpen(true);
  };

  const handleEditBed = (bed: Bed) => {
    setEditingBed(bed);
    setBedModalSectorId(bed.setorId);
    setIsBedModalOpen(true);
  };

  const handleDeleteSector = (sector: Sector) => {
    const sectorBeds = beds.filter((b) => b.setorId === sector.id);
    const occupiedBeds = sectorBeds.filter((b) => b.status === 'OCUPADO');
    if (occupiedBeds.length > 0) {
      alert(`Não é possível excluir o setor "${sector.nome}" pois possui ${occupiedBeds.length} leito(s) ocupado(s). Desocupe todos os leitos antes de excluir.`);
      return;
    }
    if (window.confirm(`Deseja realmente excluir o setor "${sector.nome}" e todos os seus ${sectorBeds.length} leito(s)?`)) {
      onDeleteSector(sector.id);
    }
  };

  const handleDeleteBed = (bed: Bed) => {
    if (bed.status === 'OCUPADO') {
      alert('Não é possível excluir um leito ocupado. Desocupe o leito antes de excluir.');
      return;
    }
    if (window.confirm(`Deseja realmente excluir o leito "${bed.numero}"?`)) {
      onDeleteBed(bed.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Setores e Enfermarias
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie os setores do hospital e os leitos (enfermarias) de cada um
          </p>
        </div>
        <button
          onClick={handleNewSector}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Setor
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Importar CSV
        </button>
      </div>

      {/* Sectors List */}
      <div className="space-y-3">
        {sectors.map((sector) => {
          const stats = getBedStats(sector.id);
          const sectorBeds = beds.filter((b) => b.setorId === sector.id);
          const isExpanded = expandedSector === sector.id;

          return (
            <div key={sector.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              {/* Sector Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedSector(isExpanded ? null : sector.id)}
              >
                <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: sector.cor }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{sector.nome}</span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {sector.sigla}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{sector.descricao}</p>
                </div>

                {/* Bed Stats */}
                <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-slate-500">
                    <BedDouble className="w-3.5 h-3.5" />
                    {stats.total}/{sector.capacidadeTotal}
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {stats.ocupados}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <MinusCircle className="w-3.5 h-3.5" />
                    {stats.desocupados}
                  </span>
                  {stats.bloqueados > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {stats.bloqueados}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSector(sector);
                    }}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Editar setor"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSector(sector);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir setor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded: Beds List */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Leitos / Enfermarias ({sectorBeds.length})
                    </span>
                    <button
                      onClick={() => handleNewBed(sector.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Novo Leito
                    </button>
                  </div>

                  {sectorBeds.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center">
                      Nenhum leito cadastrado neste setor
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {sectorBeds.map((bed) => {
                        const st = statusConfig[bed.status];
                        return (
                          <div
                            key={bed.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${st.bg}`}
                          >
                            <span className={`text-[10px] font-bold uppercase ${st.color}`}>
                              {st.label}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 flex-1 truncate">
                              {bed.numero}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleEditBed(bed)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                title="Editar leito"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteBed(bed)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                title="Excluir leito"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sectors.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhum setor cadastrado</p>
            <p className="text-xs">Clique em "Novo Setor" para começar</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <SectorFormModal
        isOpen={isSectorModalOpen}
        onClose={() => {
          setIsSectorModalOpen(false);
          setEditingSector(null);
        }}
        sectorToEdit={editingSector}
        onSave={onSaveSector}
      />

      <BedFormModal
        isOpen={isBedModalOpen}
        onClose={() => {
          setIsBedModalOpen(false);
          setEditingBed(null);
        }}
        bedToEdit={editingBed}
        sectors={sectors}
        defaultSectorId={bedModalSectorId}
        onSave={onSaveBed}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(type, data) => {
          onImportCsv(type, data);
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
};
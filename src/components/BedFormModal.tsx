import React, { useState, useEffect } from 'react';
import { Bed, Sector, BedStatus } from '../types';
import { X, Save, BedDouble } from 'lucide-react';

interface BedFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bedToEdit?: Bed | null;
  sectors: Sector[];
  defaultSectorId?: string;
  onSave: (bed: Bed) => void;
}

const STATUS_OPTIONS: { value: BedStatus; label: string }[] = [
  { value: 'DESOCUPADO', label: 'Desocupado' },
  { value: 'OCUPADO', label: 'Ocupado' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
  { value: 'HIGIENIZACAO', label: 'Higienização' },
];

export const BedFormModal: React.FC<BedFormModalProps> = ({
  isOpen,
  onClose,
  bedToEdit,
  sectors,
  defaultSectorId,
  onSave,
}) => {
  const [numero, setNumero] = useState('');
  const [setorId, setSetorId] = useState(defaultSectorId || sectors[0]?.id || '');
  const [status, setStatus] = useState<BedStatus>('DESOCUPADO');
  const [motivoBloqueio, setMotivoBloqueio] = useState('');

  useEffect(() => {
    if (bedToEdit) {
      setNumero(bedToEdit.numero);
      setSetorId(bedToEdit.setorId);
      setStatus(bedToEdit.status);
      setMotivoBloqueio(bedToEdit.motivoBloqueio || '');
    } else {
      setNumero('');
      setSetorId(defaultSectorId || sectors[0]?.id || '');
      setStatus('DESOCUPADO');
      setMotivoBloqueio('');
    }
  }, [bedToEdit, isOpen, defaultSectorId, sectors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim() || !setorId) return;
    onSave({
      id: bedToEdit?.id || `bed-${Date.now()}`,
      numero: numero.trim(),
      setorId,
      status,
      motivoBloqueio: status === 'BLOQUEADO' ? motivoBloqueio : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between bg-indigo-700 text-white px-5 py-4">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5" />
            <h2 className="text-base font-bold">
              {bedToEdit ? 'Editar Leito / Enfermaria' : 'Novo Leito / Enfermaria'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Nome / Número do Leito *
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Ex: Leito 01, Sala Vermelha 03"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Setor / Enfermaria *
            </label>
            <select
              value={setorId}
              onChange={(e) => setSetorId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              required
            >
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sigla} — {s.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    status === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {status === 'BLOQUEADO' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Motivo do Bloqueio
              </label>
              <textarea
                value={motivoBloqueio}
                onChange={(e) => setMotivoBloqueio(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                placeholder="Descreva o motivo do bloqueio..."
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {bedToEdit ? 'Salvar Alterações' : 'Criar Leito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
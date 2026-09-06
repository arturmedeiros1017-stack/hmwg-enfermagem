import React, { useState, useEffect } from 'react';
import { Sector } from '../types';
import { X, Save, Building2 } from 'lucide-react';

interface SectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorToEdit?: Sector | null;
  onSave: (sector: Sector) => void;
}

const COLORS = [
  '#0284c7', '#dc2626', '#059669', '#7c3aed', '#ea580c',
  '#0891b2', '#4f46e5', '#c026d3', '#65a30d', '#e11d48',
];

export const SectorFormModal: React.FC<SectorFormModalProps> = ({
  isOpen,
  onClose,
  sectorToEdit,
  onSave,
}) => {
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState(COLORS[0]);
  const [capacidadeTotal, setCapacidadeTotal] = useState(10);

  useEffect(() => {
    if (sectorToEdit) {
      setNome(sectorToEdit.nome);
      setSigla(sectorToEdit.sigla);
      setDescricao(sectorToEdit.descricao);
      setCor(sectorToEdit.cor);
      setCapacidadeTotal(sectorToEdit.capacidadeTotal);
    } else {
      setNome('');
      setSigla('');
      setDescricao('');
      setCor(COLORS[0]);
      setCapacidadeTotal(10);
    }
  }, [sectorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !sigla.trim()) return;
    onSave({
      id: sectorToEdit?.id || `sec-${Date.now()}`,
      nome: nome.trim(),
      sigla: sigla.trim(),
      descricao: descricao.trim(),
      cor,
      capacidadeTotal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between bg-sky-700 text-white px-5 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <h2 className="text-base font-bold">
              {sectorToEdit ? 'Editar Setor' : 'Novo Setor'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Nome do Setor *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              placeholder="Ex: UTI Geral Adulto"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Sigla *
              </label>
              <input
                type="text"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                placeholder="Ex: UTI-A"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Capacidade Total
              </label>
              <input
                type="number"
                value={capacidadeTotal}
                onChange={(e) => setCapacidadeTotal(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
              placeholder="Descrição do setor..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Cor de Identificação
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    cor === c ? 'border-slate-800 scale-110 ring-2 ring-offset-1 ring-slate-400' : 'border-slate-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {sectorToEdit ? 'Salvar Alterações' : 'Criar Setor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
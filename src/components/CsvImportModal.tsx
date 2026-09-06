import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Download, CheckCircle2, AlertCircle } from 'lucide-react';

type ImportType = 'setores' | 'leitos' | 'pacientes';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (type: ImportType, data: any[]) => void;
}

const IMPORT_OPTIONS: { type: ImportType; label: string; description: string; template: string }[] = [
  {
    type: 'setores',
    label: 'Setores',
    description: 'Importar setores do hospital (id, nome, sigla, descricao, cor, capacidadeTotal)',
    template: '/templates/setores.csv',
  },
  {
    type: 'leitos',
    label: 'Leitos / Enfermarias',
    description: 'Importar leitos/enfermarias (id, numero, setorId, status, motivoBloqueio)',
    template: '/templates/leitos.csv',
  },
  {
    type: 'pacientes',
    label: 'Pacientes',
    description: 'Importar pacientes internados com todos os dados clínicos',
    template: '/templates/pacientes.csv',
  },
];

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [selectedType, setSelectedType] = useState<ImportType>('setores');
  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!csvText.trim()) {
      setImportResult({ success: false, message: 'Nenhum arquivo CSV selecionado.' });
      return;
    }

    try {
      const { parseCSV } = require('../utils/csvImport');
      const rows = parseCSV(csvText);
      if (rows.length < 2) {
        setImportResult({ success: false, message: 'O arquivo CSV está vazio ou não contém dados.' });
        return;
      }
      const headers = rows[0];
      const dataRows = rows.slice(1).map((row: string[]) => {
        const obj: Record<string, string> = {};
        headers.forEach((h: string, i: number) => (obj[h.toLowerCase().replace(/\s/g, '_')] = row[i] || ''));
        return obj;
      });

      onImport(selectedType, dataRows);
      setImportResult({ success: true, message: `${dataRows.length} registro(s) importado(s) com sucesso!` });
    } catch (err) {
      setImportResult({ success: false, message: 'Erro ao processar o arquivo CSV.' });
    }
  };

  const handleDownloadTemplate = (template: string) => {
    const link = document.createElement('a');
    link.href = template;
    link.download = template.split('/').pop() || 'template.csv';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between bg-emerald-700 text-white px-5 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            <h2 className="text-base font-bold">Importar dados via CSV</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Tipo de dados
            </label>
            <div className="grid grid-cols-3 gap-2">
              {IMPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    setSelectedType(opt.type);
                    setCsvText('');
                    setImportResult(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    selectedType === opt.type
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {IMPORT_OPTIONS.find((o) => o.type === selectedType)?.description}
            </p>
          </div>

          {/* Download template */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleDownloadTemplate(IMPORT_OPTIONS.find((o) => o.type === selectedType)!.template)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar modelo CSV
            </button>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Selecione o arquivo CSV
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              <Upload className="w-5 h-5" />
              {csvText ? 'Arquivo selecionado' : 'Clique para selecionar arquivo .csv'}
            </button>
          </div>

          {/* Preview */}
          {csvText && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-32 overflow-auto">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Pré-visualização:</p>
              <pre className="text-[10px] text-slate-600 whitespace-pre-wrap font-mono">
                {csvText.slice(0, 500)}{csvText.length > 500 ? '\n...' : ''}
              </pre>
            </div>
          )}

          {/* Result */}
          {importResult && (
            <div
              className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                importResult.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {importResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              {importResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleImport}
              disabled={!csvText}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
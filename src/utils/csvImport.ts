import { Bed, Patient, Sector } from '../types';
import { calculateAge } from './dateUtils';

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter((line) => line.trim() !== '');
  return lines.map((line) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

export function importSectorsFromCSV(csvText: string): Sector[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s/g, '_'));
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = row[i] || ''));
    return {
      id: obj.id || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nome: obj.nome || '',
      sigla: obj.sigla || '',
      descricao: obj.descricao || '',
      cor: obj.cor || '#0284c7',
      capacidadeTotal: parseInt(obj.capacitatetotal || '10', 10) || 10,
    };
  });
}

export function importBedsFromCSV(csvText: string): Bed[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s/g, '_'));
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = row[i] || ''));
    const status = (obj.status || 'DESOCUPADO').toUpperCase();
    return {
      id: obj.id || `bed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      numero: obj.numero || '',
      setorId: obj.setorid || '',
      status: (['OCUPADO', 'DESOCUPADO', 'BLOQUEADO', 'HIGIENIZACAO'].includes(status)
        ? status
        : 'DESOCUPADO') as Bed['status'],
      motivoBloqueio: obj.motivobloqueio || undefined,
    };
  });
}

export function importPatientsFromCSV(csvText: string): Patient[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s/g, '_'));
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = row[i] || ''));
    return {
      id: obj.id || `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      leitoId: obj.leitoid || '',
      setorId: obj.setorid || '',
      nome: obj.nome || '',
      prontuario: obj.prontuario || '',
      dataNascimento: obj.datanascimento || undefined,
      idade: obj.datanascimento ? calculateAge(obj.datanascimento) : (parseInt(obj.idade || '0', 10) || 0),
      dataInternacao: obj.datanacao || obj.datainternacao || new Date().toISOString().split('T')[0],
      classificacao: (obj.classificacao as Patient['classificacao']) || 'Cuidados Mínimos',
      traqueostomia: obj.traqueostomia === 'true',
      tipoIsolamento: (obj.tipoisolamento as any) || 'Padrão',
      alergia: obj.alergia || 'Nenhuma conhecida',
      estadoMental: (obj.estadomental as Patient['estadoMental']) || 'Lúcido e Orientado',
      oxigenacao: (obj.oxigenacao as Patient['oxigenacao']) || 'Ar Ambiente',
      sinaisVitais: (obj.sinaisvitais as Patient['sinaisVitais']) || '4 em 4 horas',
      mobilidade: (obj.mobilidade as Patient['mobilidade']) || 'Ativa no leito',
      deambulacao: (obj.deambulacao as Patient['deambulacao']) || 'Deambula sem auxílio',
      alimentacao: (obj.alimentacao as Patient['alimentacao']) || 'Oral livre',
      curativo: (obj.curativo as Patient['curativo']) || 'sem curativo',
      comprometimentoTecidual: (obj.comprometimentotecidual as Patient['comprometimentoTecidual']) || 'Pele íntegra',
      pontuacao: parseInt(obj.pontuacao || '0', 10) || 0,
      diagnostico: obj.diagnostico || undefined,
      observacoes: obj.observacoes || undefined,
    };
  });
}
/**
 * Google Apps Script - Backend API para o Sistema de Enfermagem HMWG
 *
 * INSTRUÇÕES:
 * 1. Crie uma nova planilha no Google Sheets
 * 2. Vá em Extensões > Apps Script
 * 3. Cole este código no editor
 * 4. Clique em "Implantar" > "Nova implantação"
 * 5. Selecione "Aplicativo da Web"
 * 6. Execute como: "Eu"
 * 7. Quem tem acesso: "Qualquer pessoa"
 * 8. Copie a URL gerada e use no .env do frontend
 *
 * A planilha terá as seguintes abas:
 * - setores
 * - leitos
 * - pacientes
 * - enfermeiros
 * - tecnicos
 * - funcionarios
 * - plantoes
 * - vagas
 */

// Configuração das abas
const SHEETS = {
  setores: 'setores',
  leitos: 'leitos',
  pacientes: 'pacientes',
  enfermeiros: 'enfermeiros',
  tecnicos: 'tecnicos',
  funcionarios: 'funcionarios',
  plantoes: 'plantoes',
  vagas: 'vagas',
  usuarios_sistema: 'usuarios_sistema',
  usuarios_acesso: 'usuarios_sistema',
};

// Headers esperados para cada aba
const HEADERS = {
  setores: ['id', 'nome', 'sigla', 'descricao', 'cor', 'capacidadeTotal'],
  leitos: ['id', 'numero', 'setorId', 'status', 'motivoBloqueio'],
  pacientes: [
    'id', 'leitoId', 'setorId', 'nome', 'prontuario', 'dataNascimento', 'idade', 'dataInternacao',
    'classificacao', 'traqueostomia', 'tipoIsolamento', 'alergia', 'estadoMental',
    'oxigenacao', 'sinaisVitais', 'mobilidade', 'deambulacao', 'alimentacao',
    'curativo', 'comprometimentoTecidual', 'pontuacao', 'diagnostico', 'observacoes',
  ],
  enfermeiros: ['id', 'nome', 'coren', 'cargo', 'email', 'senha', 'turno', 'telefone'],
  tecnicos: ['id', 'nome', 'coren', 'turno', 'presenteNoPlantao', 'setorId', 'observacao'],
  funcionarios: [
    'id', 'matricula', 'nome', 'cpf', 'categoria', 'cargo', 'conselhoTipo',
    'conselhoNumero', 'email', 'telefone', 'setorPadraoId', 'regimeContratual',
    'turnoPadrao', 'status', 'dataAdmissao', 'fotoUrl', 'observacoes', 'senha',
  ],
  plantoes: ['id', 'data', 'turno', 'setorId', 'enfermeirosResponsaveisIds', 'enfermeiroLeitosMap', 'observacoesPlantao'],
  vagas: [
    'id', 'pacienteNome', 'prontuario', 'dataNascimento', 'idade', 'setorOrigem', 'setorDestinoId',
    'leitoDesejadoId', 'prioridade', 'diagnostico', 'justificativaClinica',
    'dataSolicitacao', 'status', 'solicitanteNome',
  ],
  usuarios_sistema: [
    'id', 'nome', 'login', 'email', 'senha', 'nivelAcesso', 'cargo',
    'setorPermitidoIds', 'ativo', 'criadoEm', 'ultimoAcesso', 'bloqueadoAte',
  ],
};

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doPut(e) {
  return handleRequest(e, 'PUT');
}

function doDelete(e) {
  return handleRequest(e, 'DELETE');
}

function handleRequest(e, method) {
  if (!e) e = {parameter:{}};
  const action = e.parameter?.action;
  const sheetName = e.parameter?.sheet;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    let result;

    switch (action) {
      case 'getAll':
        result = getAll(sheetName);
        break;
      case 'getById':
        result = getById(sheetName, e.parameter.id);
        break;
      case 'save':
        const postData = (method === 'POST' || method === 'PUT') ? JSON.parse(e.postData?.contents || '{}') : {};
        result = save(sheetName, postData);
        break;
      case 'saveAll':
        const allData = (method === 'POST' || method === 'PUT') ? JSON.parse(e.postData?.contents || '{}') : {};
        result = saveAll(sheetName, allData.data);
        break;
      case 'delete':
        result = deleteRecord(sheetName, e.parameter.id);
        break;
      case 'init':
        result = initSheets();
        break;
      default:
        result = { error: 'Ação não especificada' };
    }

    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Inicializar abas da planilha
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SHEETS).forEach((key) => {
    let sheet = ss.getSheetByName(SHEETS[key]);
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS[key]);
    }

    // Verificar se tem headers
    const headers = HEADERS[key];
    if (headers) {
      const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      if (firstRow.every((h) => !h)) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.setFrozenRows(1);
      }
    }
  });

  return { success: true, message: 'Abas inicializadas com sucesso' };
}

// Buscar todos os registros de uma aba
function getAll(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS[sheetName]);

  if (!sheet) {
    return { error: `Aba "${sheetName}" não encontrada` };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { data: [] };

  const headers = data[0];
  const records = data.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });

  return { data: records };
}

// Buscar registro por ID
function getById(sheetName, id) {
  const result = getAll(sheetName);
  if (result.error) return result;

  const record = result.data.find((r) => String(r.id).trim() === String(id).trim());
  return record ? { data: record } : { error: 'Registro não encontrado' };
}

// Salvar registro (criar ou atualizar)
function save(sheetName, record) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS[sheetName]);

  if (!sheet) {
    return { error: `Aba "${sheetName}" não encontrada` };
  }

  const headers = HEADERS[sheetName];
  if (!headers) {
    return { error: `Headers não definidos para "${sheetName}"` };
  }

  // Buscar dados existentes
  const data = sheet.getDataRange().getValues();
  const existingHeaders = data[0] || [];
  const existingRows = data.slice(1);

  // Encontrar índice do registro existente
  const idIndex = existingHeaders.indexOf('id');
  const rowIndex = idIndex >= 0
    ? existingRows.findIndex((row) => String(row[idIndex]).trim() === String(record.id).trim())
    : -1;

  // Preparar nova linha
  const newRow = headers.map((header) => {
    const value = record[header];
    if (value === undefined || value === null) return '';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  });

  if (rowIndex >= 0) {
    // Atualizar linha existente
    sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([newRow]);
  } else {
    // Adicionar nova linha
    sheet.appendRow(newRow);
  }

  return { success: true, data: record };
}

// Salvar todos os registros (substituir)
function saveAll(sheetName, records) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS[sheetName]);

  if (!sheet) {
    return { error: `Aba "${sheetName}" não encontrada` };
  }

  const headers = HEADERS[sheetName];
  if (!headers) {
    return { error: `Headers não definidos para "${sheetName}"` };
  }

  // Limpar dados existentes (manter header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clear();
  }

  // Adicionar novos registros
  if (records && records.length > 0) {
    const rows = records.map((record) => {
      return headers.map((header) => {
        const value = record[header];
        if (value === undefined || value === null) return '';
        if (typeof value === 'boolean') return value.toString();
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
      });
    });

    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  return { success: true, count: records?.length || 0 };
}

// Deletar registro
function deleteRecord(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS[sheetName]);

  if (!sheet) {
    return { error: `Aba "${sheetName}" não encontrada` };
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  const rowIndex = data.findIndex((row, i) => i > 0 && idIndex >= 0 && String(row[idIndex]).trim() === String(id).trim());

  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return { success: true };
  }

  return { error: 'Registro não encontrado' };
}

// Função para configurar a planilha inicial
function setupInitialData() {
  initSheets();

  // Dados iniciais de setores
  const initialSectors = [
    { id: 'sec-uti', nome: 'UTI Geral Adulto', sigla: 'UTI-A', descricao: 'Unidade de Terapia Intensiva', cor: '#0284c7', capacidadeTotal: 10 },
    { id: 'sec-ps', nome: 'Pronto-Socorro / Politrauma', sigla: 'PS-POLI', descricao: 'Atendimento de emergência', cor: '#dc2626', capacidadeTotal: 12 },
    { id: 'sec-clinica-medica', nome: 'Clínica Médica (Enfermaria)', sigla: 'CLIN-MED', descricao: 'Enfermaria clínica', cor: '#059669', capacidadeTotal: 10 },
    { id: 'sec-clinica-cirurgica', nome: 'Clínica Cirúrgica / Ortopedia', sigla: 'CLIN-CIR', descricao: 'Pós-operatório', cor: '#7c3aed', capacidadeTotal: 8 },
  ];

  saveAll('setores', initialSectors);

  return { success: true, message: 'Dados iniciais configurados' };
}
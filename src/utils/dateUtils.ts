/**
 * Utilitários para manipulação de datas e cálculo de idade
 */

/**
 * Calcula a idade em anos completos a partir de uma data de nascimento (formato YYYY-MM-DD)
 */
export function calculateAge(birthDateStr?: string): number {
  if (!birthDateStr) return 0;

  const parts = birthDateStr.split('-');
  if (parts.length !== 3) return 0;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return 0;

  const birthDate = new Date(year, month, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Formata data no formato YYYY-MM-DD para DD/MM/AAAA
 */
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

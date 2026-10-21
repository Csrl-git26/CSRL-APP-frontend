export function formatOneDecimal(value) {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1) : String(value);
}

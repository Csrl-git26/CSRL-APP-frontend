import * as XLSX from 'xlsx/xlsx.mjs';
export async function collectTrackingUsers(fetchPage) {
  const first = await fetchPage(1);
  const rows = [...first.rows];
  for (let page = 2; page <= first.pages; page++) {
    const next = await fetchPage(page);
    if (next.total !== first.total) throw new Error('Login data changed during export. Please try again.');
    rows.push(...next.rows);
  }
  if (rows.length !== first.total || new Set(rows.map(row => row.userId)).size !== rows.length) {
    throw new Error('Login data changed during export. Please try again.');
  }
  return rows;
}
export function trackingWorkbook(rows, from, to) {
  const sheet = XLSX.utils.aoa_to_sheet([
    ['User', 'Login type', 'Centre / Office', 'Number of logins', 'Total active time'],
    ...rows.map(row => [
      `${row.name || row.userId}\n${row.userId}`,
      (row.roles || []).map(role => role === 'admin' ? 'CSRL Management' : 'Centre').join(', '),
      (row.centres || []).join(', '), row.loginCount,
      Math.floor((row.activeMs || 0) / 1000) / 86400,
    ]),
  ]);
  for (let i = 0; i < rows.length; i++) sheet[`E${i + 2}`].z = '[h]"h "mm"m "ss"s"';
  sheet['!cols'] = [{ wch: 45 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 22 }];
  sheet['!autofilter'] = { ref: sheet['!ref'] };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Portal Login Tracking');
  const period = XLSX.utils.aoa_to_sheet([['Selected period', 'IST'], ['From', from.replace('T', ' ')], ['To', to.replace('T', ' ')]]);
  period['!cols'] = [{ wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, period, 'Selected Period');
  return workbook;
}
export function saveTrackingExport(rows, from, to) {
  XLSX.writeFile(trackingWorkbook(rows, from, to), `Portal_Login_Tracking_${from.replace(/:/g, '-')}_to_${to.replace(/:/g, '-')}_IST.xlsx`);
}

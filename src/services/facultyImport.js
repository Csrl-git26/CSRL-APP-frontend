const norm = value => String(value ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
const metric = value => ({ ATTEMPT:'attempted', ATTEMPTED:'attempted', CORRECT:'correct', ACCURACY:'accuracy', 'TOTAL MARKS':'marks', MARKS:'marks', QUALIFICATION:'qualification', 'TEST DATE':'date', 'MAX MARKS':'maxMarks', 'TOTAL QUESTIONS':'totalQuestions', STATUS:'status' }[norm(value)]);
export function parseFacultyRows(grid, year) {
  const hi = grid.findIndex(row => row.some(v => ['TRAINEE NAME','FACULTY NAME'].includes(norm(v))));
  if (hi < 0) throw new Error('Faculty name header not found. Use the provided template or consolidated workbook.');
  const header = grid[hi].map(norm), top = grid[hi - 1] || [];
  const col = (...names) => header.findIndex(v => names.includes(v));
  const groups = new Map(), warnings = [], rows = [];
  const flatTest = col('TEST NAME');
  let lastTest = '';
  header.forEach((h,i) => {
    if (flatTest >= 0) return;
    if (top[i]) lastTest = norm(top[i]);
    const key = metric(h);
    if (!key || !lastTest || !/\d/.test(lastTest)) return;
    if (!groups.has(lastTest)) groups.set(lastTest, {});
    const g = groups.get(lastTest);
    if (g[key] !== undefined) throw new Error(`Duplicate ${lastTest} ${h} column.`);
    g[key] = i;
  });
  if (header.includes('CORR')) warnings.push('Supplementary CORR columns were not imported; the CORRECT field in each test group is used.');
  for (let ri = hi + 1; ri < grid.length; ri++) {
    const raw = grid[ri], get = (...names) => { const i = col(...names); return i < 0 ? '' : raw[i]; };
    const name = String(get('TRAINEE NAME','FACULTY NAME') || '').trim();
    if (!name) continue;
    const email = String(get('EMAIL ID','EMAIL') || '').trim().toLowerCase();
    const subject = norm(get('SUBJECT'));
    const centres = norm(get('PROJECT','CENTRE','CENTRES'));
    const profile = Object.fromEntries([['facultyId','FACULTY ID'],['serialNumber','SL. NO.'],['contact','CONTACT DETAIL'],['projectManager','PM NAME'],['mentor','MENTOR NAME'],['degree','DEGREE NAME'],['college','COLLEGE NAME'],['passingYear','YEAR OF PASSING'],['joiningDate','DATE OF JOINING CSRL']].map(([key,label]) => [key,String(get(label) ?? '').trim()]));
    const entries = flatTest >= 0 ? [[norm(raw[flatTest]), Object.fromEntries(header.map((h,i) => [metric(h),i]).filter(([k]) => k))]] : [...groups];
    for (const [test,g] of entries) {
      if (!test || !['attempted','correct','marks','qualification','status'].some(key => g[key] !== undefined && raw[g[key]] !== null && raw[g[key]] !== undefined && raw[g[key]] !== '')) continue;
      if (!subject) throw new Error(`Sheet row ${ri + 1}: subject is required for ${name}.`);
      if (!email.includes('@') && !warnings.includes(`${name}: email is missing. Enter it in the preview before confirming.`)) warnings.push(`${name}: email is missing. Enter it in the preview before confirming.`);
      const numeric = key => { const v = raw[g[key]]; if (v === null || v === undefined || v === '') return null; const n = Number(v); if (!Number.isFinite(n)) throw new Error(`Row ${ri + 1}, ${test}: invalid ${key}.`); return n; };
      const attemptText = norm(raw[g.attempted]);
      const qualificationText = norm(raw[g.qualification]);
      const status = ['ABSENT','MEDICAL LEAVE','LEAVE'].includes(attemptText) ? attemptText : (['ABSENT','MEDICAL LEAVE','LEAVE'].includes(qualificationText) ? qualificationText : norm(g.status === undefined ? get('STATUS') : raw[g.status]));
      const isLeave = ['ABSENT','MEDICAL LEAVE','LEAVE'].includes(status);
      const attempted = isLeave ? null : numeric('attempted'), correct = isLeave ? null : numeric('correct'), marks = numeric('marks');
      const accuracyRaw = raw[g.accuracy];
      if (accuracyRaw !== null && accuracyRaw !== undefined && accuracyRaw !== '' && attempted > 0 && correct !== null) {
        const supplied = Number(String(accuracyRaw).replace('%','')) * (String(accuracyRaw).includes('%') || Number(accuracyRaw) > 1 ? 1 : 100);
        if (!Number.isFinite(supplied) || Math.abs(supplied - correct / attempted * 100) > 1) warnings.push(`${name} / ${test}: accuracy differs; calculated from correct ÷ attempted.`);
      }
      const optional = (label,key) => { const v = g[key] === undefined ? get(label) : raw[g[key]]; return v === '' || v === null || v === undefined ? null : Number(v); };
      rows.push({...profile,year, name,email,subject,centres,test,attempted,correct,marks,qualification:isLeave ? '' : qualificationText,status:status || (marks !== null ? 'APPEARED' : 'MISSING'),date:String((g.date === undefined ? get('TEST DATE') : raw[g.date]) || '').trim(),maxMarks:optional('MAX MARKS','maxMarks'),totalQuestions:optional('TOTAL QUESTIONS','totalQuestions')});
    }
  }
  if (!rows.length) throw new Error('No populated faculty test results found.');
  return {rows,warnings};
}

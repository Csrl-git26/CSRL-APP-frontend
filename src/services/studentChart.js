// Keep stream filtering and score normalization identical for fetched and fallback rows.
export function normalizeStudentChartRows(rawRows, stream) {
    const toNum = (v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return (rawRows || []).filter(row => {
      const isNeet = /^(MMT|NCT|NMT|NEET)/i.test(String(row.name || '').trim());
      return stream === 'NEET' ? isNeet : !isNeet;
    }).map((row) => {
      const normalized = { ...row };

      if (stream === 'NEET') {
        const physics = toNum(normalized.Physics);
        const chemistry = toNum(normalized.Chemistry);
        const biology = toNum(normalized.Biology);
        const botany = toNum(normalized.Botany);
        const zoology = toNum(normalized.Zoology);


        const bioParts = botany !== null || zoology !== null ? [botany, zoology] : [biology];
        const parts = [physics, chemistry, ...bioParts].filter((v) => v !== null);
        const computedTotal = parts.length > 0 ? parts.reduce((s, v) => s + v, 0) : null;
        
        // Handle Absent explicitly
        const isAbsent = ['a', 'A', 'absent', 'Absent'].includes(String(row.Total).trim()) ||
          (['a', 'A', 'absent', 'Absent'].includes(String(row.Physics).trim()) &&
           ['a', 'A', 'absent', 'Absent'].includes(String(row.Chemistry).trim()) &&
           (['a', 'A', 'absent', 'Absent'].includes(String(row.Botany).trim()) || ['a', 'A', 'absent', 'Absent'].includes(String(row.Zoology).trim())));
        
        if (isAbsent) {
          normalized.Total = 'Absent';
        } else {
          normalized.Total = computedTotal !== null ? computedTotal : (row.Total ?? null);
        }
      } else {
        const physics = toNum(normalized.Physics);
        const chemistry = toNum(normalized.Chemistry);
        const math = toNum(normalized.Math);
        const parts = [physics, chemistry, math].filter((v) => v !== null);
        const computedTotal = parts.length > 0 ? parts.reduce((s, v) => s + v, 0) : null;
        
        // Handle Absent explicitly
        const isAbsent = ['a', 'A', 'absent', 'Absent'].includes(String(row.Total).trim()) ||
          (['a', 'A', 'absent', 'Absent'].includes(String(row.Physics).trim()) &&
           ['a', 'A', 'absent', 'Absent'].includes(String(row.Chemistry).trim()) &&
           ['a', 'A', 'absent', 'Absent'].includes(String(row.Math).trim()));
        
        if (isAbsent) {
          normalized.Total = 'Absent';
        } else {
          normalized.Total = computedTotal !== null ? computedTotal : (row.Total ?? null);
        }
      }

      return normalized;
    });
}

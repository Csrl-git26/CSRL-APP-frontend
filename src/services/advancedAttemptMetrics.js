// Prevent local/score-sheet fallback from presenting inferred Advanced attempts.
export function clearAdvancedFallback(rows, stream, branch) {
  if (stream !== 'JEE' || branch !== 'ADVANCED') return rows;
  return rows.map(row => {
    const result={...row};
    for(const key of Object.keys(result)) if(/_(Attempted|Accuracy|Correct|Wrong)$/.test(key))result[key]=null;
    for(const subject of ['Physics','Chemistry','Math','Mathematics','Total']) for(const metric of ['Attempted','Accuracy','Correct','Wrong'])result[`${subject}_${metric}`]=null;
    return result;
  });
}

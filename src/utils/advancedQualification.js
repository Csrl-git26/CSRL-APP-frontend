// Portal-specific JEE Advanced thresholds supplied by CSRL.
export function advancedCutoff(category, maxTotal = 300, maxSubject = 100) {
  const cat = String(category || '').trim().toUpperCase();
  const tokens = cat.split(/[^A-Z]+/);
  const reserved = ['PWD','PWBD','SC','ST'].some(code => tokens.includes(code));
  const totalPercent = reserved ? 20 : ['EWS','OBC'].some(code => tokens.includes(code)) ? 33 : 36;
  const subjectPercent = reserved ? 7 : 12;
  return { totalPercent, subjectPercent, overallMin: maxTotal * totalPercent / 100, subjectMin: maxSubject * subjectPercent / 100 };
}
export function qualifiesAdvanced(total, scores, category, maxTotal = 300, maxSubject = 100) {
  const { overallMin, subjectMin } = advancedCutoff(category, maxTotal, maxSubject);
  const numeric = value => value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value));
  return numeric(total) && Number(total) >= overallMin && ['Physics','Chemistry','Math'].every(subject => {
    const value = subject === 'Math' ? (scores.Math ?? scores.Mathematics ?? scores.Maths) : scores[subject];
    return numeric(value) && Number(value) >= subjectMin;
  });
}

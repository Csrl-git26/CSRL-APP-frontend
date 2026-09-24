// Updated synchronously before React mounts the next dashboard.
let selection = { stream: 'JEE', branch: 'MAIN' };
export const getExamScope = () => ({ ...selection });
export function setExamScope(value) { selection = { ...value }; }
export function withTestBranch(url) {
  // NEET has no branch. MAIN here only excludes Advanced JEE data from mixed reads.
  const branch = selection.stream === 'JEE' ? selection.branch : 'MAIN';
  const parsed = new URL(url, 'http://localhost');
  parsed.searchParams.set('branch', branch);
  return /^https?:/.test(url) ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
}
export function uploadExamScope() {
  return { stream: selection.stream, ...(selection.stream === 'JEE' ? { branch: selection.branch } : {}) };
}

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../src/components/CentreDashboard.jsx', import.meta.url), 'utf8');
const start = source.indexOf('  const leaderboardRequestKey =');
const end = source.indexOf('  const filteredStudents =', start);
assert.ok(start >= 0);
const code = source.slice(start, end);
let effects = [], requests = [], board, trend, error;
const pending = [];
const context = {
  activeLeaderboardKeys: [], selectedSubject: 'Total', globalStream: 'JEE',
  centersList: [{code:'KNP',streams:['JEE']},{code:'JKM',streams:['NEET']}], centreBoard: [], selectedTrendCentre: '',
  useMemo: fn => fn(), useEffect: (fn,deps) => effects.push({fn,deps}),
  setCentreBoard: x => board=x, setCentreBoardLoading(){}, setCentreBoardError: x=>error=x,
  setSelectedTrendCentre: x=>trend=x,
  fetchCentreLeaderboard: (token,key,stream) => { requests.push({key,stream}); return new Promise((resolve,reject)=>pending.push({resolve,reject})); }
};
function render(keys,stream) {
  context.activeLeaderboardKeys=keys; context.globalStream=stream; effects=[];
  vm.runInNewContext('{'+code+'}',context); return effects;
}
let first=render([],'JEE');first[0].fn();first[1].fn();
assert.equal(requests.length,0);assert.equal(trend,'KNP');
let loaded=render(['MT01'],'JEE');
assert.notDeepEqual(Array.from(first[0].deps),Array.from(loaded[0].deps),'late-arriving test list must rerun request');
const cancel=loaded[0].fn();
assert.deepEqual(requests[0],{key:'MT01',stream:'JEE'});
cancel();
let neet=render(['NCT01'],'NEET');neet[0].fn();neet[1].fn();assert.equal(trend,'JKM');
pending[1].resolve([{code:'JKM'}]);await new Promise(r=>setImmediate(r));
pending[0].resolve([{code:'KNP'}]);await new Promise(r=>setImmediate(r));
assert.equal(board[0].code,'JKM','late JEE response must not replace NEET results');
const fail=render(['MMT01'],'NEET');fail[0].fn();pending[2].reject(Error('Request failed'));await new Promise(r=>setImmediate(r));
assert.equal(error,'Request failed');
console.log('PASS: async tests trigger rankings; stream change ignores stale results; trend centre available without rankings; errors surfaced');

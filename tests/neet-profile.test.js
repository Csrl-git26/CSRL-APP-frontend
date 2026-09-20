import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Supply Vite's build-time environment for the Node test runner.
const serviceSource = readFileSync(new URL('../src/services/dataService.js', import.meta.url), 'utf8').replaceAll('import.meta.env', '({ PROD: false })');
const { buildStudentChartData } = await import(`data:text/javascript;base64,${Buffer.from(serviceSource).toString('base64')}`);
import { normalizeStudentChartRows } from '../src/services/studentChart.js';

test('profile stream overrides stale marks stream and excludes JEE tests', () => {
  const marks = { stream: 'JEE', MT01_Physics: 90, MMT01_Physics: 100, MMT02_Botany: 140, NCT01_Zoology: 150 };
  const columns = Object.keys(marks).filter(k => k !== 'stream');
  assert.deepEqual(new Set(buildStudentChartData(marks, columns, 'NEET').map(r => r.name)), new Set(['MMT01', 'MMT02', 'NCT01']));
  assert.deepEqual(buildStudentChartData(marks, columns, 'JEE').map(r => r.name), ['MT01']);
});

test('NEET rows retain both biology subjects without counting Biology twice', () => {
  const rows = normalizeStudentChartRows([{ name: 'MMT01', Physics: 100, Chemistry: 110, Botany: 140, Zoology: 150, Biology: 290, Botany_Accuracy: 80 }, { name: 'MT01', Physics: 50 }], 'NEET');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Total, 500);
  assert.equal(rows[0].Botany, 140);
  assert.equal(rows[0].Zoology, 150);
  assert.equal(rows[0].Botany_Accuracy, 80);
});

test('missing data stays missing, zero remains zero, and absence stays absent', () => {
  const rows = normalizeStudentChartRows([{ name: 'MMT01', Physics: null }, { name: 'MMT02', Physics: 0, Chemistry: 0, Botany: 0, Zoology: 0 }, { name: 'NCT01', Total: 'Absent' }], 'NEET');
  assert.equal(rows[0].Total, null);
  assert.equal(rows[1].Total, 0);
  assert.equal(rows[2].Total, 'Absent');
});

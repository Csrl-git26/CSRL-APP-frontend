import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { transformSync } from 'esbuild';

// Execute the component's real initial render; effects are registered but not run.
// This catches render-time initialization errors that a production build misses.
const source = readFileSync(new URL('../src/components/CentreDashboard.jsx', import.meta.url), 'utf8');
const withoutImports = source.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?/gm, '').replace('export default function', 'function');
const code = transformSync(withoutImports, { loader: 'jsx', target: 'esnext' }).code;
for (const props of [{}, { adminViewCenterCode: 'TEST', adminStream: 'NEET' }]) {
  const context = new Proxy({
    props,
    useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect: () => {},
    useMemo: fn => fn(),
    useOutletContext: () => ({ activePage: 'leaderboard', setActivePage() {} }),
    useAuth: () => ({ user: { centerCode: 'TEST' } }),
    React: { createElement: () => ({ rendered: true }) },
    getStreamConfig: () => ({ subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'] }),
  }, { has: () => true, get: (target, key) => key in target ? target[key] : globalThis[key] || (() => null) });
  assert.doesNotThrow(() => vm.runInNewContext(code + '\nCentreDashboard(props);', context));
}
console.log('PASS: centre login and embedded NEET centre initial renders');

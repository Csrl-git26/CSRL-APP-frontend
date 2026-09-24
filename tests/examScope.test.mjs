import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const directory = await mkdtemp(join(tmpdir(), 'csrl-branch-check-'));
const outfile = join(directory, 'scope.mjs');
await build({ stdin: { contents: `
  export { getExamScope, setExamScope, withTestBranch, uploadExamScope } from './src/services/examScope';
  export { fetchGlobalData, bulkUpsertTestScoresApi } from './src/services/dataService';
  export { getStudentOverallWeakTopics } from './src/services/weakTopicApi';
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import { ExamScopeProvider } from './src/context/ExamScopeContext';
  import { BranchSelector, UploadScopeSelectors } from './src/components/ExamScopeSelectors';
  export const renderBranch = stream => renderToStaticMarkup(<ExamScopeProvider><BranchSelector stream={stream}/></ExamScopeProvider>);
  export const renderUpload = (stream, branch) => renderToStaticMarkup(<UploadScopeSelectors stream={stream} branch={branch} onStreamChange={()=>{}} onBranchChange={()=>{}}/>);
`, resolveDir: process.cwd(), loader: 'jsx' }, outfile, banner:{js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"}, bundle:true, platform:'node', format:'esm', jsx:'automatic', define:{'import.meta.env.PROD':'true','import.meta.env.VITE_API_BASE_URL':'""'} });
const scope = await import(pathToFileURL(outfile));
globalThis.localStorage = {getItem:()=>null};
const requests = [];
globalThis.fetch = async (url, options) => {
  requests.push({url,options});
  return {ok:true,json:async()=>({url})};
};

test('JEE shows Main and Advanced; NEET has no branch control', () => {
  scope.setExamScope({stream:'JEE',branch:'MAIN'});
  const main = scope.renderBranch('JEE');
  assert.match(main,/value="MAIN" selected/);
  assert.match(main,/>Advanced</);
  assert.equal(scope.renderBranch('NEET'),'');
  assert.match(scope.renderUpload('JEE','ADVANCED'),/value="ADVANCED" selected/);
  assert.doesNotMatch(scope.renderUpload('NEET','MAIN'),/Upload branch/);
});

test('Main/Advanced data and topic caches remain independent when switching', async () => {
  requests.length=0;
  for (const branch of ['MAIN','ADVANCED','MAIN']) {
    scope.setExamScope({stream:'JEE',branch});
    assert.match((await scope.fetchGlobalData()).url,new RegExp(`branch=${branch}`));
    assert.match((await scope.getStudentOverallWeakTopics('sample','JEE')).url,new RegExp(`branch=${branch}`));
  }
  assert.equal(requests.length,4,'switching back reuses only the correct branch cache');
});

test('explicit upload selection overrides the dashboard; NEET upload omits branch', async () => {
  scope.setExamScope({stream:'JEE',branch:'MAIN'});
  await scope.bulkUpsertTestScoresApi(null,[{rollKey:'sample',scores:{CAT01:150}}],{stream:'JEE',branch:'ADVANCED'});
  assert.deepEqual(JSON.parse(requests.at(-1).options.body).branch,'ADVANCED');
  scope.setExamScope({stream:'NEET',branch:'ADVANCED'});
  assert.deepEqual(scope.uploadExamScope(),{stream:'NEET'});
  assert.match(scope.withTestBranch('/api/data/global'),/branch=MAIN/);
});

test.after(async()=>{await rm(directory,{recursive:true,force:true});});

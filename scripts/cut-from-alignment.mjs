#!/usr/bin/env node
// Corta los MP3 a partir de la alineación de align-recording.py y actualiza el catálogo.
//   node scripts/cut-from-alignment.mjs grabacion.wav alineacion.json [--skip 28-40,55]
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'audio');
const [input, alignFile] = process.argv.slice(2);
const skipArg = process.argv.includes('--skip') ? process.argv[process.argv.indexOf('--skip') + 1] : '';
const skip = new Set();
for (const part of skipArg.split(',').filter(Boolean)) {
  const [a, b] = part.split('-').map(Number);
  for (let i = a; i <= (b || a); i++) skip.add(i);
}

async function loadTs(entry) {
  const outfile = join(tmpdir(), `alefbet-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  await build({ entryPoints: [join(ROOT, entry)], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error' });
  const mod = await import(pathToFileURL(outfile).href);
  unlinkSync(outfile);
  return mod;
}
const { clipId } = await loadTs('src/lib/clipId.ts');
const { allPhrases } = await loadTs('src/audio/phrases.ts');

const rows = JSON.parse(readFileSync(alignFile, 'utf8'));
let n = 0;
for (const r of rows) {
  if (skip.has(r.i)) continue;
  const start = Math.max(0, r.start - 0.06);
  const end = r.end + 0.1;
  const res = spawnSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', input,
    '-af', `atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse`,
    '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', join(OUT, `${clipId(r.text)}.mp3`),
  ]);
  if (res.status !== 0) console.error('error en', r.i, r.text, res.stderr.toString());
  else n++;
}
const catalog = {};
for (const p of allPhrases()) {
  const id = clipId(p.text);
  if (existsSync(join(OUT, `${id}.mp3`))) catalog[id] = p.text;
}
writeFileSync(join(OUT, 'catalog.json'), JSON.stringify(catalog, null, 1) + '\n');
console.log(`Cortados: ${n}. En catálogo: ${Object.keys(catalog).length}/${allPhrases().length}`);

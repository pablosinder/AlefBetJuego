#!/usr/bin/env node
// Corta una grabación hecha en Google AI Studio en un MP3 por frase.
//
//   node scripts/split-recording.mjs scripts/voice-batches/1-letras.txt grabacion.wav
//
// La grabación debe tener las frases del archivo de la tanda en el mismo orden,
// separadas por pausas. Si la cantidad de cortes no coincide, no escribe nada.
import { build } from 'esbuild';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'audio');
const [batchFile, input] = process.argv.slice(2);
if (!batchFile || !input) {
  console.error('uso: node scripts/split-recording.mjs <tanda.txt> <grabacion>');
  process.exit(1);
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

const lines = readFileSync(batchFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const duration = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input]).toString(),
);

// Tramos con sonido entre silencios.
function parse(stderr) {
  const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const segs = [];
  let cursor = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] - cursor > 0.15) segs.push([cursor, starts[i]]);
    cursor = ends[i] ?? duration;
  }
  if (duration - cursor > 0.15) segs.push([cursor, duration]);
  return segs;
}
// Probar varios umbrales hasta que la cantidad de tramos coincida con la tanda.
let found = null;
const tried = [];
outer: for (const minSilence of [0.9, 0.7, 1.2, 0.5, 1.5, 0.45, 0.4, 0.35]) {
  for (const noiseDb of [-40, -35, -45, -30, -50]) {
    const r = spawnSync('ffmpeg', ['-hide_banner', '-i', input, '-af', `silencedetect=noise=${noiseDb}dB:d=${minSilence}`, '-f', 'null', '-']);
    const segs = parse(r.stderr.toString());
    tried.push(`${noiseDb}dB/${minSilence}s → ${segs.length}`);
    if (segs.length === lines.length) {
      found = segs;
      break outer;
    }
  }
}
if (!found) {
  console.error(`No pude encontrar ${lines.length} frases en la grabación (${duration.toFixed(1)} s).`);
  console.error('Intentos: ' + tried.join(', '));
  process.exit(2);
}

for (const [i, [a, b]] of found.entries()) {
  const id = clipId(lines[i]);
  const start = Math.max(0, a - 0.05);
  const len = b - a + 0.12;
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(start), '-t', String(len), '-i', input, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', join(OUT, `${id}.mp3`)]);
  console.log(`${String(i + 1).padStart(2)}  ${(b - a).toFixed(2)} s  ${lines[i]}`);
}

// Actualizar el catálogo con todos los MP3 existentes.
const catalog = {};
for (const p of allPhrases()) {
  const id = clipId(p.text);
  if (existsSync(join(OUT, `${id}.mp3`))) catalog[id] = p.text;
}
writeFileSync(join(OUT, 'catalog.json'), JSON.stringify(catalog, null, 1) + '\n');
console.log(`\nListo: ${found.length} frases. En catálogo: ${Object.keys(catalog).length}/${allPhrases().length}`);

#!/usr/bin/env node
// Arma las tandas de texto para grabar a mano en Google AI Studio (Generate speech).
// Cada tanda: un archivo con una frase por línea, en el mismo orden que espera split-recording.mjs.
import { build } from 'esbuild';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(tmpdir(), `alefbet-batches-${Date.now()}.mjs`);
await build({ entryPoints: [join(ROOT, 'src/audio/phrases.ts')], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error' });
const { allPhrases } = await import(pathToFileURL(outfile).href);
unlinkSync(outfile);

const phrases = allPhrases();
const groups = [
  ['1-letras', phrases.filter((p) => p.kind === 'letter')],
  ['2-frases', phrases.filter((p) => p.kind === 'sentence' || p.kind === 'sound')],
];
const words = phrases.filter((p) => p.kind === 'word');
const SIZE = Math.ceil(words.length / 3);
for (let i = 0; i < words.length; i += SIZE) groups.push([`${3 + i / SIZE}-palabras`, words.slice(i, i + SIZE)]);

const dir = join(ROOT, 'scripts', 'voice-batches');
mkdirSync(dir, { recursive: true });
for (const [name, list] of groups) {
  writeFileSync(join(dir, `${name}.txt`), list.map((p) => p.text).join('\n') + '\n');
  console.log(name, list.length);
}

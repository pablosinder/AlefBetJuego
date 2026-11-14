#!/usr/bin/env node
// Lista las frases del juego que todavía no tienen grabación y las guarda en
// scripts/voice-batches/faltan.txt (una por línea, lista para pegar en AI Studio).
import { build } from 'esbuild';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(tmpdir(), `alefbet-missing-${Date.now()}.mjs`);
await build({
  stdin: {
    contents: "export { allPhrases } from './src/audio/phrases.ts'; export { clipId } from './src/lib/clipId.ts';",
    resolveDir: ROOT,
    loader: 'ts',
  },
  bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error',
});
const { allPhrases, clipId } = await import(pathToFileURL(outfile).href);
unlinkSync(outfile);
const missing = allPhrases().filter((p) => !existsSync(join(ROOT, 'public', 'audio', `${clipId(p.text)}.mp3`))).map((p) => p.text);
writeFileSync(join(ROOT, 'scripts', 'voice-batches', 'faltan.txt'), missing.join('\n') + (missing.length ? '\n' : ''));
console.log(missing.length ? missing.join('\n') : 'No falta ninguna grabación.');
console.error(`\n${missing.length} sin grabar → scripts/voice-batches/faltan.txt`);

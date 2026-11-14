#!/usr/bin/env node
// Graba las voces del juego con la API de Gemini (texto a voz).
//
//   GEMINI_API_KEY=... node scripts/make-voices.mjs            # graba lo que falta
//   GEMINI_API_KEY=... node scripts/make-voices.mjs --all      # vuelve a grabar todo
//   GEMINI_API_KEY=... node scripts/make-voices.mjs --only "אָלֶף"  # vuelve a grabar una frase
//
// Opcional: GEMINI_TTS_MODEL (modelo), GEMINI_VOICE (voz, p. ej. Kore, Leda, Puck).
// Requiere ffmpeg. Escribe public/audio/<id>.mp3 y public/audio/catalog.json.

import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'audio');
const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const VOICE = process.env.GEMINI_VOICE || 'Leda';
// En la nube de Claude Code la clave la agrega el proxy; localmente va en GEMINI_API_KEY.
const KEY = process.env.GEMINI_API_KEY || 'injected-by-proxy';

const args = process.argv.slice(2);
const redoAll = args.includes('--all');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

// Cargar la lista de frases y clipId desde el código TypeScript del juego.
async function loadTs(entry) {
  const outfile = join(tmpdir(), `alefbet-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  await build({ entryPoints: [join(ROOT, entry)], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'error' });
  const mod = await import(pathToFileURL(outfile).href);
  unlinkSync(outfile);
  return mod;
}

const { allPhrases } = await loadTs('src/audio/phrases.ts');
const { clipId } = await loadTs('src/lib/clipId.ts');

const STYLE =
  'You are a warm, cheerful Israeli kindergarten teacher speaking to a 5-year-old girl. ' +
  'Speak native Israeli Hebrew, slowly and very clearly, following the niqqud exactly. ' +
  'Say only the Hebrew text, nothing else.';

function prompt({ text, kind }) {
  switch (kind) {
    case 'letter':
      return `${STYLE}\nSay the name of this Hebrew letter: ${text}`;
    case 'word':
      return `${STYLE}\nSay this Hebrew word: ${text}`;
    case 'sound':
      return `${STYLE}\nSay only this short Hebrew vowel sound, once: ${text}`;
    default:
      return `${STYLE}\nSay: ${text}`;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tts(p) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt(p) }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const part = json.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
      if (!part) throw new Error(`sin audio en la respuesta: ${JSON.stringify(json).slice(0, 300)}`);
      const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType)?.[1] ?? 24000);
      return { pcm: Buffer.from(part.inlineData.data, 'base64'), rate };
    }
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const m = /"retryDelay":\s*"(\d+)s"/.exec(body);
      const wait = m ? Number(m[1]) * 1000 + 500 : 5000 * attempt;
      console.log(`  ${res.status}: esperando ${Math.round(wait / 1000)} s...`);
      await sleep(wait);
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 500)}`);
  }
}

function toMp3({ pcm, rate }, file) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', 'pipe:0',
      // recortar silencios al principio y al final
      '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.08',
      '-codec:a', 'libmp3lame', '-b:a', '64k', file,
    ]);
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg salió con ${code}`))));
    ff.stdin.end(pcm);
  });
}

mkdirSync(OUT, { recursive: true });
const phrases = allPhrases();
let made = 0;
let failed = 0;
for (const [i, p] of phrases.entries()) {
  const id = clipId(p.text);
  const file = join(OUT, `${id}.mp3`);
  const wanted = only ? p.text === only : redoAll || !existsSync(file);
  if (!wanted) continue;
  process.stdout.write(`[${i + 1}/${phrases.length}] ${p.text} ... `);
  try {
    await toMp3(await tts(p), file);
    made++;
    console.log('ok');
  } catch (e) {
    failed++;
    console.log(`ERROR\n  ${e.message}`);
    if (/HTTP 4(00|01|03|04)/.test(e.message)) break; // clave o modelo inválido: no seguir
  }
}

// Catálogo: id -> texto, solo de los archivos que existen. Borra audios que ya no se usan.
const catalog = {};
const valid = new Set();
for (const p of phrases) {
  const id = clipId(p.text);
  valid.add(`${id}.mp3`);
  if (existsSync(join(OUT, `${id}.mp3`))) catalog[id] = p.text;
}
for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !valid.has(f)) unlinkSync(join(OUT, f));
writeFileSync(join(OUT, 'catalog.json'), JSON.stringify(catalog, null, 1) + '\n');
console.log(`\nGrabadas: ${made}, errores: ${failed}, en catálogo: ${Object.keys(catalog).length}/${phrases.length}`);

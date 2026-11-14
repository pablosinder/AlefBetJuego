/** Nombre de archivo estable para una frase (FNV-1a de 32 bits, en hex). */
export function clipId(text: string): string {
  const s = text.normalize('NFC').trim();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

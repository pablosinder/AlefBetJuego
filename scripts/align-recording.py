#!/usr/bin/env python3
"""Alinea una grabación larga (Google AI Studio) con su lista de frases.

    python3 scripts/align-recording.py grabacion.wav scripts/voice-batches/todo.txt alineacion.json

Elige, entre todos los silencios del audio, los cortes cuyos tramos mejor coinciden con
la duración esperada de cada frase (según sílabas y palabras). Funciona aunque haya
pausas internas ("שָׁלוֹם! ...") o pausas más cortas que lo pedido.
Luego: node scripts/cut-from-alignment.mjs grabacion.wav alineacion.json [--skip 28-40]
"""
import re, subprocess, sys, math, json
F, TXT, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
lines = [l.strip() for l in open(TXT, encoding='utf8') if l.strip()]
N = len(lines)
dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',F]))
log = subprocess.run(['ffmpeg','-hide_banner','-i',F,'-af','silencedetect=noise=-42dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
sil = list(zip(st, en + [dur]*(len(st)-len(en))))
# fronteras candidatas: (inicio_silencio, fin_silencio). Agregamos inicio y fin del archivo.
if sil and sil[0][0] < 0.05: lead = sil.pop(0)[1]
else: lead = 0.0
if sil and sil[-1][1] >= dur - 0.05: tail = sil.pop()[0]
else: tail = dur
B = [(None, lead)] + sil + [(tail, None)]   # B[k] = (start, end); segment between B[i].end and B[j].start
M = len(B)

VOW = set('ְֱֲֳִֵֶַָׇֹֺֻ')
def syll(t):
    n = 0
    cs = list(t)
    for i,c in enumerate(cs):
        if c in VOW and c != 'ְ': n += 1
        if c == 'ּ' and i>0 and cs[i-1]=='ו' and (i<2 or cs[i-2] not in VOW): n += 1  # shuruk
    return max(n,1)
S_ = [syll(t) for t in lines]
words = [len(t.split()) for t in lines]
punct = [len(re.findall(r'[!.?,]\s*\S', t)) for t in lines]  # pausas internas posibles

def align(a, b, c):
    INF = 1e18
    # dp[i][k] = mejor costo de asignar las primeras i frases terminando en frontera k
    dp = [[INF]*M for _ in range(N+1)]
    bk = [[-1]*M for _ in range(N+1)]
    dp[0][0] = 0
    # prefijo de silencios largos para costo de saltar fronteras
    for i in range(1, N+1):
        exp = a + b*S_[i-1] + c*(words[i-1]-1)
        allow = punct[i-1] + (1 if words[i-1] > 2 else 0)
        for k in range(1, M):
            best, arg = INF, -1
            skipped = 0.0
            # j = frontera anterior; recorrer hacia atrás
            nskip = 0
            for j in range(k-1, max(-1, k-12), -1):
                if dp[i-1][j] < INF:
                    d = B[k][0] - B[j][1]
                    if d > 0.05:
                        cost = dp[i-1][j] + (math.log(d/exp))**2 * 4
                        # saltar silencios dentro de la frase: barato si son cortos o hay puntuación
                        cost += max(0, skipped - 0.25*allow) * 6 + max(0, nskip - allow) * 0.5
                        if cost < best: best, arg = cost, j
                # incluir B[j] como silencio interno antes de seguir
                if j > 0:
                    sd = B[j][1] - B[j][0]
                    skipped += sd
                    nskip += 1
            dp[i][k], bk[i][k] = best, arg
    # terminar en la última frontera
    k = M-1
    segs = []
    for i in range(N, 0, -1):
        j = bk[i][k]
        segs.append((B[j][1], B[k][0]))
        k = j
    return dp[N][M-1], segs[::-1]

a, b, c = 0.25, 0.17, 0.1
for it in range(4):
    cost, segs = align(a, b, c)
    # ajustar el modelo de duración por mínimos cuadrados
    import numpy as np
    X = np.array([[1, S_[i], words[i]-1] for i in range(N)])
    y = np.array([e-s for s,e in segs])
    a, b, c = np.linalg.lstsq(X, y, rcond=None)[0]
    a = max(a, 0.05); b = max(b, 0.05); c = max(c, 0.0)
    print(f'iter {it}: cost={cost:.1f} a={a:.2f} b={b:.3f} c={c:.2f}')
res = []
for i,(s,e) in enumerate(segs):
    exp = a + b*S_[i] + c*(words[i]-1)
    res.append({'i':i+1,'start':round(s,3),'end':round(e,3),'dur':round(e-s,2),'exp':round(exp,2),'text':lines[i]})
json.dump(res, open(OUT,'w'), ensure_ascii=False, indent=0)
print('candidates', M, 'segments', len(segs))
worst = sorted(res, key=lambda r: abs(math.log(r['dur']/r['exp'])))[-10:]
for r in worst: print('check', r['i'], r['dur'], 'exp', r['exp'], r['text'])

# אָלֶף־בֵּית – Juegos para aprender hebreo

Aplicación web para niños que empiezan a leer y escribir en hebreo. Todo está en hebreo (de derecha a izquierda) y las instrucciones, letras y palabras se dicen en voz alta, pensado para una niña de 5 años que todavía no lee.

**En línea:** https://alefbetjuego.vercel.app

## Juegos

| Juego | Qué se practica | Inspirado en |
|---|---|---|
| **הָאוֹתִיּוֹת** – Las letras | Las 22 letras y las 5 finales, con su nombre, una palabra de ejemplo, su pronunciación y cómo se forma ("רֹאשׁ מִיָּמִין, קַו בַּאֲלַכְסוֹן…") | Hoja de letras y recuadros "לוֹמְדִים" |
| **הָאוֹת הָרִאשׁוֹנָה** – La primera letra | Escuchar una palabra y elegir con qué letra empieza | Hoja 1 (לוֹמְדִים: א – אֲוִירוֹן) |
| **מִצְאוּ אֶת הָאוֹת** – Encontrá la letra | Marcar cada aparición de una letra entre letras parecidas; también con dagesh o sin él (בּ/ב, כּ/כ, פּ/פ), letras finales (ך ם ן ף ץ) y letra + קָמָץ o פַּתָּח (בָּ / בַּ) | Hoja 1, ejercicio 1 (הַקִּיפוּ כׇּל אוֹת א) |
| **אוֹת בַּמִּלָּה** – Letra en la palabra | Marcar los dibujos cuyo nombre tiene la letra | Hoja 1, ejercicio 4 |
| **תְּנוּעוֹת** – Vocales | Elegir el dibujo cuyo nombre empieza con la vocal (אַ, אֶ, אִ, אוֹ, אוּ) | Hoja 2 (אָ, אַ) |
| **כְּתִיבַת אוֹתִיּוֹת** – Escribir letras | Repasar la letra con el dedo; se comprueba que el trazo cubra la letra. Grupos א–י, כ–ר, ש–ת + finales | Hojas de caligrafía 1, 2 y 5 |
| **הַשְׁלִימוּ אֶת הַמִּלָּה** – Completar la palabra | Un dibujo y su palabra con una letra faltante; las opciones tienen la misma vocal o, a veces, son la misma letra con otra vocal | Hoja 8 (הַשְׁלִימוּ אֶת הַמִּלָּה עִם אָ אוֹ בָּ) |
| **חַבְּרוּ בְּקַו** – Unir con líneas | Unir cada dibujo con su letra inicial, arrastrando el dedo o tocando uno y otro | Hoja 7 (חַבְּרוּ לְפִי הַהֲבָרָה) |
| **תּוֹפְסִים אוֹתִיּוֹת** – Atrapar letras (arcade) | Mover una canasta para atrapar, en orden, las letras que caen y armar una palabra corta | — |
| **מַסְלוּל הָאוֹתִיּוֹת** – Ruta de letras | Una parada por letra, en el orden de las hojas: aprenderla (nombre, palabra y cómo se forma), buscarla y escuchar palabras que empiezan con ella. La siguiente se abre al terminar | Orden de las hojas de כיתה א |
| **צִבְעוּ לְפִי הָאוֹת** – Pintar según la letra | Cada crayón es una letra con su color; al tocar una zona con esa letra se pinta | "צִבְעוּ לְפִי הַהוֹרָאוֹת" (casi todas las hojas) |
| **שׁוֹמְעִים אוֹ לֹא?** – Solo con el oído | Dibujos sin la palabra escrita: marcar los que tienen el sonido | Hojas 4, 9, 20, 23, 36 |
| **מַתְחִילָה אוֹ מִסְתַּיֶּמֶת** – Empieza o termina | Rondas alternadas: marcar las palabras que empiezan / terminan con el sonido | Hojas 6, 7, 13, 21, 26, 29, 32, 41, 46, 51 |
| **אֵיפֹה הַצְּלִיל?** – ¿En qué sílaba? | Un círculo por sílaba; tocar el de la sílaba donde se oye la letra | Hojas 10, 15, 20, 38, 43 |
| **מְמַיְּנִים לְסַלִּים** – Clasificar | Poner cada dibujo en la canasta de su primera (o última) letra | Hojas 7, 10, 15 |
| **הַמָּבוֹךְ** – Laberinto | Llevar al ratón al queso pasando solo por dibujos que empiezan / terminan con la letra | Hoja 41 |
| **קוֹרְאִים וּבוֹנִים** – Leer y armar | Leer por sílabas y elegir el dibujo; armar la palabra del dibujo con fichas | Hojas 35, 39, 50 |
| **זָכָר וּנְקֵבָה** – Masculino y femenino | Elegir la forma femenina (סוּס → סוּסָה) y tocar la ה del final | Hoja 25 |
| **חֶלְקֵי הַדִּבּוּר** – Partes de la oración | Clasificar palabras en שֵׁם עֶצֶם, שֵׁם תֹּאַר, פֹּעַל, תֹּאַר הַפֹּעַל | Hoja de partes de la oración |

Cada juego guarda en el navegador las mejores estrellas (★★★) obtenidas.

### Frases motivadoras

Al acertar se dice un elogio al azar (14 distintos); al equivocarse, una frase de ánimo (6); con 3, 5, 8 y 12 rondas seguidas sin errores, una frase de racha; y al terminar un juego, una de 3 frases finales. Nunca se repite la misma dos veces seguidas, y el texto en pantalla es la misma frase que se escucha. Las listas están en `SAY` dentro de `src/strings.ts`.

## Premios y efectos

- **Efectos** (`src/lib/fx.ts`, `src/lib/sfx.ts`, `src/lib/juice.ts`): partículas, fuegos artificiales, papelitos y sonidos sintetizados. Cada acierto seguido sube el tono y agranda la explosión (racha 🔥).
- **Gemas 💎 y nivel 👑**: cada acierto da gemas (más con racha) y las estrellas del final dan un extra; las gemas suben el nivel.
- **Regalo 🎁 y álbum 📒**: al terminar un juego se abre una caja con una figurita nueva (36 en total).
- **Días seguidos 🔥**: se muestra a partir del segundo día. Nunca se pierde nada por equivocarse o por no jugar.
- **Música** de fondo solo en el menú, con botón para apagarla. El menú de padres también borra gemas y figuritas al reiniciar.
- Con *reducir movimiento* activado en el dispositivo, las animaciones se apagan.

## Modo niño

- Al abrir aparece un botón grande **בּוֹאוּ נְשַׂחֵק!** que activa la pantalla completa y el audio.
- El botón o gesto "atrás" del teléfono vuelve al menú en vez de salir de la página.
- Cerrar o recargar la pestaña pide confirmación. Sin zoom, sin selección de texto, sin menú de pulsación larga; la pantalla no se apaga mientras se juega.
- Si se sale de pantalla completa, el siguiente toque la vuelve a activar.
- **Menú de padres:** mantener apretado 3 segundos el candado 🔒 del menú. Permite:
  - **אִפּוּס הַנִּקּוּד** – reiniciar la puntuación (borra todas las estrellas; pide un segundo toque de confirmación),
  - **יְצִיאָה מֵהַמִּשְׂחָק** – salir del juego,
  - **חֲזָרָה לַמִּשְׂחָק** – volver al juego.
- **iPhone:** Safari no permite pantalla completa en páginas web. Hay que abrir el sitio, tocar *Compartir → Agregar a inicio* y abrir el juego desde ese ícono: se abre sin barras del navegador. En Android también conviene *Agregar a pantalla principal*.

## Voces

El juego reproduce MP3 grabados de `public/audio/` (uno por frase, letra o palabra; el catálogo está en `public/audio/catalog.json`) con Web Audio, y los precarga al tocar "empezar". Si falta alguno, usa la voz en hebreo del dispositivo. Para escucharlas todas: abrir **`/voces.html`** en el sitio.

Para saber qué falta grabar:

```bash
node scripts/missing-voices.mjs   # lista las frases sin MP3 y las guarda en scripts/voice-batches/faltan.txt
```

### Grabar sin clave de API (Google AI Studio)

Así se grabaron las voces actuales (voz de AI Studio):

1. Abrir [aistudio.google.com/generate-speech](https://aistudio.google.com/generate-speech), un solo hablante, siempre **la misma voz**.
2. En *Style instructions*:
   ```
   Read aloud in Hebrew with a warm, cheerful, clear voice, like a kindergarten teacher talking to a 5-year-old girl. Read each line once, exactly as written, following the niqqud. After each line, stay completely silent for 3 seconds before the next line. Do not add any words.
   ```
3. En el texto, pegar las líneas de `scripts/voice-batches/faltan.txt` (u otra tanda), descargar el audio.
4. Cortarlo en un MP3 por frase:
   ```bash
   python3 scripts/align-recording.py grabacion.wav scripts/voice-batches/faltan.txt alineacion.json
   node scripts/cut-from-alignment.mjs grabacion.wav alineacion.json   # --skip 3-5 para omitir líneas dudosas
   ```
   `align-recording.py` elige entre todos los silencios del audio los cortes que mejor coinciden con la duración esperada de cada frase, así que tolera pausas internas ("שָׁלוֹם! …") y pausas más cortas que lo pedido. Conviene revisar el resultado en `/voces.html`.

Las sílabas sueltas del juego "קוֹרְאִים וּבוֹנִים" no se graban: Gemini se salta sílabas cortas y no se pueden cortar con seguridad, así que el juego deja que la niña las lea y dice solo la palabra entera.

### Grabar con la API de Gemini

Con una clave de [Google AI Studio](https://aistudio.google.com/apikey) y `ffmpeg`:

```bash
GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs          # graba lo que falta
GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs --all    # vuelve a grabar todo
GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs --only "אָלֶף"   # una sola frase
GEMINI_VOICE=Kore GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs --all  # otra voz
```

## Contenido

- `src/data/letters.ts` – letras, nombres, palabra de ejemplo y letras parecidas (distractores).
- `src/data/words.ts` – banco de palabras con dibujo (emoji). Los juegos de vocales, primera letra, completar y atrapar las clasifican solos según su niqqud.
- `src/data/speechParts.ts` – partes de la oración.
- `src/data/sheets.ts` – datos de las hojas de כיתה א: palabras en sílabas, parejas זָכָר/נְקֵבָה, colores y dibujos para pintar, cómo se forma cada letra, letras con dagesh y letra + קָמָץ/פַּתָּח.
- `src/lib/sounds.ts` – con qué sonido empieza / termina una palabra (sin contar ה, א, ע, ו, י mudas).
- `src/strings.ts` – textos de pantalla (`t`) y frases habladas (`SAY`).

Las hojas de trabajo de כיתה א (49 PDF, hojas 1–51) inspiraron los juegos nuevos; en la tabla de juegos figura qué hoja usa cada uno.

Para agregar palabras o frases basta con sumar entradas con niqqud, correr `node scripts/missing-voices.mjs` y grabar las que falten.

## Publicación en Vercel

Proyecto **alefbetjuego** en Vercel (Vite: *Build command* `npm run build`, *Output directory* `dist`; el sitio funciona desde la raíz del dominio). No se actualiza solo con cada cambio: cada versión se publica creando un deployment de producción desde `main` (por ejemplo, desde el conector de Vercel con *gitSource* `github` → `pablosinder/AlefBetJuego`, rama `main`, *target* `production`). Para que se actualice solo, conectar el repositorio al proyecto en la configuración de Git de Vercel.

## Desarrollo

```bash
npm install
npm run dev        # servidor local
npm run build      # compilar a dist/
npm run typecheck  # comprobar tipos
npm run lint       # eslint
```

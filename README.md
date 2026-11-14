# אָלֶף־בֵּית – Juegos para aprender hebreo

Aplicación web para niños que empiezan a leer y escribir en hebreo. Todo está en hebreo (derecha a izquierda) y las instrucciones se dicen en voz alta, pensado para una niña de 5 años que todavía no lee.

## Juegos

| Juego | Qué se practica | Inspirado en |
|---|---|---|
| **הָאוֹתִיּוֹת** – Las letras | Las 22 letras y las 5 finales, con su nombre, una palabra de ejemplo y su pronunciación | Hoja de letras |
| **הָאוֹת הָרִאשׁוֹנָה** – La primera letra | Escuchar una palabra y elegir con qué letra empieza | Hoja 1 (לוֹמְדִים: א – אֲוִירוֹן) |
| **מִצְאוּ אֶת הָאוֹת** – Encontrá la letra | Marcar cada aparición de una letra entre letras parecidas | Hoja 1, ejercicio 1 (הַקִּיפוּ כׇּל אוֹת א) |
| **אוֹת בַּמִּלָּה** – Letra en la palabra | Marcar los dibujos cuyo nombre tiene la letra | Hoja 1, ejercicio 4 |
| **תְּנוּעוֹת** – Vocales | Elegir el dibujo cuyo nombre empieza con la vocal (אַ, אֶ, אִ, אוֹ, אוּ) | Hoja 2 (אָ, אַ) |
| **כְּתִיבַת אוֹתִיּוֹת** – Escribir letras | Repasar la letra con el dedo o el mouse; se comprueba que el trazo cubra la letra. Grupos א–י, כ–ר, ש–ת + finales | Hojas de caligrafía 1, 2 y 5 |
| **חֶלְקֵי הַדִּבּוּר** – Partes de la oración | Clasificar palabras en שֵׁם עֶצֶם, שֵׁם תֹּאַר, פֹּעַל, תֹּאַר הַפֹּעַל | Hoja de partes de la oración |

Cada juego guarda en el navegador las mejores estrellas (★★★) obtenidas.

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
- **Salida para padres:** mantener apretado 3 segundos el candado 🔒 del menú.
- **iPhone:** Safari no permite pantalla completa en páginas web. Hay que abrir el sitio, tocar *Compartir → Agregar a inicio* y abrir el juego desde ese ícono: se abre sin barras del navegador. En Android también conviene *Agregar a pantalla principal*.

## Voces

El juego reproduce MP3 grabados de `public/audio/` (uno por frase, letra o palabra; el catálogo está en `public/audio/catalog.json`). Si falta alguno, usa la voz en hebreo del dispositivo.

Para grabarlas con Gemini (necesita una clave de [Google AI Studio](https://aistudio.google.com/apikey) y `ffmpeg`):

```bash
GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs          # graba lo que falta
GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs --all    # vuelve a grabar todo
GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs --only "אָלֶף"   # una sola frase
GEMINI_VOICE=Kore GEMINI_API_KEY=tu_clave node scripts/make-voices.mjs --all  # otra voz
```

Para escucharlas todas: abrir `/voces.html` en el sitio.

## Contenido

Está en `src/data/` (`letters.ts`, `words.ts`, `speechParts.ts`) y los textos en `src/strings.ts`. Para agregar palabras basta con sumar entradas con niqqud y volver a correr el script de voces.

## Publicación en Vercel

Vercel detecta Vite solo: *Build command* `npm run build`, *Output directory* `dist`. El sitio funciona desde la raíz del dominio.

## Desarrollo

```bash
npm install
npm run dev        # servidor local
npm run build      # compilar a dist/
```

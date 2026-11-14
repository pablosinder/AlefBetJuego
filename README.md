# אָלֶף־בֵּית – Juegos para aprender hebreo

Aplicación web para niños que empiezan a leer y escribir en hebreo. La interfaz está en **hebreo por defecto** (derecha a izquierda) y se puede cambiar a español con el botón de idioma.

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

## Detalles

- **Voz:** usa la síntesis de voz del navegador en hebreo (`he-IL`). Si el dispositivo no tiene voz en hebreo, se avisa en el menú y se puede jugar igual.
- **Dibujos:** emojis, sin imágenes externas.
- **Contenido:** está en `src/data/` (`letters.ts`, `words.ts`, `speechParts.ts`). Para agregar palabras basta con sumar entradas con niqqud; los juegos de vocales y letras las clasifican solos.

## Desarrollo

```bash
npm install
npm run dev        # servidor local
npm run build      # compilar a dist/
npm run deploy     # publicar en GitHub Pages
```

# Alfabeto Hebreo - Aplicación Educativa

Una aplicación interactiva para aprender las letras del alfabeto hebreo con audio y objetos asociados.

## Características

- Navegación intuitiva entre las letras del alfabeto hebreo
- Audio configurable para cada letra y objeto
- Diseño visual atractivo y educativo
- Base de datos con Supabase para gestión de contenido
- Interfaz completamente responsive

## Estructura de Datos

Cada letra del alfabeto contiene:

- **letter**: La letra hebrea (ej: א)
- **letter_name**: Nombre de la letra en español (ej: "Alef")
- **letter_name_hebrew**: Nombre de la letra en hebreo (ej: אָלֶף)
- **object_name**: Nombre del objeto en español (ej: "Avión")
- **object_name_hebrew**: Nombre del objeto en hebreo (ej: אֲוִירוֹן)
- **audio_url**: URL del archivo de audio
- **order_index**: Orden en el alfabeto

## Cómo Agregar Más Letras

Puedes agregar más letras ejecutando consultas SQL en Supabase:

```sql
INSERT INTO hebrew_letters (
  letter,
  letter_name,
  letter_name_hebrew,
  object_name,
  object_name_hebrew,
  audio_url,
  order_index
) VALUES (
  'ו',
  'Vav',
  'וָו',
  'Gancho',
  'וָו',
  'https://tu-servidor.com/audio/vav-vav.mp3',
  6
);
```

## Configuración de Audio

Las URLs de audio deben apuntar a archivos MP3 accesibles públicamente. Puedes:

1. **Alojar en tu propio servidor**: Sube los archivos a tu servidor web
2. **Usar servicios de almacenamiento**: Amazon S3, Google Cloud Storage, Cloudinary
3. **Supabase Storage**: Usar el almacenamiento de Supabase

### Ejemplo con Supabase Storage

```typescript
// Subir un archivo
const { data, error } = await supabase.storage
  .from('audio-files')
  .upload('alef-aviron.mp3', audioFile);

// Obtener URL pública
const { data: publicURL } = supabase.storage
  .from('audio-files')
  .getPublicUrl('alef-aviron.mp3');
```

## Formato del Audio

Se recomienda que el audio incluya:
1. Nombre de la letra en hebreo
2. Nombre del objeto en hebreo
3. Ejemplo: "אָלֶף אֲוִירוֹן" (Alef Avión)

## Alfabeto Hebreo Completo

Aquí está la lista completa de las 22 letras:

1. א (Alef)
2. ב (Bet)
3. ג (Guímel)
4. ד (Dálet)
5. ה (He)
6. ו (Vav)
7. ז (Záyin)
8. ח (Jet)
9. ט (Tet)
10. י (Yod)
11. כ/ך (Kaf)
12. ל (Lámed)
13. מ/ם (Mem)
14. נ/ן (Nun)
15. ס (Sámej)
16. ע (Áyin)
17. פ/ף (Pe)
18. צ/ץ (Tsade)
19. ק (Qof)
20. ר (Resh)
21. ש (Shin)
22. ת (Tav)

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

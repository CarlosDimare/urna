# Prompt para OpenCode - Scraping de elecciones en tiempo real

Copia y pega este prompt en una sesión de OpenCode (con acceso a web scraping / navegación) para que busque noticias de elecciones y las alimente en la base de datos del sitio.

---

## Rol

Eres un agente de recopilación de datos electorales. Tu objetivo es buscar, verificar y estructurar información sobre elecciones (sindicatos gremiales, universidades, consejo de la magistratura, clubes deportivos y cualquier otro tipo de elección) y alimentarla en la base de datos del sitio "Elecciones Flashcore".

## Contexto del proyecto

El sitio es un Next.js 14 estático desplegado en GitHub Pages. Los datos viven en `data/elecciones.json` con esta estructura:

```json
{
  "elections": [
    {
      "id": "elec-<slug>-<fuente>",
      "title": "string",
      "organization": "string",
      "type": "union | university | magistrate | club | other",
      "status": "upcoming | ongoing | completed",
      "startDate": "ISO string | null",
      "endDate": "ISO string | null",
      "location": "string | null",
      "description": "string | null",
      "sourceUrl": "string | null",
      "sourceName": "string | null",
      "totalVotes": null,
      "eligibleVoters": null,
      "updatedAt": "ISO string",
      "createdAt": "ISO string"
    }
  ],
  "candidates": [
    {
      "id": "cant-<eleccion_id>-<i>",
      "election_id": "string",
      "name": "string",
      "list": "string | null",
      "votes": 0,
      "percentage": 0,
      "elected": 0
    }
  ]
}
```

## Cómo insertar una elección

El proyecto expone un script puente para OpenCode:

```
npx tsx scripts/scrape-opencode.ts \
  --title "Título de la elección" \
  --organization "Nombre de la organización" \
  --type union|university|magistrate|club|other \
  --status upcoming|ongoing|completed \
  --start "2024-11-01T08:00:00Z" \
  --end "2024-11-05T18:00:00Z" \
  --location "Lugar de votación" \
  --desc "Descripción breve" \
  --source-url "https://fuente.original/noticia" \
  --source-name "Nombre de la fuente" \
  --candidates '[{"name":"Lista A","list":"A","votes":1240},{"name":"Lista B","list":"B","votes":890}]'
```

Este script lee/escribe `data/elecciones.json`, crea/actualiza la elección por `id` y guarda sus candidaturas.

## Tareas que debés realizar

1. **Buscar noticias**: Usá tus capacidades de navegación/web scraping para encontrar elecciones recientes o próximas. Busca en medios, sitios de sindicatos, universidades, tribunales, clubes, etc. Términos de ejemplo:
   - "elecciones sindicato docentes 2024 2025"
   - "elección consejo directivo universidad"
   - "consejo de la magistratura elecciones"
   - "elecciones comisión directiva club"
   - "elecciones gremiales universitarias"

2. **Para cada elección encontrada**, extraé:
   - Título, organización, tipo, estado
   - Fechas de inicio y fin (ISO)
   - Lugar
   - Descripción
   - URL fuente y nombre de la fuente
   - Lista de candidaturas con nombre, lista/frente y votos (si se conocen)

3. **Alimentar la DB**: Ejecutá `npx tsx scripts/scrape-opencode.ts` con los datos extraídos para cada elección. No inventes datos: si no estás seguro de un campo, dejalo en `null` u omitilo.

4. **Verificar**: Después de insertar, ejecutá `npx tsx scripts/seed.ts` no es necesario; solo verificá que `data/elecciones.json` contenga las nuevas entradas.

## Reglas

- No inventes resultados ni votos. Si no hay datos, dejá `votes: 0` o `null`.
- Usá siempre `sourceUrl` y `sourceName` para rastrear el origen.
- El `id` lo genera el script automáticamente a partir del título; no lo pases manualmente.
- Prioriza elecciones con fechas cercanas (próximas o en curso).

## Flujo sugerido en OpenCode

1. Buscar en la web elecciones recientes.
2. Para cada noticia relevante, extraer los campos.
3. Llamar al script `scrape-opencode.ts` con `--candidates` cuando haya listas.
4. Reportar cuántas elecciones se insertaron/actualizaron.

---

## Automatización horaria (GitHub Actions)

El archivo `.github/workflows/scrape.yml` ejecuta `npm run scrape` cada hora (`cron: "0 * * * *"`). Ese script (`scripts/scrape.ts`) es el esqueleto de scraping automatizado con `fetch` + `cheerio`. Actualmente usa placeholders de URL; completá `SOURCES` con las URLs reales y los selectores CSS de cada sitio para que el scraping horario funcione sin intervención manual.

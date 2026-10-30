# Integración Google Sheets — Ágora

## Estado actual

| Recurso | Estado |
|---|---|
| Cronología (`Hoja1`) | Conectada vía service account |
| Catálogo `Publicaciones` | Pendiente (se usan datos demo etiquetados) |
| Foro / votos / auth | Almacenamiento local / sesión JWT (no Sheets) |

## Spreadsheet actual

- ID: `1V-FbSZr4PlMRRK-UkAlwngRmnclFCqOMfL1yWle6XbU`
- Service account de lectura: `lector-linea@linea-del-tiempo-511819.iam.gserviceaccount.com`
- Estructura observada en `Hoja1`: Etapa, Fuente, Autor, Eventos hebrea, Año hebreo, Año gregoriano, Eventos mundo, Periodo, Eventos México…

## Propuesta de hoja `Publicaciones`

Columnas canónicas (propuesta compatible, ajustable al archivo real):

`id, slug, title, subtitle, summary, body, coverImage, coverAlt, categories, primaryCategory, contentType, tags, authors, subject, schoolYear, publishedAt, updatedAt, status, accessLevel, featured, bibliography, credits, media, relatedIds, historicalYear, historicalYearEnd, historicalLine, historicalEventId, historicalDeepUrl, historicalLabel`

## Evitar duplicados

- `id` / `sheetsRowId` estables
- Upsert por identificador
- Una publicación puede tener varias categorías sin copiarse

## Diagnóstico

Panel: `/admin/diagnostico` (roles editor/moderador/administrador).

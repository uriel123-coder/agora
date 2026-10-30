# Ágora

**«Un espacio para descubrir, comprender y compartir».**

Biblioteca digital educativa, cultural y colaborativa construida con Next.js, TypeScript y Tailwind.

## Arranque local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Google Sheets

La cronología **Tres mundos, una historia** lee la hoja:

`1V-FbSZr4PlMRRK-UkAlwngRmnclFCqOMfL1yWle6XbU` (pestaña `Hoja1`).

Variables:

- `GOOGLE_SHEETS_ENABLED=true`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_TIMELINE_RANGE='Hoja1'!A:N`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

El catálogo editorial usa datos de demostración hasta que exista una pestaña `Publicaciones` con columnas canónicas (ver `docs/google-sheets.md`).

## Cuentas demo

Contraseña: `AgoraDemo2026!`

- `admin@agora.demo`
- `editor@agora.demo`
- `moderador@agora.demo`
- `docente@agora.demo`
- `alumno@agora.demo`

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run start` — servidor de producción

# URL-Shortener mit Analytics

Ein URL-Shortener mit erweiterten Analytics-Funktionen, entwickelt mit Nuxt3 und TypeScript.

## Features

- **URL-Verkürzung**: Automatische oder benutzerdefinierte Short Codes
- **Analytics ohne UTM**: Intelligente Quellenidentifikation
- **CSV-Speicher**: Platzsparende Datenhaltung ohne Datenbank
- **Responsive UI**: Mobile-First Design mit Tailwind CSS
- **TypeScript**: Vollständige Typisierung für bessere Entwicklererfahrung

## Technologie-Stack

- **Framework**: Nuxt3 (Full-Stack TypeScript)
- **Frontend**: Vue.js 3 mit Composition API
- **Backend**: Nuxt3 Server API
- **Styling**: Tailwind CSS via @nuxt/ui
- **Datenspeicher**: CSV-Dateien
- **Node.js**: Version 22+
- **Code-Formatierung**: Prettier

## Analytics-Features

### Quellenidentifikation (ohne UTM-Parameter)

- **Website-Traffic**: Erkennung über Referrer-Header
- **E-Mail/Direktaufruf**: Kein Referrer + Desktop User-Agent
- **QR-Code**: Kein Referrer + Mobile User-Agent

### Tracking-Daten

- Klick-Zählung pro URL
- Tägliche Statistiken
- Top-Referrer-Analyse
- Geräte- und Browser-Erkennung
- IP-basierte Unique Visitors

## Installation

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Code formatieren (vor Commit!)
npm run format

# Formatierung prüfen
npm run format:check

# Für Produktion bauen
npm run build
```

## Projektstruktur

```
/
├── server/api/          # Backend API Routes
│   ├── urls.post.ts     # URL-Erstellung
│   ├── urls.get.ts      # URL-Liste
│   ├── [shortCode].get.ts # Weiterleitung
│   └── urls/[shortCode]/stats.get.ts # Statistiken
├── pages/               # Frontend Pages
│   ├── index.vue        # Hauptseite
│   └── stats/[shortCode].vue # Statistiken
├── utils/               # Utility Services
│   ├── csvService.ts    # CSV-Datenverwaltung
│   └── urlService.ts    # URL-Logik
├── types/               # TypeScript Definitionen
└── data/                # CSV-Dateien (automatisch erstellt)
    ├── urls.csv         # URL-Mappings
    └── clicks.csv       # Klick-Tracking
```

## CSV-Datenstruktur

### urls.csv

```csv
shortCode,originalUrl,createdAt,createdBy
abc123,https://example.com,2024-01-01T12:00:00.000Z,anonymous
```

### clicks.csv

```csv
shortCode,timestamp,ip,userAgent,referrer,sourceType
abc123,2024-01-01T12:00:00.000Z,192.168.1.1,Mozilla/5.0...,https://google.com,website
```

## API-Endpunkte

### POST /api/urls

Erstellt eine neue Kurz-URL

```json
{
  "originalUrl": "https://example.com",
  "customCode": "optional-code"
}
```

### GET /api/urls

Listet alle erstellten URLs mit Klick-Statistiken

### GET /api/urls/[shortCode]/stats

Detaillierte Statistiken für eine spezifische URL

### GET /api/[shortCode]

Weiterleitung zur Original-URL (mit Tracking)

## Entwicklung

Das Projekt folgt den Entwicklungsrichtlinien in `.amazonq/rules/`:

- TypeScript strict mode
- Vue 3 Composition API
- Nuxt3 Auto-Imports
- CSV-basierte Datenhaltung

## Deployment

Das Projekt kann als statische Site oder mit Server-Side Rendering deployed werden:

```bash
# Static Generation
npm run generate

# Server-Side Rendering
npm run build
npm run preview
```

## Lizenz

APACHE 2.0

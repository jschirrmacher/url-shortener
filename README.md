# URL-Shortener mit Analytics

Ein URL-Shortener mit erweiterten Analytics-Funktionen, entwickelt mit Nuxt3 und TypeScript.

## Features

- **URL-Verkürzung**: Automatische oder benutzerdefinierte Short Codes
- **Analytics ohne UTM**: Intelligente Quellenidentifikation
- **CSV-Speicher**: Platzsparende Datenhaltung ohne Datenbank
- **Responsive UI**: Mobile-First Design
- **Benutzerverwaltung**: Login-System mit Admin-Funktionen
- **TypeScript**: Vollständige Typisierung für bessere Entwicklererfahrung

## Technologie-Stack

- **Framework**: Nuxt3 (Full-Stack TypeScript)
- **Frontend**: Vue.js 3 mit Composition API
- **Backend**: Nuxt3 Server API
- **Styling**: CSS mit scoped styles
- **Datenspeicher**: CSV-Dateien
- **Testing**: Vitest mit happy-dom
- **Node.js**: Version 22+
- **Code-Formatierung**: Prettier

## Analytics-Features

### Quellenidentifikation

- **Website-Traffic**: Erkennung über Referrer-Header
- **Direkter Aufruf**: Kein Referrer (E-Mail, Browser-Eingabe, etc.)
- **QR-Code**: URLs mit `?qr` Parameter für eindeutige Identifikation

### Tracking-Daten

- Klick-Zählung pro URL
- Tägliche Statistiken
- Top-Referrer-Analyse
- Geräte- und Browser-Erkennung
- IP-basierte Unique Visitors
- Optimierte User-Agent-Speicherung

## Installation

```bash
# Dependencies installieren
npm run setup # (kein `npm install`, das würde Install-Skripte nicht ausführen)

# Entwicklungsserver starten
npm run dev

# Tests ausführen
npm run test

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
├── server/
│   ├── api/                 # Backend API Routes
│   │   ├── urls.post.ts     # URL-Erstellung
│   │   ├── urls.get.ts      # URL-Liste
│   │   ├── [shortCode].get.ts # Direkte Short-URL Weiterleitung
│   │   ├── urls/[shortCode]/stats.get.ts # Statistiken
│   │   ├── auth/            # Authentifizierung
│   │   └── admin/           # Admin-Funktionen
│   ├── middleware/
│   │   └── 99.shortcode-redirect.ts # Short-URL Middleware (niedrige Priorität)
│   ├── clickDataService.ts # Optimierter Click-Datenservice
│   ├── csvService.ts        # CSV-Datenverwaltung
│   └── useUrls.ts          # URL-Management
├── pages/                   # Frontend Pages
│   ├── index.vue           # Dashboard
│   ├── login.vue           # Login-Seite
│   ├── profile.vue         # Benutzerprofil
│   ├── admin.vue           # Admin-Panel
│   └── stats/[shortCode].vue # Statistiken
├── components/             # Vue-Komponenten
│   ├── url/               # URL-bezogene Komponenten
│   ├── auth/              # Auth-Komponenten
│   └── base/              # Basis-Komponenten
├── utils/                 # Utility Services
│   └── apiAuth.ts         # API-Authentifizierung
├── types/                 # TypeScript Definitionen
├── tests/                 # Test-Dateien
└── data/                  # CSV-Dateien (automatisch erstellt)
    ├── urls.csv           # URL-Mappings
    ├── clicks.csv         # Klick-Tracking (optimiert)
    ├── user-agents.csv    # User-Agent-Kompression
    └── users.csv          # Benutzerdaten
```

## CSV-Datenstruktur

### urls.csv

```csv
shortCode,originalUrl,createdAt,createdBy,title
abc123,https://example.com,2024-01-01T12:00:00.000Z,user1,Example Site
```

### clicks.csv

```csv
shortCode,timestamp,ip,userAgentId,referrer,sourceType
abc123,2024-01-01T12:00:00.000Z,192.168.1.1,1,https://google.com,website
```

### user-agents.csv

```csv
id,userAgent
1,Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
```

### users.csv

```csv
username,passwordHash,isAdmin,active,createdAt
admin,hash123,true,true,2024-01-01T12:00:00.000Z
```

## API-Endpunkte

### Authentifizierung
- `POST /api/auth/login` - Benutzer-Login
- `POST /api/auth/logout` - Benutzer-Logout
- `POST /api/auth/change-password` - Passwort ändern

### URLs
- `POST /api/urls` - Neue Kurz-URL erstellen
- `GET /api/urls` - URL-Liste abrufen
- `GET /api/urls/[shortCode]/stats` - URL-Statistiken
- `GET /api/[shortCode]` - Weiterleitung zur Original-URL
- `GET /[shortCode]` - Direkte Short-URL (via Middleware)

### Admin
- `GET /api/admin/users` - Benutzerliste
- `POST /api/admin/users/[username]/reset-password` - Passwort zurücksetzen
- `POST /api/admin/users/[username]/deactivate` - Benutzer deaktivieren

## Short-URL Funktionalität

Das System unterstützt direkte Short-URLs über eine intelligente Middleware:

- **Direkte URLs**: `domain.com/abc123` → Weiterleitung
- **Frontend-Routen**: `/login`, `/admin`, `/profile` bleiben unberührt
- **API-Routen**: `/api/*` werden nicht abgefangen
- **Niedrige Priorität**: Middleware läuft erst nach normalen Routen

## Testing

```bash
# Tests ausführen
npm run test

# Tests mit Coverage
npm run test:coverage

# Tests im Watch-Modus
npm run test:watch
```

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

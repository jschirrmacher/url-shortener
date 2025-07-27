# Development Guidelines - URL Shortener

_Entwicklungsrichtlinien für das URL-Shortener-Projekt_

---

## 🎨 Code-Formatierung

### Prettier

Das Projekt verwendet **Prettier** für konsistente Code-Formatierung.

#### Konfiguration (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "htmlWhitespaceSensitivity": "css"
}
```

#### Verwendung

```bash
# Alle Dateien formatieren
npm run format

# Formatierung prüfen (ohne Änderungen)
npm run format:check

# Nur staged Files formatieren (Git)
npm run format:staged
```

#### Regeln

- **Immer vor Commit formatieren**: `npm run format`
- **Keine manuellen Formatierungen**: Prettier übernimmt alles
- **IDE-Integration**: VS Code/WebStorm Prettier-Plugin verwenden
- **Pre-commit Hook**: Automatische Formatierung bei Git-Commits

---

## 🏗️ Technologie-Stack

### Framework & Tools

- **Nuxt3** - Full-Stack Framework
- **Vue.js 3** - Frontend mit Composition API
- **TypeScript** - Typsicherheit
- **Tailwind CSS** - Styling
- **Node.js crypto** - Password-Hashing (statt bcrypt)
- **CSV-Dateien** - Datenspeicher (statt Datenbank)

### Architektur-Entscheidungen

- **Keine externen Dependencies** für Auth (Node.js crypto)
- **CSV statt JSON** - Platzsparend, Excel-kompatibel
- **Generische CSV-Services** - Type-sichere readCsv<T>()
- **definePageMeta** - Nuxt3-Middleware für Route-Schutz

---

## 📁 Projekt-Struktur

```
/
├── server/api/          # Backend API Routes
├── pages/              # Frontend Pages (Auto-Routing)
├── components/         # Vue Components
├── composables/        # Shared Logic (useAuth)
├── utils/              # Services (authService, csvService, urlService)
├── types/              # TypeScript Definitions
├── data/               # CSV Data Files
├── middleware/         # Route Middleware
└── assets/css/         # Tailwind CSS
```

---

## 🔐 Authentifizierung

### Password-Hashing

- **crypto.scrypt** statt bcrypt
- **Salt:Hash Format** - `salt:derivedKey`
- **Timing-safe Vergleich** - crypto.timingSafeEqual()

### JWT-Tokens

- **24h Gültigkeit** - Automatische Erneuerung
- **HttpOnly Cookies** - Sicherheit vor XSS
- **Role-based Access** - admin/user Rollen

---

## 📊 CSV-Datenstruktur

### urls.csv

```csv
shortCode,originalUrl,title,createdAt,createdBy
```

### clicks.csv

```csv
shortCode,timestamp,ip,userAgent,referrer,sourceType
```

### users.csv

```csv
username,password,role,createdAt,active
```

---

## 🧪 Testing & Qualität

### Code-Stil

- **Prettier** - Automatische Formatierung
- **TypeScript strict** - Vollständige Typisierung
- **ESLint** - Code-Qualität (optional)

### Cookie-Management beim Testen

- **Keine permanenten Cookies** - Verwende temporäre Cookie-Dateien
- **Automatisches Cleanup** - Cookies nach Tests löschen
- **Test-Helper verwenden** - `./scripts/test-helper.sh` für saubere Tests

```bash
# ✅ Korrekt - Temporäre Cookies
TEMP_COOKIES=$(mktemp)
curl -c "$TEMP_COOKIES" -X POST /api/auth/login ...
curl -b "$TEMP_COOKIES" /api/protected ...
rm -f "$TEMP_COOKIES"

# ❌ Vermeiden - Permanente Cookie-Speicherung
curl -c cookies.txt -X POST /api/auth/login ...
curl -b cookies.txt /api/protected ...
# cookies.txt bleibt bestehen!
```

### Test-Commands

```bash
# Alle Tests durchführen
./scripts/test-helper.sh all

# Einzelne Tests
./scripts/test-helper.sh login
./scripts/test-helper.sh dashboard
./scripts/test-helper.sh admin
./scripts/test-helper.sh urls

# Cleanup
./scripts/test-helper.sh cleanup
```

### Naming Conventions

- **Spezifische Namen** - `createUserError` statt `createError`
- **Kontext-bezogen** - `loginError`, `authError`, `validationError`
- **Vermeide Kollisionen** - Keine globalen Framework-Namen überschreiben

---

## 🚀 Development Workflow

### Setup

```bash
npm install
npm run dev
```

### Code-Änderungen

1. **Entwickeln** - Code schreiben
2. **Formatieren** - `npm run format`
3. **Testen** - Funktionalität prüfen
4. **Commit** - Git-Commit mit formatierten Code

### Deployment

```bash
npm run build
npm run preview
```

---

## 📝 Wichtige Erkenntnisse

### Gelöste Probleme

- **definePageMeta** - Expliziter Import in nuxt.config.ts nötig
- **createError Konflikt** - Variablen-Namen spezifisch wählen
- **Type-Safety** - Generische CSV-Services für korrekte Typisierung
- **bcrypt Ersatz** - Node.js crypto für weniger Dependencies

### Best Practices

- **Prettier vor jedem Commit**
- **TypeScript-Fehler sofort beheben**
- **Spezifische Variable-Namen**
- **Generische Services für Wiederverwendbarkeit**

---

_Diese Datei wird kontinuierlich mit neuen Erkenntnissen aktualisiert._

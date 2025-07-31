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

### SSR & Hydration Best Practices

- **Konsistente IDs** - Keine zufälligen IDs in SSR-Komponenten
- **useFieldId Composable** - Für SSR-sichere ID-Generierung
- **Label-basierte IDs** - Vorhersagbare und konsistente IDs
- **Namenskonflikte vermeiden** - Keine Überschreibung von Vue/Nuxt Composables

### Seiten-Meta Code-Style

- **useAuthPage Composable** - Zentrale Auth-Logik für alle Seiten
- **Automatische Meta-Verwaltung** - useHead und definePageMeta integriert
- **DRY-Prinzip** - Keine Duplikation von Auth-Logik

```typescript
// ✅ Korrekt - Zentrale Auth-Funktion
<script setup lang="ts">
import type { MyType } from '~/types/index'

const route = useRoute()
const param = route.params.param as string

// Alles in einer Zeile: useHead, definePageMeta, Auth-Prüfung
const { user } = useAuthPageStandard(`Meine Seite - ${param}`)

// ... weitere Logik
</script>

// ❌ Problematisch - Manuelle Auth-Logik
<script setup lang="ts">
useHead({ title: 'Meine Seite' })
definePageMeta({ middleware: 'auth' })

const { user, initAuth } = useAuth()

onMounted(async () => {
  await initAuth()
  if (!user.value) {
    await navigateTo('/login')
  }
})
</script>
```

**useAuthPage Varianten:**

- `useAuthPageStandard(title)` - Standard Auth-Seiten
- `useAuthPageAdmin(title)` - Admin-Seiten (auth + admin)
- `usePublicPage(title)` - Öffentliche Seiten (layout: false)
- `useAuthPage(options)` - Vollständige Konfiguration

**Standard-Reihenfolge für Seiten:**

1. Imports (types, etc.)
2. Route-Parameter (falls benötigt)
3. `useAuthPage*()` - Eine Zeile für alles
4. `definePageMeta()` - Eine Zeile (falls benötigt)
5. Composables und reactive Variablen
6. Lifecycle-Hooks und Funktionen

### Nuxt3-spezifische Richtlinien

- **useAuthPage Composable** - Zentrale Auth-Logik ersetzt Middleware
- **Nur auth.ts Middleware** - Admin-Prüfung in useAuthPage integriert
- **Client-side Admin-Check** - Flexiblere Fehlerbehandlung

```typescript
// ✅ Korrekt - useAuthPage übernimmt alles
const { user } = useAuthPageAdmin('Admin-Seite')

// ❌ Nicht mehr nötig - Middleware redundant
definePageMeta({
  middleware: ['auth', 'admin'], // admin middleware entfernt
})
```

**Middleware-Struktur:**

- `middleware/auth.ts` - Basis-Authentifizierung
- ~~`middleware/admin.ts`~~ - **Entfernt** (redundant zu useAuthPage)

**Admin-Schutz erfolgt auf zwei Ebenen:**

- **Frontend**: useAuthPage mit requireAdmin (client-side)
- **Backend**: requireAdmin() in API-Endpunkten (server-side)
- **Auto-Imports** - Keine expliziten Imports für Nuxt-Composables

```typescript
// ✅ Korrekt - Ein definePageMeta mit mehreren Middleware
definePageMeta({
  middleware: ['auth', 'admin'],
})

// ❌ Problematisch - Mehrere definePageMeta-Aufrufe
definePageMeta({
  middleware: 'auth',
})
definePageMeta({
  middleware: 'admin',
})
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

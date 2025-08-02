# Tests

Dieses Verzeichnis enthält alle Tests für das URL-Shortener-Projekt.

## Struktur

```
tests/
├── unit/           # Unit Tests
│   └── csvService.test.ts
├── e2e/            # End-to-End Tests (Playwright)
├── setup.ts        # Test Setup
└── README.md       # Diese Datei
```

## Unit Tests

### csvService.test.ts

Umfassende Tests für den CSV-Service mit folgenden Testbereichen:

- **Initialisierung**: Verzeichnis-Erstellung und Fehlerbehandlung
- **Datei-Management**: Erstellen von Dateien mit Headers
- **CSV-Lesen**: Parsing von CSV-Daten, Fehlerbehandlung, Typisierung
- **CSV-Schreiben**: Vollständiges Überschreiben von Dateien
- **CSV-Anhängen**: Hinzufügen einzelner Datensätze
- **CSV-Escaping**: Korrekte Behandlung von Sonderzeichen
- **Integration**: Vollständige Workflows

## Test-Ausführung

```bash
# Alle Tests ausführen
npm test

# Tests einmalig ausführen
npm run test:run

# Tests mit Coverage-Report
npm run test:coverage

# Nur Unit Tests
npm test tests/unit

# Spezifischen Test ausführen
npm test csvService
```

## Test-Konfiguration

- **Framework**: Vitest
- **Environment**: Node.js
- **Mocking**: vi.mock() für fs-Module
- **Coverage**: v8 Provider
- **TypeScript**: Vollständige Unterstützung

## Mocking-Strategie

### fs-Module

Das `fs.promises` Modul wird vollständig gemockt, um:

- Dateisystem-Operationen zu simulieren
- Deterministische Tests zu ermöglichen
- Keine echten Dateien zu erstellen
- Fehlerszenarien zu testen

### Beispiel Mock-Setup

```typescript
vi.mock("fs", () => ({
  promises: {
    mkdir: vi.fn(),
    access: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    appendFile: vi.fn(),
  },
}))
```

## Best Practices

1. **Isolation**: Jeder Test ist unabhängig
2. **Mocking**: Externe Dependencies werden gemockt
3. **Coverage**: Alle wichtigen Code-Pfade werden getestet
4. **Fehlerbehandlung**: Positive und negative Szenarien
5. **TypeScript**: Vollständige Typisierung auch in Tests

## Erweitern der Tests

Neue Tests sollten:

- In entsprechende Verzeichnisse (`unit/`, `e2e/`)
- Mit `.test.ts` oder `.spec.ts` Endung
- Vollständige Beschreibungen haben
- Mocks korrekt aufsetzen und zurücksetzen
- Edge Cases abdecken

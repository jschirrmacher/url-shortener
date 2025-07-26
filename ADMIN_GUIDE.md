# 🔐 Admin-Anleitung - URL-Shortener

*Vollständige Anleitung für die Verwaltung des URL-Shortener Systems*

---

## 🚀 **Erster Admin-Zugang**

### **1. Admin-Account erstellen (nur Entwicklung)**
```bash
# Nur in der Entwicklungsumgebung ausführen
npm run setup-admin

# Oder manuell:
node scripts/setup-admin.js
```

**⚠️ WICHTIG**: Das Setup-Script ist in der Produktion automatisch deaktiviert!

### **2. Erstes Login**
1. Öffnen Sie: `http://localhost:3000/login`
2. Anmeldedaten:
   - **Benutzername**: `admin`
   - **Passwort**: `admin123` (oder `ADMIN_INITIAL_PASSWORD`)
3. Nach dem Login: Sofort Passwort ändern!

### **3. Admin-Bereich aufrufen**
- Nach dem Login: Klick auf **"Admin"** Button (oben rechts)
- Oder direkt: `http://localhost:3000/admin`

---

## 🛠️ **Admin-Funktionen**

### **Passwort ändern**
1. Im Admin-Bereich → **"Passwort ändern"** Sektion
2. Aktuelles Passwort eingeben
3. Neues Passwort (min. 6 Zeichen)
4. Passwort bestätigen
5. **"Passwort ändern"** klicken

### **Neue Benutzer erstellen**
1. Im Admin-Bereich → **"Neuen Benutzer erstellen"** Sektion
2. Benutzername eingeben (min. 3 Zeichen)
3. Passwort festlegen (min. 6 Zeichen)
4. **"Benutzer erstellen"** klicken

**Automatisch gespeichert**:
- Wer den Benutzer erstellt hat (`createdBy`)
- Erstellungsdatum
- Aktiv-Status (standardmäßig aktiv)

### **Benutzer verwalten**
In der **"Benutzer-Verwaltung"** Tabelle:

- **Status anzeigen**: Aktiv (grün) oder Deaktiviert (rot)
- **Deaktivieren**: Benutzer kann sich nicht mehr anmelden
- **Reaktivieren**: Deaktivierte Benutzer wieder aktivieren
- **Admin-Schutz**: Admin-Account kann nicht deaktiviert werden

---

## 🔒 **Sicherheitsfeatures**

### **Setup-Script Schutz**
- **Entwicklung**: Script funktioniert normal
- **Produktion**: Automatisch blockiert
- **Umgebungsvariablen**: `NODE_ENV=production` deaktiviert Script

### **Benutzer-Deaktivierung (statt Löschung)**
- **Soft Delete**: Benutzer werden nur deaktiviert
- **Audit Trail**: Wer hat wann deaktiviert
- **Reaktivierung**: Jederzeit möglich
- **Datenerhaltung**: Keine Datenverluste

### **Admin-Privilegien**
- **Geschützter Account**: Admin kann nicht deaktiviert werden
- **Vollzugriff**: Alle Benutzer und URLs verwalten
- **Audit-Funktionen**: Nachverfolgung aller Aktionen

---

## 📊 **CSV-Datenstruktur**

### **users.csv**
```csv
username,passwordHash,createdAt,createdBy,isActive,updatedAt,deactivatedAt,deactivatedBy
admin,$2b$12$...,2025-01-01T10:00:00.000Z,system,true,2025-01-01T11:00:00.000Z,,
user1,$2b$12$...,2025-01-01T12:00:00.000Z,admin,false,,2025-01-01T13:00:00.000Z,admin
```

**Felder erklärt**:
- `username`: Eindeutiger Benutzername
- `passwordHash`: Bcrypt-Hash des Passworts
- `createdAt`: Erstellungsdatum
- `createdBy`: Wer hat den Benutzer erstellt
- `isActive`: true/false - Aktiv-Status
- `updatedAt`: Letztes Passwort-Update
- `deactivatedAt`: Wann deaktiviert
- `deactivatedBy`: Wer hat deaktiviert

---

## 🚨 **Produktions-Setup**

### **1. Sicherheits-Checkliste**
- [ ] Setup-Script löschen oder umbenennen
- [ ] Admin-Passwort geändert
- [ ] `JWT_SECRET` Umgebungsvariable gesetzt
- [ ] `NODE_ENV=production` gesetzt
- [ ] HTTPS konfiguriert

### **2. Umgebungsvariablen**
```bash
# .env Datei
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
ADMIN_INITIAL_PASSWORD=secure-initial-password
```

### **3. Admin-Account in Produktion erstellen**
```javascript
// Manueller Admin-Setup (einmalig ausführen)
import authService from './utils/authService.js'

const admin = await authService.createAdminUser('admin', 'secure-password')
console.log('Admin created:', admin)
```

---

## 🔧 **Wartung & Troubleshooting**

### **Häufige Probleme**

**Problem**: "Setup-Script funktioniert nicht"
- **Lösung**: Prüfen Sie `NODE_ENV` - muss `development` sein

**Problem**: "Admin kann sich nicht anmelden"
- **Lösung**: Prüfen Sie `users.csv` - `isActive` muss `true` sein

**Problem**: "Passwort vergessen"
- **Lösung**: Neuen Hash in `users.csv` eintragen oder Script erneut ausführen

### **Backup-Empfehlungen**
```bash
# Regelmäßige Backups
cp data/users.csv backups/users_$(date +%Y%m%d).csv
cp data/urls.csv backups/urls_$(date +%Y%m%d).csv
cp data/clicks.csv backups/clicks_$(date +%Y%m%d).csv
```

### **Log-Monitoring**
- Login-Versuche werden geloggt
- Fehlgeschlagene Authentifizierungen
- Admin-Aktionen (Benutzer erstellen/deaktivieren)

---

## 📞 **Support & Kontakt**

Bei Problemen oder Fragen:
1. Prüfen Sie diese Anleitung
2. Kontrollieren Sie die Browser-Konsole
3. Prüfen Sie die Server-Logs
4. Kontaktieren Sie den System-Administrator

---

*Diese Anleitung wird regelmäßig aktualisiert. Letzte Änderung: 2025-07-26*

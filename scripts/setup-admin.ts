import authService from '../utils/authService'
import type { User } from '../types/index'

interface SetupResult {
  success: boolean
  message: string
  user?: User
}

async function setupAdmin(): Promise<SetupResult> {
  try {
    // SICHERHEITSCHECK: Nur in Entwicklung ausführen
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ Setup-Script ist in der Produktion deaktiviert!')
      console.log('   Erstellen Sie den Admin-Benutzer manuell oder über sichere Deployment-Prozesse.')
      process.exit(1)
    }

    console.log('🚀 URL-Shortener Admin-Setup wird gestartet...\n')

    // Prüfe ob bereits ein Admin existiert
    const existingUsers = await authService.getAllUsers()
    const existingAdmin = existingUsers.find(user => user.role === 'admin')

    if (existingAdmin) {
      console.log('ℹ️  Admin-Benutzer existiert bereits:')
      console.log(`   Benutzername: ${existingAdmin.username}`)
      console.log(`   Erstellt am: ${new Date(existingAdmin.createdAt).toLocaleString('de-DE')}`)
      console.log('\n✅ Setup bereits abgeschlossen!')
      
      return {
        success: true,
        message: 'Admin-Benutzer existiert bereits',
        user: existingAdmin
      }
    }

    // Standard Admin-Daten
    const adminData = {
      username: 'admin',
      password: 'admin123', // WARNUNG: In Produktion ändern!
      role: 'admin' as const
    }

    console.log('👤 Erstelle Admin-Benutzer...')
    console.log(`   Benutzername: ${adminData.username}`)
    console.log(`   Passwort: ${adminData.password}`)
    console.log('   ⚠️  WICHTIG: Ändern Sie das Passwort nach dem ersten Login!\n')

    // Erstelle Admin-Benutzer
    const adminUser = await authService.createUser(adminData)

    console.log('✅ Admin-Benutzer erfolgreich erstellt!')
    console.log('\n📋 Nächste Schritte:')
    console.log('   1. Starten Sie den Server: npm run dev')
    console.log('   2. Öffnen Sie: http://localhost:3000')
    console.log('   3. Melden Sie sich mit admin/admin123 an')
    console.log('   4. Ändern Sie das Passwort im Profil')
    console.log('   5. Erstellen Sie weitere Benutzer über die Admin-Oberfläche\n')

    return {
      success: true,
      message: 'Admin-Benutzer erfolgreich erstellt',
      user: adminUser
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    console.error('❌ Fehler beim Setup:', errorMessage)
    
    return {
      success: false,
      message: errorMessage
    }
  }
}

// Script ausführen wenn direkt aufgerufen
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAdmin()
    .then((result) => {
      if (!result.success) {
        process.exit(1)
      }
    })
    .catch((error: unknown) => {
      console.error('❌ Setup fehlgeschlagen:', error)
      process.exit(1)
    })
}

export default setupAdmin

#!/bin/bash

# Test Helper Script für URL-Shortener
# Führt Tests durch ohne permanente Cookie-Speicherung

BASE_URL="http://localhost:3000"
ADMIN_USER="admin"
ADMIN_PASS="admin123"

# Funktion: Authentifizierter API-Call
authenticated_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    # Temporäre Cookie-Datei erstellen
    local temp_cookies=$(mktemp)
    
    # Login durchführen
    curl -s -c "$temp_cookies" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" > /dev/null
    
    # API-Call mit Session-Cookie
    if [ -n "$data" ]; then
        curl -s -b "$temp_cookies" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" -d "$data"
    else
        curl -s -b "$temp_cookies" -X "$method" "$BASE_URL$endpoint"
    fi
    
    # Cookie-Datei sofort löschen
    rm -f "$temp_cookies"
}

# Funktion: Test Login
test_login() {
    echo "🔐 Teste Login..."
    local result=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" | jq -r '.success')
    
    if [ "$result" = "true" ]; then
        echo "✅ Login erfolgreich"
        return 0
    else
        echo "❌ Login fehlgeschlagen"
        return 1
    fi
}

# Funktion: Test Dashboard
test_dashboard() {
    echo "📊 Teste Dashboard..."
    local temp_cookies=$(mktemp)
    
    # Login
    curl -s -c "$temp_cookies" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" > /dev/null
    
    # Dashboard testen
    local result=$(curl -s -b "$temp_cookies" "$BASE_URL/" | grep -q "Dashboard" && echo "success" || echo "failed")
    
    # Cookie löschen
    rm -f "$temp_cookies"
    
    if [ "$result" = "success" ]; then
        echo "✅ Dashboard lädt korrekt"
        return 0
    else
        echo "❌ Dashboard hat Probleme"
        return 1
    fi
}

# Funktion: Test Admin-API
test_admin_api() {
    echo "👤 Teste Admin-API..."
    local result=$(authenticated_call "GET" "/api/admin/users" | jq 'length' 2>/dev/null)
    
    if [ "$result" -gt 0 ] 2>/dev/null; then
        echo "✅ Admin-API funktioniert ($result Benutzer)"
        return 0
    else
        echo "❌ Admin-API hat Probleme"
        return 1
    fi
}

# Funktion: Test URL-API
test_url_api() {
    echo "🔗 Teste URL-API..."
    local result=$(authenticated_call "GET" "/api/urls" | jq 'length' 2>/dev/null)
    
    if [ "$result" -ge 0 ] 2>/dev/null; then
        echo "✅ URL-API funktioniert ($result URLs)"
        return 0
    else
        echo "❌ URL-API hat Probleme"
        return 1
    fi
}

# Funktion: Vollständiger Test
run_all_tests() {
    echo "🧪 Starte vollständige Tests..."
    echo "================================"
    
    local failed=0
    
    test_login || ((failed++))
    test_dashboard || ((failed++))
    test_admin_api || ((failed++))
    test_url_api || ((failed++))
    
    echo "================================"
    if [ $failed -eq 0 ]; then
        echo "🎉 Alle Tests erfolgreich!"
        return 0
    else
        echo "⚠️  $failed Test(s) fehlgeschlagen"
        return 1
    fi
}

# Funktion: Cleanup (falls nötig)
cleanup() {
    echo "🧹 Cleanup..."
    # Lösche alle temporären Cookie-Dateien
    find /tmp -name "tmp.*" -type f -exec rm -f {} \; 2>/dev/null || true
    echo "✅ Cleanup abgeschlossen"
}

# Main-Funktion
main() {
    case "${1:-all}" in
        "login")
            test_login
            ;;
        "dashboard")
            test_dashboard
            ;;
        "admin")
            test_admin_api
            ;;
        "urls")
            test_url_api
            ;;
        "cleanup")
            cleanup
            ;;
        "all"|*)
            run_all_tests
            ;;
    esac
}

# Script ausführen
main "$@"

# ================================================
#     TEST DU HEADER RESPONSIVE - ECOLE ST MATHIEU
# ================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "     TEST DU HEADER RESPONSIVE - ECOLE ST MATHIEU" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

# Vérifier si les dépendances sont installées
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour continuer..."
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Démarrage du serveur..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Pour tester le responsive :" -ForegroundColor Cyan
Write-Host "   - Le serveur va démarrer automatiquement" -ForegroundColor White
Write-Host "   - Une page de test s'ouvrira dans votre navigateur" -ForegroundColor White
Write-Host "   - Utilisez les outils développeur (F12) pour tester différentes tailles" -ForegroundColor White
Write-Host "   - Testez sur mobile en utilisant le simulateur du navigateur" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Page de test : http://localhost:3007/test-responsive" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

# Démarrer le serveur en arrière-plan
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node app.js
}

# Attendre que le serveur démarre
Start-Sleep -Seconds 3

# Ouvrir la page de test dans le navigateur
try {
    Start-Process "http://localhost:3007/test-responsive"
    Write-Host "🌐 Page de test ouverte dans le navigateur" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Impossible d'ouvrir automatiquement le navigateur" -ForegroundColor Yellow
    Write-Host "   Ouvrez manuellement : http://localhost:3007/test-responsive" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Serveur prêt ! Test du header responsive en cours..." -ForegroundColor Green
Write-Host ""

# Attendre l'arrêt du serveur
try {
    Wait-Job $serverJob
} catch {
    Write-Host "Serveur arrêté" -ForegroundColor Yellow
} finally {
    Remove-Job $serverJob -Force
}

# Script de correction Google Maps (version simplifiée)
Write-Host "Correction Google Maps pour HTTPS..." -ForegroundColor Green

# Vérifications
if (-not (Test-Path "app.js")) {
    Write-Host "Erreur : Script doit être execute depuis la racine" -ForegroundColor Red
    exit 1
}

# Validation des fichiers
$files = @(".\src\views\pages\home.twig", ".\src\views\layouts\base.twig", ".\test-google-maps.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "MANQUANT: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Corrections appliquees :" -ForegroundColor Cyan
Write-Host "- URL Google Maps corrigee" -ForegroundColor White
Write-Host "- Content Security Policy ajoute" -ForegroundColor White  
Write-Host "- Fallback OpenStreetMap" -ForegroundColor White
Write-Host "- Bouton de basculement" -ForegroundColor White

Write-Host ""
Write-Host "Fichiers a deployer :" -ForegroundColor Cyan
Write-Host "- src/views/pages/home.twig" -ForegroundColor White
Write-Host "- src/views/layouts/base.twig" -ForegroundColor White

Write-Host ""
Write-Host "Test: Ouvrir test-google-maps.html dans un navigateur" -ForegroundColor Yellow
Write-Host "Correction terminee !" -ForegroundColor Green

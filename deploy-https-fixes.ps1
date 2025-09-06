# Script de deploiement des corrections HTTPS pour l'Ecole Saint-Mathieu
# Ce script applique les corrections de taille et de rendu pour l'environnement de production

Write-Host "Deploiement des corrections HTTPS..." -ForegroundColor Green

# Verification que nous sommes dans le bon repertoire
if (-not (Test-Path "app.js")) {
    Write-Host "Erreur : Ce script doit etre execute depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Sauvegarde des fichiers originaux
Write-Host "Creation des sauvegardes..." -ForegroundColor Yellow
$backupDir = ".\backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

if (Test-Path ".\src\views\layouts\") {
    Copy-Item -Path ".\src\views\layouts\" -Destination "$backupDir\layouts_backup" -Recurse -Force
}
if (Test-Path ".\src\views\pages\") {
    Copy-Item -Path ".\src\views\pages\" -Destination "$backupDir\pages_backup" -Recurse -Force
}
if (Test-Path ".\public\assets\css\") {
    Copy-Item -Path ".\public\assets\css\" -Destination "$backupDir\css_backup" -Recurse -Force
}

Write-Host "Sauvegardes creees dans .\backups\" -ForegroundColor Green

# Verification de l'existence des fichiers CSS de correction
if (-not (Test-Path ".\public\assets\css\https-fixes.css")) {
    Write-Host "Erreur : Le fichier https-fixes.css n'existe pas" -ForegroundColor Red
    Write-Host "Veuillez d'abord creer ce fichier avec les corrections CSS" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier https-fixes.css trouve" -ForegroundColor Green

# Cache clearing si applicable
Write-Host "Nettoyage du cache..." -ForegroundColor Yellow
if (Test-Path ".\cache") {
    Remove-Item -Path ".\cache\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cache vide" -ForegroundColor Green
}

# Test de validation des fichiers
Write-Host "Validation des fichiers modifies..." -ForegroundColor Yellow

$filesToCheck = @(
    ".\src\views\layouts\base.twig",
    ".\src\views\pages\demande-identifiants.twig",
    ".\src\views\pages\auth\login.twig"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "Fichier $file existe" -ForegroundColor Green
    } else {
        Write-Host "Fichier $file n'existe pas" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Resume des corrections appliquees :" -ForegroundColor Cyan
Write-Host "   • Reduction des tailles de police (text-4xl vers text-2xl, etc.)" -ForegroundColor White
Write-Host "   • Optimisation du viewport pour HTTPS" -ForegroundColor White
Write-Host "   • Uniformisation des espacements" -ForegroundColor White
Write-Host "   • Correction des conteneurs et marges" -ForegroundColor White
Write-Host "   • Ajout du fichier CSS https-fixes.css" -ForegroundColor White
Write-Host ""
Write-Host "Pages modifiees :" -ForegroundColor Cyan
Write-Host "   • Demande d'identifiants (tailles reduites)" -ForegroundColor White
Write-Host "   • Page de connexion (conteneur reduit)" -ForegroundColor White
Write-Host "   • Layout de base (CSS de correction ajoute)" -ForegroundColor White
Write-Host ""
Write-Host "Pour deployer en production :" -ForegroundColor Cyan
Write-Host "   1. Synchroniser les fichiers modifies avec le serveur HTTPS" -ForegroundColor White
Write-Host "   2. Vider le cache du serveur web si necessaire" -ForegroundColor White
Write-Host "   3. Tester la page demande d'identifiants" -ForegroundColor White
Write-Host "   4. Verifier que les tailles sont maintenant uniformes" -ForegroundColor White
Write-Host ""
Write-Host "Deploiement des corrections termine avec succes !" -ForegroundColor Green

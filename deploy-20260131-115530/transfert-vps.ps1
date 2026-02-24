# Script de transfert automatique vers le VPS
# ⚠️  MODIFIER LES VARIABLES CI-DESSOUS AVEC VOS IDENTIFIANTS

$VPS_USER = "root"
$VPS_HOST = "votre-serveur.com"  # Remplacer par l'IP ou domaine de votre VPS
$VPS_PATH = "/var/www/ecole-st-mathieu"

Write-Host "🚀 Transfert des modifications vers le VPS..." -ForegroundColor Cyan
Write-Host "Serveur: $VPS_USER@$VPS_HOST" -ForegroundColor Yellow
Write-Host ""

# Transférer les fichiers
Write-Host "📤 Envoi de register.twig..." -ForegroundColor White
scp src/views/pages/auth/register.twig "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/src/views/pages/auth/"

Write-Host "📤 Envoi de credentials.twig..." -ForegroundColor White
scp src/views/pages/directeur/credentials.twig "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/src/views/pages/directeur/"

Write-Host "📤 Envoi de header.twig..." -ForegroundColor White
scp src/views/partials/header.twig "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/src/views/partials/"

Write-Host "📤 Envoi de dossier-inscription.twig..." -ForegroundColor White
scp src/views/pages/dossier-inscription.twig "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/src/views/pages/"

Write-Host ""
Write-Host "✅ Transfert terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes sur le VPS:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_HOST}" -ForegroundColor White
Write-Host "   cd ${VPS_PATH}" -ForegroundColor White
Write-Host "   pm2 restart ecole-st-mathieu" -ForegroundColor White
Write-Host "   pm2 logs ecole-st-mathieu" -ForegroundColor White
Write-Host ""

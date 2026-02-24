# Script de transfert SCP vers le VPS
# Remplacer 'root@votre-serveur' par vos identifiants réels

$VPS_HOST = "root@votre-serveur.com"
$VPS_PATH = "/var/www/ecole-st-mathieu"

Write-Host "🚀 Transfert des fichiers vers le VPS..." -ForegroundColor Cyan

scp src/views/pages/auth/register.twig ${VPS_HOST}:${VPS_PATH}/src/views/pages/auth/
scp src/views/pages/directeur/credentials.twig ${VPS_HOST}:${VPS_PATH}/src/views/pages/directeur/
scp src/views/partials/header.twig ${VPS_HOST}:${VPS_PATH}/src/views/partials/

Write-Host "✅ Transfert terminé!" -ForegroundColor Green
Write-Host "⚠️  N'oubliez pas d'exécuter sur le VPS:" -ForegroundColor Yellow
Write-Host "   npx prisma migrate deploy" -ForegroundColor White
Write-Host "   node seed.js" -ForegroundColor White
Write-Host "   pm2 restart ecole-st-mathieu" -ForegroundColor White

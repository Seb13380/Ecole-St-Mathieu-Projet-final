# Script de transfert SCP - 04/03/2026
# Modifier VPS_HOST avec votre adresse réelle

$VPS_HOST = "root@votre-serveur.com"
$VPS_PATH = "/var/www/ecole-st-mathieu"

Write-Host "🚀 Transfert vers le VPS..." -ForegroundColor Cyan

scp src/views/pages/directeur/credentials.twig `:`/src/views/pages/directeur/
scp fix-ingrid-account.sql `:/tmp/

Write-Host "✅ Transfert terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "Sur le VPS, exécuter :" -ForegroundColor Yellow
Write-Host "  mysql -u root -p stmathieu < /tmp/fix-ingrid-account.sql" -ForegroundColor White
Write-Host "  pm2 restart ecole-st-mathieu" -ForegroundColor White

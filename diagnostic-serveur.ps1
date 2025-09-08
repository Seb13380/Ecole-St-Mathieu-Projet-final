# Script de diagnostic serveur
Write-Host "=== DIAGNOSTIC SERVEUR ===" -ForegroundColor Yellow

$VPS_USER = "root"
$VPS_HOST = "82.165.44.88"

Write-Host "1. Verification de la connexion SSH..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_HOST}" "echo 'Connexion OK'"

Write-Host "2. Recherche des fichiers Twig..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_HOST}" "find /var -name 'base.twig' 2>/dev/null"

Write-Host "3. Structure du repertoire web..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_HOST}" "ls -la /var/www/"

Write-Host "4. Type de serveur web..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_HOST}" "systemctl status nginx; systemctl status apache2" 

Write-Host "5. Processus web actifs..." -ForegroundColor Cyan
ssh "${VPS_USER}@${VPS_HOST}" "ps aux | grep -E 'nginx|apache|httpd'"

Write-Host "=== FIN DIAGNOSTIC ===" -ForegroundColor Yellow

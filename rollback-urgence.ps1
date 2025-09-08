# Script de rollback d'urgence - Restaure la version précédente en cas de problème
param(
    [string]$BackupDate = ""
)

Write-Host "=== SCRIPT DE ROLLBACK D'URGENCE ===" -ForegroundColor Red

# Configuration serveur
$VPS_USER = "root"
$VPS_HOST = "82.165.44.88"
$VPS_PATH = "/var/www/html"

if ($BackupDate -eq "") {
    Write-Host "Recherche des sauvegardes disponibles..." -ForegroundColor Yellow
    ssh $VPS_USER@$VPS_HOST "ls -la /root/backup-* 2>/dev/null | tail -5"
    
    $BackupDate = Read-Host "Entrez la date de sauvegarde à restaurer (format: yyyyMMdd-HHmmss)"
}

$backup_path = "/root/backup-$BackupDate"

Write-Host "Vérification de la sauvegarde $backup_path..." -ForegroundColor Yellow
$backup_exists = ssh $VPS_USER@$VPS_HOST "test -d '$backup_path' && echo 'EXISTS' || echo 'NOT_FOUND'"

if ($backup_exists -notmatch "EXISTS") {
    Write-Host "ERREUR: Sauvegarde non trouvée!" -ForegroundColor Red
    Write-Host "Sauvegardes disponibles:" -ForegroundColor Yellow
    ssh $VPS_USER@$VPS_HOST "ls -la /root/backup-*"
    exit 1
}

Write-Host "Sauvegarde trouvée!" -ForegroundColor Green
Write-Host "ATTENTION: Ceci va restaurer la version précédente du site!" -ForegroundColor Red
$confirm = Read-Host "Êtes-vous sûr de vouloir faire le rollback? (y/N)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Rollback annulé." -ForegroundColor Yellow
    exit
}

Write-Host "=== ROLLBACK EN COURS ===" -ForegroundColor Red

# Restaurer base.twig depuis la sauvegarde
Write-Host "Restauration de base.twig..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_HOST "cp '$backup_path/layouts/base.twig' '$VPS_PATH/src/views/layouts/base.twig'"

# Redémarrer le serveur web
Write-Host "Redémarrage du serveur web..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_HOST "systemctl restart apache2 || systemctl restart nginx"

Write-Host "=== ROLLBACK TERMINÉ ===" -ForegroundColor Green
Write-Host "La version précédente a été restaurée!" -ForegroundColor Green
Write-Host "Vérifiez votre site: https://ecole-st-mathieu.ovh" -ForegroundColor Cyan

# Vérifier que le fichier a bien été restauré
Write-Host "Vérification du rollback..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_HOST "head -n 10 '$VPS_PATH/src/views/layouts/base.twig'"

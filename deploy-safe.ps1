# Script de déploiement sécurisé - Ne touche que les fichiers essentiels pour corriger la CSP
Write-Host "Déploiement sécurisé en cours..." -ForegroundColor Green

# Configuration serveur
$VPS_USER = "root"
$VPS_HOST = "82.165.44.88"
$VPS_PATH = "/var/www/html"

# Fichiers à déployer (seulement ceux modifiés pour la CSP)
$files_to_deploy = @(
    "src/views/layouts/base.twig"
)

Write-Host "Fichiers à déployer:" -ForegroundColor Yellow
foreach ($file in $files_to_deploy) {
    Write-Host "  - $file" -ForegroundColor Cyan
}

$confirm = Read-Host "Continuer avec ce déploiement sécurisé? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Déploiement annulé." -ForegroundColor Red
    exit
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Write-Host "Création d'une sauvegarde sur le serveur..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p /root/backup-$timestamp"
ssh "${VPS_USER}@${VPS_HOST}" "cp -r $VPS_PATH/src/views/layouts /root/backup-$timestamp/"

Write-Host "Déploiement des fichiers critiques..." -ForegroundColor Yellow
foreach ($file in $files_to_deploy) {
    if (Test-Path $file) {
        $remote_path = "$VPS_PATH/$($file -replace '\\', '/')"
        $remote_dir = Split-Path $remote_path -Parent
        
        # Créer le répertoire si nécessaire
        ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p '$remote_dir'"
        
        # Copier le fichier
        scp $file "${VPS_USER}@${VPS_HOST}:$remote_path"
        Write-Host "✓ $file déployé" -ForegroundColor Green
    } else {
        Write-Host "✗ Fichier manquant: $file" -ForegroundColor Red
    }
}

Write-Host "Redémarrage du serveur web..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_HOST}" "systemctl restart apache2; systemctl restart nginx"

Write-Host "Déploiement terminé!" -ForegroundColor Green
Write-Host "Vérifiez votre site: https://ecole-st-mathieu.ovh" -ForegroundColor Cyan

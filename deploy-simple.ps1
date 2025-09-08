# Script de deploiement securise - CSP fix
Write-Host "Deploiement securise en cours..." -ForegroundColor Green

# Configuration serveur
$VPS_USER = "root"
$VPS_HOST = "82.165.44.88"
$VPS_PATH = "/var/www/html"

# Fichiers a deployer
$files_to_deploy = @(
    "src/views/layouts/base.twig"
)

Write-Host "Fichiers a deployer:" -ForegroundColor Yellow
foreach ($file in $files_to_deploy) {
    Write-Host "  - $file" -ForegroundColor Cyan
}

$confirm = Read-Host "Continuer avec ce deploiement securise? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deploiement annule." -ForegroundColor Red
    exit
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Write-Host "Creation d'une sauvegarde sur le serveur..." -ForegroundColor Yellow

# Creation de la sauvegarde
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p /root/backup-$timestamp"
ssh "${VPS_USER}@${VPS_HOST}" "cp -r ${VPS_PATH}/src/views/layouts /root/backup-$timestamp/"

Write-Host "Deploiement des fichiers critiques..." -ForegroundColor Yellow
foreach ($file in $files_to_deploy) {
    if (Test-Path $file) {
        $remote_path = "$VPS_PATH/$($file -replace '\\', '/')"
        $remote_dir = Split-Path $remote_path -Parent
        
        # Creer le repertoire si necessaire
        ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p '$remote_dir'"
        
        # Copier le fichier
        scp $file "${VPS_USER}@${VPS_HOST}:$remote_path"
        Write-Host "OK $file deploye" -ForegroundColor Green
    } else {
        Write-Host "ERREUR Fichier manquant: $file" -ForegroundColor Red
    }
}

Write-Host "Redemarrage du serveur web..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_HOST}" "systemctl restart apache2"

Write-Host "Deploiement termine!" -ForegroundColor Green
Write-Host "Verifiez votre site maintenant" -ForegroundColor Cyan

# Script de déploiement manuel
Write-Host "Déploiement manuel des fichiers essentiels..."

# Configuration
$serverUser = "sebastien"
$serverHost = "82.165.44.88"
$remotePath = "/var/www/html/ecole-st-mathieu"

# Fichiers à déployer
$filesToDeploy = @(
    "src/views/layouts/base.twig",
    "public/assets/css/style.css",
    "public/assets/css/tailwind.css",
    "public/assets/js/inscription-management.js",
    "src/controllers/galleryController.js",
    "src/controllers/inscriptionManagementController.js",
    "src/routes/inscriptionManagementRoutes.js"
)

Write-Host "Fichiers à déployer :"
foreach ($file in $filesToDeploy) {
    if (Test-Path $file) {
        Write-Host "✓ $file"
    } else {
        Write-Host "✗ $file (introuvable)"
    }
}

Write-Host ""
Write-Host "Pour déployer manuellement, utilisez ces commandes :"
Write-Host ""

foreach ($file in $filesToDeploy) {
    if (Test-Path $file) {
        $remoteFIle = $file -replace "\\", "/"
        Write-Host "scp `"$file`" ${serverUser}@${serverHost}:${remotePath}/$remoteFIle"
    }
}

Write-Host ""
Write-Host "Ou utilisez rsync pour synchroniser tout le projet :"
Write-Host "rsync -avz --exclude 'node_modules' --exclude '.git' ./ ${serverUser}@${serverHost}:${remotePath}/"

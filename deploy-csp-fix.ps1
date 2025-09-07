# Script de déploiement rapide des corrections CSP
Write-Host "Déploiement des corrections CSP sur le VPS..." -ForegroundColor Green

# Commandes à exécuter sur le VPS
$commands = @(
    "cd /var/www/project/ecole_st_mathieu",
    "git pull origin dev",
    "pm2 restart all"
)

# Connexion SSH et exécution des commandes
$sshCommand = $commands -join "; "
ssh root@my-vps $sshCommand

Write-Host "Déploiement terminé !" -ForegroundColor Green
Write-Host "Vérifiez votre site sur https://ecole-st-mathieu.ovh" -ForegroundColor Yellow

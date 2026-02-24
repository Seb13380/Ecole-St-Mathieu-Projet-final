# Script de déploiement des modifications du jour
# Date: 30 janvier 2026

Write-Host "🚀 Préparation du déploiement des modifications..." -ForegroundColor Cyan

# Créer le dossier de déploiement
$deployFolder = ".\deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $deployFolder -Force | Out-Null
Write-Host "✅ Dossier créé: $deployFolder" -ForegroundColor Green

# Liste des fichiers modifiés aujourd'hui (critiques)
$filesToDeploy = @(
    "src\views\pages\auth\register.twig",
    "src\views\pages\directeur\credentials.twig",
    "src\views\partials\header.twig"
)

# Copier les fichiers avec leur structure
foreach ($file in $filesToDeploy) {
    $source = $file
    $destination = Join-Path $deployFolder $file
    $destDir = Split-Path $destination -Parent
    
    if (Test-Path $source) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item $source $destination -Force
        Write-Host "✅ Copié: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Fichier non trouvé: $file" -ForegroundColor Yellow
    }
}

# Créer le fichier d'instructions
$instructions = @"
📋 INSTRUCTIONS DE DÉPLOIEMENT VPS
==================================
Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm')

🎯 FICHIERS À TRANSFÉRER:
-------------------------
1. src/views/pages/auth/register.twig
2. src/views/pages/directeur/credentials.twig
3. src/views/partials/header.twig (si modifié)

📦 COMMANDES À EXÉCUTER SUR LE VPS:
-----------------------------------

# 1. Se connecter au VPS via SSH
ssh root@votre-serveur.com

# 2. Aller dans le dossier du projet
cd /var/www/ecole-st-mathieu

# 3. Créer une sauvegarde
cp -r src/views src/views-backup-$(date +%Y%m%d)

# 4. Transférer les fichiers (depuis votre PC local):
# Ouvrir un nouveau terminal PowerShell et exécuter:
scp src/views/pages/auth/register.twig root@votre-serveur:/var/www/ecole-st-mathieu/src/views/pages/auth/
scp src/views/pages/directeur/credentials.twig root@votre-serveur:/var/www/ecole-st-mathieu/src/views/pages/directeur/
scp src/views/partials/header.twig root@votre-serveur:/var/www/ecole-st-mathieu/src/views/partials/

# 5. Vérifier la base de données
mysql -u root -p
# Dans MySQL:
SHOW DATABASES;
# Si 'EcoleSaint-Mathieu' existe avec underscore, créer avec tiret:
CREATE DATABASE IF NOT EXISTS ``ecolesaint-mathieu`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ``ecolesaint-mathieu``;
EXIT;

# 6. Appliquer les migrations Prisma
cd /var/www/ecole-st-mathieu
npx prisma migrate deploy

# 7. Créer les comptes admin (seed.js)
node seed.js

# 8. Redémarrer le serveur Node.js
pm2 restart ecole-st-mathieu
# OU
systemctl restart ecole-st-mathieu
# OU
pkill node && node app.js &

# 9. Vérifier les logs
pm2 logs ecole-st-mathieu
# OU
tail -f /var/log/ecole-st-mathieu.log

✅ MODIFICATIONS APPORTÉES:
--------------------------
1. ✅ Correction titre formulaire inscription (register.twig)
   - Ancien: "Demande d'identifiants de connexion"
   - Nouveau: "Demande d'inscription élève"
   - Ajout lien vers /demande-identifiants

2. ✅ Ajout filtres et recherche (credentials.twig)
   - Recherche textuelle par nom/prénom/email
   - Filtre par statut (PENDING, PROCESSING, COMPLETED, etc.)
   - Tri par date (asc/desc) et nom (A-Z/Z-A)
   - Compteur de résultats dynamique

3. ✅ Correction conflits Git (header.twig)
   - Nettoyage des marqueurs de conflit

🔐 COMPTES ADMIN CRÉÉS:
-----------------------
Email: sgdigitalweb13@gmail.com
Mot de passe: Seb&paul3726

Email: admin@stmathieu.fr
Mot de passe: admin123

⚠️  IMPORTANT:
--------------
- Vérifier que MySQL est démarré sur le VPS
- Base de données: 'ecolesaint-mathieu' (avec tiret)
- Port MySQL: 3306
- Tester après déploiement: http://votre-domaine.com/directeur/credentials

📞 SUPPORT:
-----------
En cas de problème, vérifier:
1. Les logs du serveur Node.js
2. Les logs MySQL
3. Les permissions des fichiers (chmod 644 pour les .twig)
4. Le service MySQL est actif: systemctl status mysql
"@

$instructions | Out-File -FilePath (Join-Path $deployFolder "INSTRUCTIONS.txt") -Encoding UTF8
Write-Host "✅ Instructions créées: INSTRUCTIONS.txt" -ForegroundColor Green

# Créer un script de transfert SCP
$scpScript = @"
# Script de transfert SCP vers le VPS
# Remplacer 'root@votre-serveur' par vos identifiants réels

`$VPS_HOST = "root@votre-serveur.com"
`$VPS_PATH = "/var/www/ecole-st-mathieu"

Write-Host "🚀 Transfert des fichiers vers le VPS..." -ForegroundColor Cyan

scp src/views/pages/auth/register.twig `${VPS_HOST}:`${VPS_PATH}/src/views/pages/auth/
scp src/views/pages/directeur/credentials.twig `${VPS_HOST}:`${VPS_PATH}/src/views/pages/directeur/
scp src/views/partials/header.twig `${VPS_HOST}:`${VPS_PATH}/src/views/partials/

Write-Host "✅ Transfert terminé!" -ForegroundColor Green
Write-Host "⚠️  N'oubliez pas d'exécuter sur le VPS:" -ForegroundColor Yellow
Write-Host "   npx prisma migrate deploy" -ForegroundColor White
Write-Host "   node seed.js" -ForegroundColor White
Write-Host "   pm2 restart ecole-st-mathieu" -ForegroundColor White
"@

$scpScript | Out-File -FilePath (Join-Path $deployFolder "transfert-vps.ps1") -Encoding UTF8
Write-Host "✅ Script SCP créé: transfert-vps.ps1" -ForegroundColor Green

Write-Host ""
Write-Host "✅ DÉPLOIEMENT PRÉPARÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "📁 Dossier: $deployFolder" -ForegroundColor Cyan
Write-Host "📄 Fichiers: $($filesToDeploy.Count) copiés" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Ouvrez le dossier: $deployFolder" -ForegroundColor White
Write-Host "2. Lisez INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "3. Éditez transfert-vps.ps1 avec vos identifiants VPS" -ForegroundColor White
Write-Host "4. Exécutez transfert-vps.ps1" -ForegroundColor White
Write-Host ""

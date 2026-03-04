# Script de déploiement - 4 mars 2026
# Corrections : filtres credentials + compte parent Ingrid

Write-Host "🚀 Déploiement des corrections du 04/03/2026..." -ForegroundColor Cyan

# ----------------------------------------------------------
# ÉTAPE 1 : Préparer le paquet de fichiers
# ----------------------------------------------------------
$deployFolder = ".\deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $deployFolder -Force | Out-Null

$filesToDeploy = @(
    "src\views\pages\directeur\credentials.twig"
)

foreach ($file in $filesToDeploy) {
    if (Test-Path $file) {
        $dest = Join-Path $deployFolder $file
        New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null
        Copy-Item $file $dest -Force
        Write-Host "✅ Copié : $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Non trouvé : $file" -ForegroundColor Yellow
    }
}

# Copier le script SQL pour Ingrid
Copy-Item "fix-ingrid-account.sql" (Join-Path $deployFolder "fix-ingrid-account.sql") -Force
Write-Host "✅ Copié : fix-ingrid-account.sql" -ForegroundColor Green

# ----------------------------------------------------------
# ÉTAPE 2 : Créer les instructions de déploiement VPS
# ----------------------------------------------------------
$instructions = @"
📋 INSTRUCTIONS DE DÉPLOIEMENT VPS - 04/03/2026
================================================

🎯 PROBLÈMES CORRIGÉS :
-----------------------
1. ✅ Filtres "Demandes d'identifiants" (credentials.twig)
   - Les lignes du tableau n'apparaissaient pas à cause d'un bug
     dans l'attribut data-request (mauvaise casse des noms de champs
     + filtre |e(' js') invalide qui pouvait provoquer une erreur Twig).
   - CORRECTION : Attributs data-* individuels sûrs + JS refactorisé.

2. ✅ Connexion parent Ingrid Lebourgeois (fix-ingrid-account.sql)
   - La maman ne pouvait pas se connecter (mot de passe incorrect).
   - CORRECTION : Script SQL pour réinitialiser le mot de passe.
   - Nouveau mot de passe temporaire : EcoleNicolas123!

📦 COMMANDES À EXÉCUTER SUR LE VPS :
--------------------------------------

# 1. Connexion SSH
ssh root@votre-serveur.com

# 2. Sauvegarde rapide
cp /var/www/ecole-st-mathieu/src/views/pages/directeur/credentials.twig \
   /var/www/ecole-st-mathieu/src/views/pages/directeur/credentials.twig.bak-$(date +%Y%m%d)

# 3. Transfert du fichier twig (depuis votre PC, ouvrir un 2e terminal) :
scp src/views/pages/directeur/credentials.twig \
    root@votre-serveur:/var/www/ecole-st-mathieu/src/views/pages/directeur/

# 4. Réinitialiser mot de passe Ingrid sur MySQL :
mysql -u root -p stmathieu < fix-ingrid-account.sql
# (transférer fix-ingrid-account.sql vers le VPS d'abord si nécessaire)
# scp fix-ingrid-account.sql root@votre-serveur:/tmp/
# puis sur le VPS : mysql -u root -p stmathieu < /tmp/fix-ingrid-account.sql

# 5. Redémarrer le serveur Node.js
pm2 restart ecole-st-mathieu
# OU
pm2 reload ecole-st-mathieu --update-env

# 6. Vérifier les logs
pm2 logs ecole-st-mathieu --lines 20

🔐 INFORMATIONS CONNEXION PARENT :
-------------------------------------
Email     : ingrid.lebourgeois@gmail.com
Nouveau MP: EcoleNicolas123!
→ Communiquer ce mot de passe à la maman.
→ Lui conseiller de le changer après connexion.

⚠️  IMPORTANT - SI LA TABLE N'EXISTE PAS :
--------------------------------------------
Si MySQL renvoie une erreur sur fix-ingrid-account.sql (table 'user' inconnue),
vérifier le nom de la base :
  mysql -u root -p -e "SHOW DATABASES;"
  # Utiliser le bon nom dans le script SQL :
  USE nom_de_la_base;

📞 EN CAS DE PROBLÈME :
------------------------
1. pm2 logs ecole-st-mathieu
2. tail -f /var/log/nginx/error.log
3. systemctl status mysql
"@

$instructions | Out-File -FilePath (Join-Path $deployFolder "INSTRUCTIONS.txt") -Encoding UTF8
Write-Host "✅ Instructions : INSTRUCTIONS.txt" -ForegroundColor Green

# ----------------------------------------------------------
# ÉTAPE 3 : Script SCP rapide
# ----------------------------------------------------------
$scpScript = @"
# Script de transfert SCP - 04/03/2026
# Modifier VPS_HOST avec votre adresse réelle

`$VPS_HOST = "root@votre-serveur.com"
`$VPS_PATH = "/var/www/ecole-st-mathieu"

Write-Host "🚀 Transfert vers le VPS..." -ForegroundColor Cyan

scp src/views/pages/directeur/credentials.twig ``${VPS_HOST}:``${VPS_PATH}/src/views/pages/directeur/
scp fix-ingrid-account.sql ``${VPS_HOST}:/tmp/

Write-Host "✅ Transfert terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "Sur le VPS, exécuter :" -ForegroundColor Yellow
Write-Host "  mysql -u root -p stmathieu < /tmp/fix-ingrid-account.sql" -ForegroundColor White
Write-Host "  pm2 restart ecole-st-mathieu" -ForegroundColor White
"@

$scpScript | Out-File -FilePath (Join-Path $deployFolder "transfert-vps.ps1") -Encoding UTF8
Write-Host "✅ Script SCP : transfert-vps.ps1" -ForegroundColor Green

Write-Host ""
Write-Host "✅ PAQUET DE DÉPLOIEMENT PRÊT !" -ForegroundColor Green
Write-Host "📁 Dossier : $deployFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  1. Éditer transfert-vps.ps1 avec l'adresse VPS réelle" -ForegroundColor White
Write-Host "  2. Exécuter transfert-vps.ps1" -ForegroundColor White
Write-Host "  3. Sur le VPS : mysql + pm2 restart (voir INSTRUCTIONS.txt)" -ForegroundColor White
Write-Host ""
Write-Host "📧 Mot de passe temporaire Ingrid : EcoleNicolas123!" -ForegroundColor Magenta

# Script de synchronisation complète Local vers VPS
# Usage: .\sync-to-vps.ps1

param(
    [string]$VpsUser = "seb13380",
    [string]$VpsHost = "seb13380.lws-hosting.com",
    [string]$VpsPath = "/home/seb13380/ecole-st-mathieu",
    [string]$LocalDbName = "ecole_saint_mathieu",
    [string]$VpsDbName = "seb13380_ecole_saint_mathieu",
    [string]$DbUser = "seb13380_ecole",
    [string]$DbPassword = ""
)

Write-Host "🚀 === SYNCHRONISATION LOCALE → VPS ===" -ForegroundColor Green
Write-Host ""

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Veuillez exécuter ce script depuis le répertoire du projet" -ForegroundColor Red
    exit 1
}

# Demander le mot de passe de la base de données s'il n'est pas fourni
if ([string]::IsNullOrEmpty($DbPassword)) {
    $SecurePassword = Read-Host "Mot de passe de la base VPS" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))
}

Write-Host "📋 Paramètres:" -ForegroundColor Yellow
Write-Host "   VPS: $VpsUser@$VpsHost"
Write-Host "   Chemin VPS: $VpsPath"
Write-Host "   Base locale: $LocalDbName"
Write-Host "   Base VPS: $VpsDbName"
Write-Host ""

# Étape 1: Commit et push du code
Write-Host "1️⃣ Synchronisation du code..." -ForegroundColor Cyan
try {
    Write-Host "   📝 Commit des modifications locales..."
    git add .
    $commitMessage = "Sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMessage
    
    Write-Host "   📤 Push vers GitHub..."
    git push origin main
    
    Write-Host "   ✅ Code synchronisé sur GitHub" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Erreur lors du push (peut-être pas de modifications)" -ForegroundColor Yellow
}

# Étape 2: Export de la base de données locale
Write-Host ""
Write-Host "2️⃣ Export de la base de données locale..." -ForegroundColor Cyan
$backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

try {
    Write-Host "   💾 Export en cours..."
    mysqldump -u root -p$env:MYSQL_ROOT_PASSWORD $LocalDbName > $backupFile
    
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length / 1KB
        Write-Host "   ✅ Export réussi: $backupFile ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
    } else {
        throw "Fichier de sauvegarde introuvable"
    }
} catch {
    Write-Host "   ❌ Erreur lors de l'export: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 3: Transfert vers le VPS
Write-Host ""
Write-Host "3️⃣ Transfert vers le VPS..." -ForegroundColor Cyan
try {
    Write-Host "   📤 Upload du backup..."
    scp $backupFile "$VpsUser@$VpsHost`:$VpsPath/"
    
    Write-Host "   ✅ Backup transféré sur le VPS" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors du transfert: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 4: Commandes sur le VPS
Write-Host ""
Write-Host "4️⃣ Mise à jour du VPS..." -ForegroundColor Cyan

$vpsCommands = @"
cd $VpsPath
echo '📥 Pull du code depuis GitHub...'
git pull origin main

echo '🔄 Installation/mise à jour des dépendances...'
npm ci --production

echo '💾 Import de la base de données...'
mysql -u $DbUser -p'$DbPassword' $VpsDbName < $backupFile

echo '🗑️ Nettoyage du fichier de backup...'
rm $backupFile

echo '🔄 Redémarrage de l'\''application...'
pm2 restart ecole-app || pm2 start app.js --name ecole-app

echo '✅ Synchronisation terminée !'
"@

try {
    Write-Host "   🔧 Exécution des commandes sur le VPS..."
    ssh "$VpsUser@$VpsHost" $vpsCommands
    
    Write-Host "   ✅ VPS mis à jour avec succès" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors de la mise à jour VPS: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 5: Nettoyage local
Write-Host ""
Write-Host "5️⃣ Nettoyage..." -ForegroundColor Cyan
try {
    Remove-Item $backupFile -Force
    Write-Host "   🗑️ Fichier de backup local supprimé" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Impossible de supprimer le backup local" -ForegroundColor Yellow
}

# Résumé final
Write-Host ""
Write-Host "🎉 === SYNCHRONISATION TERMINÉE ===" -ForegroundColor Green
Write-Host "✅ Code synchronisé via GitHub" -ForegroundColor Green
Write-Host "✅ Base de données exportée et importée" -ForegroundColor Green
Write-Host "✅ Application redémarrée sur le VPS" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Votre site est à jour sur: https://$VpsHost" -ForegroundColor Cyan
Write-Host ""

# Test de connectivité (optionnel)
Write-Host "🔍 Test de connectivité..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://$VpsHost" -Method HEAD -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site accessible et fonctionnel !" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Site peut-être en cours de redémarrage..." -ForegroundColor Yellow
}

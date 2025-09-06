# Script de synchronisation simplifiée - TEST
# Usage: .\sync-quick.ps1

Write-Host "🚀 === SYNCHRONISATION RAPIDE LOCAL → VPS ===" -ForegroundColor Green
Write-Host ""

# Paramètres (modifiez selon vos besoins)
$VpsUser = "root"
$VpsHost = "82.165.44.88"
$VpsPath = "/root/ecole-st-mathieu"
$LocalDbName = "ecole_saint_mathieu"
$VpsDbName = "seb13380_ecole_saint_mathieu"
$DbUser = "seb13380_ecole"

# Demander le mot de passe
$DbPassword = Read-Host "Mot de passe base VPS" -AsSecureString
$DbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword))

try {
    # 1. Commit et push
    Write-Host "1️⃣ Code..." -ForegroundColor Cyan
    git add . 2>$null
    git commit -m "Sync auto $(Get-Date -Format 'dd/MM HH:mm')" 2>$null
    git push origin main 2>$null
    Write-Host "   ✅ Code pushé" -ForegroundColor Green

    # 2. Export base locale
    Write-Host "2️⃣ Export base..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "quick_backup_$timestamp.sql"
    
    # Utiliser mysqldump avec gestion d'erreur
    $exportCmd = "mysqldump -u root --single-transaction --routines --triggers $LocalDbName"
    if ($env:MYSQL_ROOT_PASSWORD) {
        $exportCmd += " -p$env:MYSQL_ROOT_PASSWORD"
    }
    
    Invoke-Expression "$exportCmd > $backupFile"
    
    if (Test-Path $backupFile) {
        $size = [math]::Round((Get-Item $backupFile).Length / 1KB, 1)
        Write-Host "   ✅ Export OK ($size KB)" -ForegroundColor Green
    } else {
        throw "Export échoué"
    }

    # 3. Transfert et mise à jour VPS
    Write-Host "3️⃣ VPS..." -ForegroundColor Cyan
    
    # Transfert du backup
    scp $backupFile "$VpsUser@$VpsHost`:$VpsPath/" 2>$null
    
    # Commandes VPS en une seule connexion SSH
    $vpsScript = @"
cd $VpsPath && \
git pull origin main && \
mysql -u $DbUser -p'$DbPasswordPlain' $VpsDbName < $backupFile && \
rm $backupFile && \
pm2 restart ecole-app 2>/dev/null || pm2 start app.js --name ecole-app
"@
    
    ssh "$VpsUser@$VpsHost" $vpsScript 2>$null
    Write-Host "   ✅ VPS mis à jour" -ForegroundColor Green

    # 4. Nettoyage
    Remove-Item $backupFile -Force 2>$null

    Write-Host ""
    Write-Host "🎉 SYNCHRONISATION TERMINÉE !" -ForegroundColor Green
    Write-Host "🌐 Site: https://$VpsHost" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Vérifiez vos identifiants et la connectivité" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer"

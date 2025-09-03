# Script pour synchroniser SEULEMENT la base de données
# Usage: .\sync-db-only.ps1

Write-Host "💾 === SYNCHRONISATION BASE DE DONNÉES SEULEMENT ===" -ForegroundColor Blue
Write-Host ""

# Paramètres
$VpsUser = "root"
$VpsHost = "82.165.44.88"
$VpsPath = "/root/ecole-st-mathieu"
$LocalDbName = "ecole_saint_mathieu"
$VpsDbName = "seb13380_ecole_saint_mathieu"
$DbUser = "seb13380_ecole"

Write-Host "📋 Cette opération va :"
Write-Host "   • Exporter votre base locale ($LocalDbName)"
Write-Host "   • L'importer sur le VPS ($VpsDbName)"
Write-Host "   • ÉCRASER toutes les données VPS existantes"
Write-Host ""

$confirm = Read-Host "Continuer ? (oui/non)"
if ($confirm -ne "oui") {
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit
}

$DbPassword = Read-Host "Mot de passe base VPS" -AsSecureString
$DbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword))

try {
    # Export base locale
    Write-Host "📤 Export de la base locale..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "db_sync_$timestamp.sql"
    
    mysqldump -u root --single-transaction --routines --triggers $LocalDbName > $backupFile
    
    if (Test-Path $backupFile) {
        $size = [math]::Round((Get-Item $backupFile).Length / 1KB, 1)
        Write-Host "✅ Export réussi: $size KB" -ForegroundColor Green
    } else {
        throw "Export échoué"
    }

    # Transfer vers VPS
    Write-Host "📤 Transfert vers VPS..." -ForegroundColor Cyan
    scp $backupFile "$VpsUser@$VpsHost`:$VpsPath/"
    Write-Host "✅ Fichier transféré" -ForegroundColor Green

    # Import sur VPS
    Write-Host "📥 Import sur VPS..." -ForegroundColor Cyan
    $importCommand = "cd $VpsPath; mysql -u $DbUser -p`"$DbPasswordPlain`" $VpsDbName `< $backupFile; rm $backupFile"
    ssh "$VpsUser@$VpsHost" "$importCommand"
    Write-Host "✅ Base importée sur VPS" -ForegroundColor Green

    # Nettoyage local
    Remove-Item $backupFile -Force
    
    Write-Host ""
    Write-Host "🎉 BASE DE DONNÉES SYNCHRONISÉE !" -ForegroundColor Green
    Write-Host "📊 Vos documents uploadés sont maintenant sur le VPS" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer"

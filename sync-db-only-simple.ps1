# Script simple de synchronisation base de données
# Synchro Local -> VPS (IONOS)

# Configuration
$LocalDbName = "ecole_st_mathieu"
$VpsHost = "82.165.44.88"
$VpsUser = "root"
$VpsPath = "/root/ecole-st-mathieu"
$VpsDbName = "seb13380_ecole_saint_mathieu"
$DbUser = "root"
$DbPasswordPlain = "lxANI8kJ"

# Chemins MySQL
$MySqlPath = "C:\Program Files\MySQL\MySQL Workbench 8.0 CE"
$MySqlDump = "$MySqlPath\mysqldump.exe"
$MySql = "$MySqlPath\mysql.exe"

Write-Host ""
Write-Host "SYNCHRONISATION BASE DE DONNEES" -ForegroundColor Yellow
Write-Host "Local -> VPS" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cette operation va :"
Write-Host "  - Exporter votre base locale ($LocalDbName)"
Write-Host "  - L'importer sur le VPS ($VpsDbName)"
Write-Host "  - ECRASER toutes les donnees VPS existantes"
Write-Host ""

$confirm = Read-Host "Continuer ? (oui/non)"
if ($confirm -ne "oui") {
    Write-Host "Operation annulee" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "DEBUT SYNCHRONISATION..." -ForegroundColor Green

try {
    # Export base locale
    Write-Host "Export de la base locale..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "db_sync_$timestamp.sql"
    
    & $MySqlDump -u root --single-transaction --routines --triggers $LocalDbName | Out-File -FilePath $backupFile -Encoding UTF8
    
    if (Test-Path $backupFile) {
        $size = [math]::Round((Get-Item $backupFile).Length / 1KB, 1)
        Write-Host "Export reussi: $size KB" -ForegroundColor Green
    } else {
        throw "Echec export"
    }

    # Transfert vers VPS
    Write-Host "Transfert vers VPS..." -ForegroundColor Cyan
    scp $backupFile "$VpsUser@$VpsHost`:$VpsPath/"
    Write-Host "Fichier transfere" -ForegroundColor Green

    # Import sur VPS
    Write-Host "Import sur VPS..." -ForegroundColor Cyan
    ssh "$VpsUser@$VpsHost" "cd $VpsPath && mysql -u $DbUser -p$DbPasswordPlain $VpsDbName < $backupFile && rm $backupFile"
    Write-Host "Base importee sur VPS" -ForegroundColor Green

    # Nettoyage local
    Remove-Item $backupFile -Force
    
    Write-Host ""
    Write-Host "BASE DE DONNEES SYNCHRONISEE !" -ForegroundColor Green
    Write-Host "Vos documents uploades sont maintenant sur le VPS" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    
    # Nettoyage en cas d'erreur
    if (Test-Path $backupFile) {
        Remove-Item $backupFile -Force
        Write-Host "Fichier temporaire supprime" -ForegroundColor Yellow
    }
    
    exit 1
}

Write-Host ""
Write-Host "SYNCHRONISATION TERMINEE" -ForegroundColor Green

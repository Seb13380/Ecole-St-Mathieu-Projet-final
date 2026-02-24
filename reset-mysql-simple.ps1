# Réinitialisation complète MySQL
Write-Host "🔧 Réinitialisation MySQL via Laragon..." -ForegroundColor Cyan

# Arrêter MySQL
Write-Host "1. Arrêt de MySQL..." -ForegroundColor Yellow
Stop-Process -Name "mysqld" -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# Démarrer MySQL sans vérification de privilèges
Write-Host "2. Démarrage en mode sécurisé..." -ForegroundColor Yellow
$dataDir = "C:\laragon\data\mysql"
$mysqlExe = "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe"

# Lancer mysqld en mode skip-grant-tables
$job = Start-Job -ScriptBlock {
    param($exe, $data)
    & $exe --datadir=$data --skip-grant-tables --console
} -ArgumentList $mysqlExe, $dataDir

Start-Sleep 8

# Se connecter et réinitialiser
Write-Host "3. Réinitialisation du mot de passe..." -ForegroundColor Yellow
$sqlCommands = @"
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
"@

$sqlCommands | & "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root 2>&1

# Arrêter le job
Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -ErrorAction SilentlyContinue
Stop-Process -Name "mysqld" -Force -ErrorAction SilentlyContinue
Start-Sleep 2

Write-Host "`n✅ Terminé ! Nouveau mot de passe root : 'root'" -ForegroundColor Green
Write-Host "   Redémarrez MySQL dans Laragon`n" -ForegroundColor Yellow

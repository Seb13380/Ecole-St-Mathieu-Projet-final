# Script de réinitialisation du mot de passe MySQL root
Write-Host "🔧 Réinitialisation du mot de passe MySQL root..." -ForegroundColor Cyan

# 1. Arrêter tous les processus MySQL
Write-Host "`n1. Arrêt de MySQL..." -ForegroundColor Yellow
taskkill /F /IM mysqld.exe 2>$null
Start-Sleep -Seconds 2

# 2. Créer le fichier de réinitialisation
Write-Host "2. Création du fichier de réinitialisation..." -ForegroundColor Yellow
$resetFile = "$env:TEMP\mysql-init.txt"
"ALTER USER 'root'@'localhost' IDENTIFIED BY '';" | Out-File -FilePath $resetFile -Encoding ASCII

# 3. Démarrer MySQL avec le fichier d'initialisation
Write-Host "3. Démarrage de MySQL avec réinitialisation..." -ForegroundColor Yellow
$mysqlPath = "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe"
$dataPath = "C:\laragon\data\mysql"

$process = Start-Process -FilePath $mysqlPath -ArgumentList "--init-file=`"$resetFile`"", "--datadir=`"$dataPath`"" -PassThru
Start-Sleep -Seconds 5

# 4. Arrêter MySQL
Write-Host "4. Arrêt de MySQL..." -ForegroundColor Yellow
taskkill /F /IM mysqld.exe 2>$null
Start-Sleep -Seconds 2

# 5. Nettoyer
Remove-Item $resetFile -ErrorAction SilentlyContinue

Write-Host "`n✅ Réinitialisation terminée !" -ForegroundColor Green
Write-Host "   Le mot de passe root est maintenant VIDE" -ForegroundColor Green
Write-Host "`n⚠️  Redémarrez MySQL via Laragon (bouton 'Start')" -ForegroundColor Yellow
Write-Host "   Ensuite, essayez de vous connecter dans Workbench SANS mot de passe`n" -ForegroundColor Yellow

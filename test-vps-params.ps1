# Script de test des paramètres VPS
# Usage: .\test-vps-params.ps1

Write-Host "🔍 === TEST DES PARAMÈTRES VPS ===" -ForegroundColor Cyan
Write-Host ""

# Paramètres à tester
$VpsUser = "seb13380"
$VpsHost = "seb13380.lws-hosting.com"
$VpsPath = "/home/seb13380/ecole-st-mathieu"
$DbUser = "seb13380_ecole"
$DbPassword = "lxANI8kJ"
$VpsDbName = "seb13380_ecole_saint_mathieu"

Write-Host "📋 Paramètres à tester:" -ForegroundColor Yellow
Write-Host "   Host: $VpsHost"
Write-Host "   User: $VpsUser"
Write-Host "   Path: $VpsPath"
Write-Host "   DB User: $DbUser"
Write-Host "   DB Name: $VpsDbName"
Write-Host ""

# Test 1: Connectivité SSH
Write-Host "1️⃣ Test connectivité SSH..." -ForegroundColor Cyan
try {
    $sshTest = ssh -o ConnectTimeout=10 "$VpsUser@$VpsHost" "echo 'SSH OK'"
    if ($sshTest -eq "SSH OK") {
        Write-Host "   ✅ SSH fonctionne" -ForegroundColor Green
    } else {
        Write-Host "   ❌ SSH problème: $sshTest" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ SSH impossible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Répertoire projet
Write-Host "2️⃣ Test répertoire projet..." -ForegroundColor Cyan
try {
    $pathTest = ssh "$VpsUser@$VpsHost" "ls -la $VpsPath/package.json 2>/dev/null || echo 'NOT_FOUND'"
    if ($pathTest -notlike "*NOT_FOUND*") {
        Write-Host "   ✅ Répertoire projet trouvé" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Répertoire projet introuvable" -ForegroundColor Red
        Write-Host "   💡 Vérifiez le chemin: $VpsPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur test répertoire" -ForegroundColor Red
}

# Test 3: Base de données
Write-Host "3️⃣ Test base de données..." -ForegroundColor Cyan
try {
    $dbTest = ssh "$VpsUser@$VpsHost" "mysql -u $DbUser -p'$DbPassword' $VpsDbName -e 'SELECT COUNT(*) as test_count FROM User;' 2>/dev/null || echo 'DB_ERROR'"
    if ($dbTest -notlike "*DB_ERROR*") {
        Write-Host "   ✅ Base de données accessible" -ForegroundColor Green
        if ($dbTest -match "test_count") {
            Write-Host "   📊 Table User trouvée" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Base de données inaccessible" -ForegroundColor Red
        Write-Host "   💡 Vérifiez: user=$DbUser, db=$VpsDbName, password" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur test DB" -ForegroundColor Red
}

# Test 4: PM2 (gestionnaire de processus)
Write-Host "4️⃣ Test PM2..." -ForegroundColor Cyan
try {
    $pm2Test = ssh "$VpsUser@$VpsHost" "pm2 list 2>/dev/null | grep ecole-app || echo 'PM2_NOT_RUNNING'"
    if ($pm2Test -notlike "*PM2_NOT_RUNNING*") {
        Write-Host "   ✅ PM2 et ecole-app detectes" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ ecole-app pas en cours via PM2" -ForegroundColor Yellow
        Write-Host "   💡 L'app sera demarree lors de la sync" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Erreur test PM2" -ForegroundColor Red
}

# Test 5: Site web accessible
Write-Host "5️⃣ Test site web..." -ForegroundColor Cyan
try {
    $webTest = Invoke-WebRequest -Uri "https://$VpsHost" -Method HEAD -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    if ($webTest.StatusCode -eq 200) {
        Write-Host "   ✅ Site web accessible (Code: $($webTest.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Site web inaccessible ou en cours de redemarrage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 === RESUME ===" -ForegroundColor Green
Write-Host "Si tous les tests sont ✅, vous pouvez utiliser:" -ForegroundColor White
Write-Host "   .\sync-quick.ps1      (synchronisation complete)" -ForegroundColor Cyan
Write-Host "   .\sync-db-only.ps1    (base de donnees seulement)" -ForegroundColor Cyan
Write-Host ""
Read-Host "Appuyez sur Entree pour continuer"

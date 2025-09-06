# Test simple des parametres VPS
Write-Host "Test parametres VPS..." -ForegroundColor Cyan

$VpsUser = "root"
$VpsHost = "82.165.44.88"
$VpsPath = "/home/seb13380/ecole-st-mathieu"  # A verifier
$DbUser = "seb13380_ecole"
$DbPassword = "lxANI8kJ"
$VpsDbName = "seb13380_ecole_saint_mathieu"

Write-Host "Host: $VpsHost"
Write-Host "User: $VpsUser" 
Write-Host "DB: $VpsDbName"
Write-Host ""

# Test SSH
Write-Host "1. Test SSH..." -ForegroundColor Yellow
try {
    $result = ssh -o ConnectTimeout=10 "$VpsUser@$VpsHost" "echo 'SSH_OK'"
    if ($result -eq "SSH_OK") {
        Write-Host "SSH: OK" -ForegroundColor Green
    } else {
        Write-Host "SSH: ERREUR" -ForegroundColor Red
    }
} catch {
    Write-Host "SSH: ECHEC" -ForegroundColor Red
}

# Test repertoire
Write-Host "2. Test repertoire..." -ForegroundColor Yellow
try {
    $result = ssh "$VpsUser@$VpsHost" "ls $VpsPath/package.json 2>/dev/null && echo 'PATH_OK' || echo 'PATH_ERROR'"
    if ($result -like "*PATH_OK*") {
        Write-Host "Repertoire: OK" -ForegroundColor Green
    } else {
        Write-Host "Repertoire: ERREUR" -ForegroundColor Red
    }
} catch {
    Write-Host "Repertoire: ECHEC" -ForegroundColor Red
}

# Test base
Write-Host "3. Test base de donnees..." -ForegroundColor Yellow
try {
    $result = ssh "$VpsUser@$VpsHost" "mysql -u $DbUser -p'$DbPassword' $VpsDbName -e 'SELECT 1;' 2>/dev/null && echo 'DB_OK' || echo 'DB_ERROR'"
    if ($result -like "*DB_OK*") {
        Write-Host "Base: OK" -ForegroundColor Green
    } else {
        Write-Host "Base: ERREUR" -ForegroundColor Red
    }
} catch {
    Write-Host "Base: ECHEC" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test termine!" -ForegroundColor Cyan
Read-Host "Appuyez sur Entree"

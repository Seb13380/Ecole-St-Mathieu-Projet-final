# Test connexion VPS avec parametres corriges
Write-Host "Test connexion VPS IONOS..." -ForegroundColor Cyan

$VpsHost = "82.165.44.88"
$VpsUser = "root"
$VpsPassword = "lxANI8kJ"

Write-Host "IP: $VpsHost"
Write-Host "User: $VpsUser"
Write-Host ""

# Test 1: Ping de base
Write-Host "1. Test ping..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName $VpsHost -Count 2 -Quiet
    if ($ping) {
        Write-Host "Ping: OK - Serveur accessible" -ForegroundColor Green
    } else {
        Write-Host "Ping: ECHEC - Serveur inaccessible" -ForegroundColor Red
    }
} catch {
    Write-Host "Ping: ERREUR" -ForegroundColor Red
}

# Test 2: Port SSH (22)
Write-Host "2. Test port SSH..." -ForegroundColor Yellow
try {
    $tcpTest = Test-NetConnection -ComputerName $VpsHost -Port 22 -WarningAction SilentlyContinue
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "Port SSH 22: OUVERT" -ForegroundColor Green
    } else {
        Write-Host "Port SSH 22: FERME" -ForegroundColor Red
    }
} catch {
    Write-Host "Port SSH: ERREUR" -ForegroundColor Red
}

# Info sur SSH
Write-Host ""
Write-Host "Pour tester SSH manuellement:" -ForegroundColor Cyan
Write-Host "ssh root@$VpsHost" -ForegroundColor White
Write-Host "(tapez le mot de passe sans qu'il s'affiche)" -ForegroundColor Yellow
Write-Host ""

# Test web si un serveur web tourne
Write-Host "3. Test serveur web..." -ForegroundColor Yellow
try {
    $web = Invoke-WebRequest -Uri "http://$VpsHost" -Method HEAD -TimeoutSec 10 -ErrorAction Stop
    Write-Host "Web HTTP: ACTIF (Code: $($web.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Web HTTP: INACTIF ou pas configure" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test termine!" -ForegroundColor Cyan
Read-Host "Appuyez sur Entree"

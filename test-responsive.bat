@echo off
echo ================================================
echo     TEST DU HEADER RESPONSIVE - ECOLE ST MATHIEU
echo ================================================
echo.

:: Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté : 
node --version

:: Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo.
    echo 📦 Installation des dépendances...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
)

echo.
echo 🚀 Démarrage du serveur...
echo.
echo 📱 Pour tester le responsive :
echo    - Ouvrez http://localhost:3000 dans votre navigateur
echo    - Utilisez les outils développeur (F12) pour tester différentes tailles
echo    - Testez sur mobile en utilisant le simulateur du navigateur
echo.
echo 🔍 Page de test dédiée : http://localhost:3000/test-responsive.html
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

:: Démarrer le serveur Node.js
node app.js

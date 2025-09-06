@echo off
REM Script de déploiement pour Windows/VPS

echo 🚀 Démarrage du déploiement...

REM Installation des dépendances
echo 📦 Installation des dépendances...
npm install

REM Build Tailwind CSS
echo 🎨 Compilation de Tailwind CSS...
npm run build:tailwind

REM Génération du client Prisma
echo 🗄️ Génération du client Prisma...
npm run prisma:generate

REM Vérification que le fichier CSS existe
if exist ".\public\css\output.css" (
    echo ✅ Tailwind CSS compilé avec succès
) else (
    echo ❌ Erreur: Tailwind CSS non compilé
    exit /b 1
)

REM Démarrage de l'application
echo 🎯 Démarrage de l'application...
npm start

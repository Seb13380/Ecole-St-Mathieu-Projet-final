#!/bin/bash

# Script de déploiement pour VPS
echo "🚀 Démarrage du déploiement..."

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build Tailwind CSS
echo "🎨 Compilation de Tailwind CSS..."
npm run build:tailwind

# Génération du client Prisma
echo "🗄️ Génération du client Prisma..."
npm run prisma:generate

# Vérification que le fichier CSS existe
if [ -f "./public/css/output.css" ]; then
    echo "✅ Tailwind CSS compilé avec succès"
else
    echo "❌ Erreur: Tailwind CSS non compilé"
    exit 1
fi

# Démarrage de l'application
echo "🎯 Démarrage de l'application..."
npm start

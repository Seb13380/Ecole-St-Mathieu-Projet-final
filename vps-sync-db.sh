#!/bin/bash

echo "🔄 Synchronisation de la base de données sur le VPS..."

# Aller dans le répertoire du projet
cd /var/www/project/ecole_st_mathieu

echo "📦 Installation/mise à jour des dépendances..."
npm install

echo "🗄️ Synchronisation du schéma de base de données..."
npx prisma db push --force-reset

echo "🔧 Génération du client Prisma..."
npx prisma generate

echo "🔄 Redémarrage de PM2..."
pm2 restart ecole

echo "📊 Statut de PM2..."
pm2 status

echo "📋 Affichage des logs..."
pm2 logs ecole --lines 10

echo "✅ Synchronisation terminée !"

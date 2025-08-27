#!/bin/bash

# Script de déploiement sécurisé pour le VPS
# Préserve les fichiers uploadés par les utilisateurs

echo "🚀 DÉPLOIEMENT SÉCURISÉ - École Saint-Mathieu"
echo "============================================="

# Variables
BACKUP_DIR="/tmp/backup_ecole_$(date +%Y%m%d_%H%M%S)"
APP_DIR="/var/www/project/ecole_st_mathieu"

# Créer le dossier de sauvegarde
mkdir -p "$BACKUP_DIR"

echo "📁 Sauvegarde des fichiers utilisateurs..."

# Sauvegarder les uploads existants
if [ -d "$APP_DIR/public/uploads" ]; then
    cp -r "$APP_DIR/public/uploads" "$BACKUP_DIR/"
    echo "✅ Uploads sauvegardés"
fi

if [ -d "$APP_DIR/public/images" ]; then
    cp -r "$APP_DIR/public/images" "$BACKUP_DIR/"
    echo "✅ Images sauvegardées"
fi

if [ -d "$APP_DIR/public/documents" ]; then
    cp -r "$APP_DIR/public/documents" "$BACKUP_DIR/"
    echo "✅ Documents sauvegardés"
fi

echo "🔄 Mise à jour du code..."

# Aller dans le répertoire de l'application
cd "$APP_DIR"

# Sauvegarder les modifications locales si il y en a
git stash push -m "Sauvegarde automatique avant déploiement $(date)"

# Récupérer les dernières modifications
git pull origin main

# Installer les nouvelles dépendances si nécessaire
npm install

echo "📂 Restauration des fichiers utilisateurs..."

# Restaurer les uploads
if [ -d "$BACKUP_DIR/uploads" ]; then
    cp -r "$BACKUP_DIR/uploads"/* "$APP_DIR/public/uploads/" 2>/dev/null || true
    echo "✅ Uploads restaurés"
fi

if [ -d "$BACKUP_DIR/images" ]; then
    cp -r "$BACKUP_DIR/images"/* "$APP_DIR/public/images/" 2>/dev/null || true
    echo "✅ Images restaurées"
fi

if [ -d "$BACKUP_DIR/documents" ]; then
    cp -r "$BACKUP_DIR/documents"/* "$APP_DIR/public/documents/" 2>/dev/null || true
    echo "✅ Documents restaurés"
fi

echo "🔄 Redémarrage de l'application..."

# Redémarrer l'application (PM2 ou autre)
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo "✅ Application redémarrée avec PM2"
else
    # Si pas de PM2, tuer et relancer Node
    pkill -f "node.*app.js" || true
    nohup node app.js > /dev/null 2>&1 &
    echo "✅ Application redémarrée"
fi

echo "🎉 Déploiement terminé !"
echo "📋 Sauvegarde disponible dans: $BACKUP_DIR"
echo ""
echo "🔍 Vérifiez que l'application fonctionne:"
echo "   curl -I http://localhost:3000"

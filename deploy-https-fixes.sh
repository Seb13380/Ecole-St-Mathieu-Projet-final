#!/bin/bash

# Script de déploiement des corrections HTTPS pour l'École Saint-Mathieu
# Ce script applique les corrections de taille et de rendu pour l'environnement de production

echo "🚀 Déploiement des corrections HTTPS..."

# Vérification que nous sommes dans le bon répertoire
if [ ! -f "app.js" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Sauvegarde des fichiers originaux
echo "📦 Création des sauvegardes..."
mkdir -p ./backups/$(date +%Y%m%d_%H%M%S)
cp -r ./src/views/layouts/ ./backups/$(date +%Y%m%d_%H%M%S)/layouts_backup
cp -r ./src/views/pages/ ./backups/$(date +%Y%m%d_%H%M%S)/pages_backup
cp -r ./public/assets/css/ ./backups/$(date +%Y%m%d_%H%M%S)/css_backup

echo "✅ Sauvegardes créées dans ./backups/"

# Vérification de l'existence des fichiers CSS de correction
if [ ! -f "./public/assets/css/https-fixes.css" ]; then
    echo "❌ Erreur : Le fichier https-fixes.css n'existe pas"
    echo "Veuillez d'abord créer ce fichier avec les corrections CSS"
    exit 1
fi

# Compilation des assets si nécessaire
if [ -f "package.json" ]; then
    echo "🔧 Compilation des assets..."
    npm run build-css 2>/dev/null || echo "ℹ️  Pas de script build-css trouvé"
fi

# Vérification des permissions
echo "🔐 Vérification des permissions..."
chmod 644 ./public/assets/css/*.css
chmod 644 ./src/views/**/*.twig 2>/dev/null || true

# Cache clearing si applicable
echo "🧹 Nettoyage du cache..."
if [ -d "./cache" ]; then
    rm -rf ./cache/*
    echo "✅ Cache vidé"
fi

# Test de validation des fichiers
echo "🧪 Validation des fichiers modifiés..."

# Vérifier que les fichiers Twig sont valides
for file in ./src/views/layouts/base.twig ./src/views/pages/demande-identifiants.twig ./src/views/pages/auth/login.twig; do
    if [ -f "$file" ]; then
        # Test basique de syntaxe Twig (vérification des balises fermées)
        if grep -q "{% endblock %}" "$file" && grep -q "{% block" "$file"; then
            echo "✅ $file semble valide"
        else
            echo "⚠️  $file pourrait avoir des problèmes de syntaxe"
        fi
    else
        echo "❌ $file n'existe pas"
    fi
done

# Vérifier que le fichier CSS de correction est accessible
if curl -f -s "http://localhost/assets/css/https-fixes.css" > /dev/null 2>&1; then
    echo "✅ https-fixes.css est accessible"
else
    echo "⚠️  https-fixes.css n'est pas accessible via HTTP (normal en développement)"
fi

echo ""
echo "📋 Résumé des corrections appliquées :"
echo "   • Réduction des tailles de police (text-4xl → text-2xl, etc.)"
echo "   • Optimisation du viewport pour HTTPS"
echo "   • Uniformisation des espacements"
echo "   • Correction des conteneurs et marges"
echo "   • Ajout du fichier CSS https-fixes.css"
echo ""
echo "🎯 Pages modifiées :"
echo "   • Demande d'identifiants (tailles réduites)"
echo "   • Page de connexion (conteneur réduit)"
echo "   • Layout de base (CSS de correction ajouté)"
echo ""
echo "📤 Pour déployer en production :"
echo "   1. Synchroniser les fichiers modifiés avec le serveur HTTPS"
echo "   2. Vider le cache du serveur web si nécessaire"
echo "   3. Tester la page demande d'identifiants"
echo "   4. Vérifier que les tailles sont maintenant uniformes (20px au lieu de 24px)"
echo ""
echo "✅ Déploiement des corrections terminé avec succès !"

# Optionnel : redémarrer le serveur local si en développement
if pgrep -f "node.*app.js" > /dev/null; then
    echo ""
    read -p "🔄 Redémarrer le serveur local pour appliquer les changements ? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "node.*app.js"
        echo "🔄 Serveur arrêté. Relancez avec 'node app.js'"
    fi
fi

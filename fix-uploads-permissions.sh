#!/bin/bash
# Script de correction automatique des permissions pour les uploads

echo "======================================"
echo "🔧 CORRECTION DES PERMISSIONS"
echo "======================================"
echo ""

# Chemin du dossier uploads
UPLOADS_DIR="./public/uploads/documents"

echo "📁 Cible: $UPLOADS_DIR"
echo ""

# Créer le dossier s'il n'existe pas
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "📂 Création du dossier..."
    mkdir -p "$UPLOADS_DIR"
    echo "✅ Dossier créé"
fi

echo ""
echo "🔧 Application des corrections..."
echo ""

# Obtenir l'utilisateur actuel
CURRENT_USER=$(whoami)
echo "👤 Utilisateur actuel: $CURRENT_USER"

# Option 1: Propriétaire = utilisateur actuel, groupe = www-data
echo ""
echo "1️⃣ Tentative de correction avec www-data..."
if sudo chown -R $CURRENT_USER:www-data "$UPLOADS_DIR" 2>/dev/null; then
    echo "✅ Propriétaire modifié: $CURRENT_USER:www-data"
    sudo chmod -R 775 "$UPLOADS_DIR"
    echo "✅ Permissions modifiées: 775"
else
    echo "⚠️ www-data non disponible, utilisation du groupe par défaut"
    # Option 2: Propriétaire et groupe = utilisateur actuel
    chown -R $CURRENT_USER:$CURRENT_USER "$UPLOADS_DIR" 2>/dev/null
    chmod -R 755 "$UPLOADS_DIR"
    echo "✅ Propriétaire modifié: $CURRENT_USER:$CURRENT_USER"
    echo "✅ Permissions modifiées: 755"
fi

echo ""
echo "📋 Vérification des permissions:"
ls -la "$UPLOADS_DIR" | head -5

echo ""
echo "✍️ Test d'écriture..."
TEST_FILE="$UPLOADS_DIR/test-correction-$(date +%s).txt"
if touch "$TEST_FILE" 2>/dev/null; then
    echo "✅ Test d'écriture réussi"
    rm -f "$TEST_FILE"
else
    echo "❌ Test d'écriture échoué"
    echo ""
    echo "💡 Essayez cette commande manuellement:"
    echo "   sudo chown -R $CURRENT_USER:www-data $UPLOADS_DIR"
    echo "   sudo chmod -R 775 $UPLOADS_DIR"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ CORRECTION TERMINÉE"
echo "======================================"
echo ""
echo "💡 Pensez à redémarrer l'application:"
echo "   pm2 restart all"
echo ""

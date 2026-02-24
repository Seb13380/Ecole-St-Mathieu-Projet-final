#!/bin/bash
# Script de diagnostic des permissions pour les uploads de documents

echo "======================================"
echo "🔍 DIAGNOSTIC UPLOADS DOCUMENTS"
echo "======================================"
echo ""

# Chemin du dossier uploads
UPLOADS_DIR="./public/uploads/documents"

echo "📁 Vérification du dossier: $UPLOADS_DIR"
echo ""

# Vérifier si le dossier existe
if [ -d "$UPLOADS_DIR" ]; then
    echo "✅ Le dossier existe"
    
    # Afficher les permissions
    echo ""
    echo "📋 Permissions actuelles:"
    ls -la "$UPLOADS_DIR"
    
    echo ""
    echo "📋 Propriétaire du dossier:"
    stat -c "Propriétaire: %U (UID: %u), Groupe: %G (GID: %g)" "$UPLOADS_DIR"
    
    echo ""
    echo "📋 Permissions octales:"
    stat -c "Permissions: %a" "$UPLOADS_DIR"
    
    # Tester l'écriture
    echo ""
    echo "✍️ Test d'écriture..."
    TEST_FILE="$UPLOADS_DIR/test-write-$(date +%s).txt"
    if touch "$TEST_FILE" 2>/dev/null; then
        echo "✅ Écriture possible"
        rm -f "$TEST_FILE"
    else
        echo "❌ ERREUR: Impossible d'écrire dans le dossier"
        echo "💡 Solution: Exécutez les commandes suivantes:"
        echo "   sudo chown -R www-data:www-data $UPLOADS_DIR"
        echo "   sudo chmod -R 755 $UPLOADS_DIR"
    fi
    
else
    echo "❌ Le dossier n'existe PAS"
    echo "💡 Création du dossier..."
    mkdir -p "$UPLOADS_DIR"
    chmod 755 "$UPLOADS_DIR"
    echo "✅ Dossier créé"
fi

echo ""
echo "======================================"
echo "🔍 PROCESSUS NODE.JS"
echo "======================================"
echo ""

# Afficher l'utilisateur qui exécute Node.js
echo "👤 Utilisateur Node.js actuel:"
whoami

echo ""
echo "📋 Processus Node.js en cours:"
ps aux | grep node | grep -v grep

echo ""
echo "======================================"
echo "💡 COMMANDES DE CORRECTION"
echo "======================================"
echo ""
echo "Si des erreurs de permissions sont détectées, exécutez:"
echo ""
echo "1. Changer le propriétaire:"
echo "   sudo chown -R \$USER:www-data ./public/uploads/documents"
echo ""
echo "2. Donner les bonnes permissions:"
echo "   sudo chmod -R 775 ./public/uploads/documents"
echo ""
echo "3. Si vous utilisez Nginx/Apache, assurez-vous que www-data peut écrire:"
echo "   sudo chown -R www-data:www-data ./public/uploads/documents"
echo "   sudo chmod -R 755 ./public/uploads/documents"
echo ""
echo "4. Redémarrer l'application:"
echo "   pm2 restart all"
echo ""

echo "======================================"
echo "✅ DIAGNOSTIC TERMINÉ"
echo "======================================"

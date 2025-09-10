#!/bin/bash

# Script de correction pour l'erreur 413 Request Entity Too Large
# À exécuter sur le VPS en tant que root

echo "🔧 CORRECTION DE L'ERREUR 413 REQUEST ENTITY TOO LARGE"
echo "====================================================="

# 1. Vérifier la configuration Nginx actuelle
echo "📋 Configuration Nginx actuelle:"
nginx -T | grep client_max_body_size || echo "   ❌ Aucune limite configurée (défaut: 1MB)"

echo ""

# 2. Créer ou modifier la configuration Nginx
echo "🔧 Configuration de Nginx pour permettre les uploads d'images..."

# Créer le fichier de configuration spécifique à l'école
cat > /etc/nginx/sites-available/ecole-upload-config << 'EOF'
# Configuration pour les uploads d'images - École Saint-Mathieu
server {
    listen 80;
    server_name _;  # Remplacer par votre domaine

    # Augmenter la limite pour les uploads d'images
    client_max_body_size 50M;
    client_body_buffer_size 10M;
    client_body_timeout 120s;

    # Gestion spéciale pour les routes d'upload
    location ~ ^/(carousel|hero-carousel)/.*/add$ {
        client_max_body_size 50M;
        proxy_pass http://localhost:3007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts pour les gros uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Configuration générale pour l'application
    location / {
        client_max_body_size 20M;
        proxy_pass http://localhost:3007;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optimisation pour les fichiers statiques
    location /uploads/ {
        alias /var/www/project/ecole_st_mathieu/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /assets/ {
        alias /var/www/project/ecole_st_mathieu/public/assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "   ✅ Configuration créée dans /etc/nginx/sites-available/ecole-upload-config"

# 3. Modifier aussi la configuration globale
echo "🔧 Modification de la configuration globale Nginx..."

# Ajouter la directive dans nginx.conf si elle n'existe pas
if ! grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
    # Ajouter dans la section http
    sed -i '/http {/a\    client_max_body_size 50M;' /etc/nginx/nginx.conf
    echo "   ✅ client_max_body_size ajouté à nginx.conf"
else
    # Modifier la valeur existante
    sed -i 's/client_max_body_size.*/client_max_body_size 50M;/' /etc/nginx/nginx.conf
    echo "   ✅ client_max_body_size modifié dans nginx.conf"
fi

# 4. Vérifier la syntaxe Nginx
echo "🔍 Vérification de la syntaxe Nginx..."
if nginx -t; then
    echo "   ✅ Syntaxe Nginx correcte"
else
    echo "   ❌ Erreur de syntaxe Nginx !"
    exit 1
fi

# 5. Redémarrer Nginx
echo "🔄 Redémarrage de Nginx..."
systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "   ✅ Nginx redémarré avec succès"
else
    echo "   ❌ Erreur lors du redémarrage de Nginx"
    exit 1
fi

# 6. Vérifier que l'application Node.js fonctionne
echo "🔍 Vérification de l'application Node.js..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3007 | grep -q "200\|302\|301"; then
    echo "   ✅ Application Node.js accessible sur le port 3007"
else
    echo "   ⚠️  Application Node.js potentiellement arrêtée"
    echo "   💡 Redémarrez l'application avec: cd /var/www/project/ecole_st_mathieu && npm start"
fi

# 7. Informations finales
echo ""
echo "🎉 CONFIGURATION TERMINÉE !"
echo "=========================="
echo "✅ Limite d'upload augmentée à 50MB"
echo "✅ Configuration Nginx optimisée"
echo "✅ Carousel prêt pour les gros fichiers"
echo ""
echo "📋 POUR TESTER:"
echo "1. Essayez d'uploader une image dans le carousel"
echo "2. URL admin: http://votre-ip/carousel/manage"
echo "3. Taille max recommandée: 10MB par image"
echo ""
echo "🔧 SI PROBLÈME PERSISTE:"
echo "1. Vérifiez les logs: tail -f /var/log/nginx/error.log"
echo "2. Redémarrez l'app: pm2 restart all (si vous utilisez PM2)"
echo "3. Vérifiez l'espace disque: df -h"

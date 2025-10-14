# 🔧 GUIDE DE RÉSOLUTION - Erreur Upload Documents APEL

## 🎯 Problème

Le directeur ne parvient pas à déposer de documents APEL dans "Documents officiels" sur le VPS, alors que cela fonctionne en local.

**Message d'erreur:** "error"

## 🔍 Cause probable

Problème de **permissions d'écriture** sur le dossier `/public/uploads/documents/` du serveur VPS.

## ✅ Solution - Étapes de résolution

### Étape 1: Diagnostic (Sur le VPS)

```bash
# Se connecter au VPS
ssh utilisateur@votre-vps.com

# Aller dans le dossier du projet
cd /chemin/vers/Ecole-St-Mathieu-Projet-final

# Rendre le script exécutable et l'exécuter
chmod +x check-uploads-permissions.sh
./check-uploads-permissions.sh
```

Le script affichera:
- ✅ Si le dossier existe
- 📋 Les permissions actuelles
- 👤 Le propriétaire du dossier
- ✍️ Si l'écriture est possible

### Étape 2: Correction automatique (Sur le VPS)

```bash
# Rendre le script exécutable
chmod +x fix-uploads-permissions.sh

# Exécuter le script de correction
./fix-uploads-permissions.sh
```

### Étape 3: Correction manuelle (si le script automatique échoue)

```bash
# Option A: Si vous utilisez PM2 avec votre utilisateur
cd /chemin/vers/Ecole-St-Mathieu-Projet-final
sudo chown -R $USER:www-data ./public/uploads/documents
sudo chmod -R 775 ./public/uploads/documents

# Option B: Si vous utilisez Nginx/Apache
sudo chown -R www-data:www-data ./public/uploads/documents
sudo chmod -R 755 ./public/uploads/documents

# Créer le dossier s'il n'existe pas
mkdir -p ./public/uploads/documents
```

### Étape 4: Vérification

```bash
# Tester l'écriture
touch ./public/uploads/documents/test.txt
ls -la ./public/uploads/documents/test.txt
rm ./public/uploads/documents/test.txt

# Si ça fonctionne, vous verrez le fichier créé
```

### Étape 5: Redémarrer l'application

```bash
# Si vous utilisez PM2
pm2 restart all

# OU si vous utilisez systemd
sudo systemctl restart ecole-stmathieu

# OU si vous utilisez nodemon/node directement
# Arrêter et relancer l'application
```

### Étape 6: Tester l'upload

1. Se connecter avec le compte directeur
2. Aller dans **Documents** > **Gestion des documents**
3. Essayer d'ajouter un document APEL
4. Vérifier les logs du serveur:

```bash
# Voir les logs en temps réel
pm2 logs

# OU voir les logs Node.js
tail -f /var/log/ecole-stmathieu.log
```

## 📋 Logs améliorés

Les modifications apportées ajoutent des logs détaillés:

### Dans le middleware uploadDocuments.js:
- ✅ Chemin du dossier uploads
- ✅ Vérification des permissions d'écriture
- ✅ Logs lors de chaque tentative d'upload
- ✅ Messages d'erreur détaillés

### Dans le controller documentController.js:
- ✅ Logs de chaque étape de création
- ✅ Informations sur le fichier uploadé
- ✅ Messages d'erreur détaillés avec stack trace

### Dans les routes documentRoutes.js:
- ✅ Middleware de gestion d'erreur Multer
- ✅ Messages d'erreur spécifiques selon le type d'erreur

## 🔍 Commandes de diagnostic utiles

### Vérifier les permissions

```bash
# Permissions du dossier uploads
ls -la ./public/uploads/

# Permissions du dossier documents
ls -la ./public/uploads/documents/

# Voir qui exécute Node.js
ps aux | grep node

# Voir l'utilisateur actuel
whoami
```

### Vérifier l'espace disque

```bash
# Vérifier l'espace disque disponible
df -h

# Vérifier les inodes disponibles
df -i
```

### Vérifier les processus

```bash
# Voir les processus Node.js
pm2 status

# Voir les logs en temps réel
pm2 logs --lines 50
```

## ⚠️ Erreurs courantes et solutions

### Erreur: "EACCES: permission denied"
**Solution:** Problème de permissions
```bash
sudo chown -R $USER:www-data ./public/uploads/documents
sudo chmod -R 775 ./public/uploads/documents
```

### Erreur: "ENOSPC: no space left on device"
**Solution:** Disque plein
```bash
df -h  # Vérifier l'espace
du -sh ./public/uploads/*  # Voir la taille des dossiers
```

### Erreur: "LIMIT_FILE_SIZE"
**Solution:** Fichier trop volumineux (> 10MB)
- Réduire la taille du fichier
- OU augmenter la limite dans `uploadDocuments.js`

### Erreur: "Type de fichier non autorisé"
**Solution:** Format de fichier non supporté
- Formats acceptés: PDF, DOC, DOCX, TXT
- Convertir le fichier au bon format

## 📝 Structure des dossiers attendue

```
/chemin/vers/Ecole-St-Mathieu-Projet-final/
├── public/
│   └── uploads/
│       ├── documents/        ← Doit avoir permissions 755 ou 775
│       ├── hero-carousel/
│       └── carousel/
├── middleware/
│   └── uploadDocuments.js
└── src/
    ├── controllers/
    │   └── documentController.js
    └── routes/
        └── documentRoutes.js
```

## 🎯 Configuration recommandée pour le VPS

### Permissions optimales:

```bash
# Dossier uploads
chmod 755 ./public/uploads
chown $USER:www-data ./public/uploads

# Sous-dossiers
chmod 775 ./public/uploads/documents
chmod 775 ./public/uploads/carousel
chmod 775 ./public/uploads/hero-carousel
chown -R $USER:www-data ./public/uploads/
```

### Configuration PM2:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ecole-stmathieu',
    script: './app.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. **Récupérer les logs:**
   ```bash
   pm2 logs --lines 100 > logs-error.txt
   ```

2. **Vérifier les permissions:**
   ```bash
   ./check-uploads-permissions.sh > permissions-check.txt
   ```

3. **Envoyer les fichiers:**
   - `logs-error.txt`
   - `permissions-check.txt`

## 📅 Date de création

13 octobre 2025

---

## 🔄 Changements apportés

### Fichiers modifiés:

1. **middleware/uploadDocuments.js**
   - ✅ Ajout de logs détaillés
   - ✅ Vérification des permissions au démarrage
   - ✅ Création automatique du dossier avec bonnes permissions
   - ✅ Gestion d'erreur améliorée

2. **src/controllers/documentController.js**
   - ✅ Logs détaillés à chaque étape
   - ✅ Messages d'erreur plus explicites
   - ✅ Affichage du fichier uploadé et de ses propriétés

3. **src/routes/documentRoutes.js**
   - ✅ Middleware de gestion d'erreur Multer
   - ✅ Messages d'erreur adaptés selon le type d'erreur
   - ✅ Gestion spécifique des erreurs de permissions

### Fichiers créés:

1. **check-uploads-permissions.sh** - Script de diagnostic
2. **fix-uploads-permissions.sh** - Script de correction automatique
3. **GUIDE_RESOLUTION_UPLOAD_DOCUMENTS.md** - Ce guide

---

**Note:** Ces modifications permettent de diagnostiquer précisément la cause de l'erreur et de la corriger facilement.

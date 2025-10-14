# 🚀 DÉPLOIEMENT RAPIDE - Correction Upload Documents

## ⚡ Solution rapide (3 minutes)

### Sur le VPS:

```bash
# 1. Se connecter au VPS
ssh utilisateur@votre-vps

# 2. Aller dans le dossier du projet
cd /path/to/Ecole-St-Mathieu-Projet-final

# 3. Créer/corriger les permissions du dossier
mkdir -p ./public/uploads/documents
sudo chown -R $USER:www-data ./public/uploads/documents
sudo chmod -R 775 ./public/uploads/documents

# 4. Redémarrer l'application
pm2 restart all

# 5. Vérifier les logs
pm2 logs --lines 20
```

### Tester:

1. Se connecter en tant que directeur
2. Aller dans Documents > Gestion
3. Essayer d'uploader un document APEL
4. Vérifier les logs détaillés dans le terminal

## 📋 Fichiers modifiés à déployer:

- ✅ `middleware/uploadDocuments.js` (logs améliorés)
- ✅ `src/controllers/documentController.js` (logs détaillés)
- ✅ `src/routes/documentRoutes.js` (gestion erreur Multer)

## 🔧 Scripts de diagnostic disponibles:

- `./check-uploads-permissions.sh` - Diagnostic complet
- `./fix-uploads-permissions.sh` - Correction automatique

## 📖 Documentation complète:

Voir `GUIDE_RESOLUTION_UPLOAD_DOCUMENTS.md` pour tous les détails.

---

**Date:** 13 octobre 2025

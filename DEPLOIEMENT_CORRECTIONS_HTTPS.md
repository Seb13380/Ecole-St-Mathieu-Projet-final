# LISTE DES FICHIERS À SYNCHRONISER POUR LES CORRECTIONS HTTPS

## Fichiers modifiés à déployer en production :

### 1. Layouts modifiés
```
src/views/layouts/base.twig
```
**Changements :**
- Ajout du fichier CSS `https-fixes.css`
- Optimisation du viewport avec `user-scalable=yes, maximum-scale=3.0`
- Styles CSS inline pour les corrections de taille

### 2. Pages modifiées
```
src/views/pages/demande-identifiants.twig
src/views/pages/auth/login.twig
```
**Changements :**
- Réduction des tailles de police
- Optimisation des espacements
- Correction des conteneurs

### 3. Nouveau fichier CSS
```
public/assets/css/https-fixes.css
```
**Nouveau fichier** contenant toutes les corrections de taille et de rendu.

## Commandes de synchronisation

### Avec rsync (recommandé)
```bash
# Synchroniser tous les fichiers modifiés
rsync -avz --progress \
  src/views/layouts/base.twig \
  src/views/pages/demande-identifiants.twig \
  src/views/pages/auth/login.twig \
  public/assets/css/https-fixes.css \
  user@serveur-https:/chemin/vers/site/

# Ou synchroniser par dossier
rsync -avz --progress src/views/layouts/ user@serveur-https:/chemin/vers/site/src/views/layouts/
rsync -avz --progress src/views/pages/ user@serveur-https:/chemin/vers/site/src/views/pages/
rsync -avz --progress public/assets/css/ user@serveur-https:/chemin/vers/site/public/assets/css/
```

### Avec scp
```bash
scp src/views/layouts/base.twig user@serveur-https:/chemin/vers/site/src/views/layouts/
scp src/views/pages/demande-identifiants.twig user@serveur-https:/chemin/vers/site/src/views/pages/
scp src/views/pages/auth/login.twig user@serveur-https:/chemin/vers/site/src/views/pages/auth/
scp public/assets/css/https-fixes.css user@serveur-https:/chemin/vers/site/public/assets/css/
```

### Avec Git (si utilisé en production)
```bash
git add .
git commit -m "Fix: Uniformisation des tailles de police pour l'environnement HTTPS

- Réduction des tailles text-4xl, text-3xl, text-2xl, text-xl
- Optimisation des espacements et conteneurs
- Ajout du fichier CSS https-fixes.css pour forcer l'uniformité
- Correction de la page demande d'identifiants (20px au lieu de 24px)
- Amélioration du responsive"

git push origin main
```

## Actions post-déploiement

### 1. Vider le cache serveur
```bash
# Apache
sudo service apache2 reload

# Nginx
sudo nginx -s reload

# PHP OPcache (si applicable)
sudo service php8.1-fpm reload
```

### 2. Vider les caches d'application
```bash
# Si utilisation d'un cache applicatif
rm -rf cache/*
# ou
php bin/console cache:clear --env=prod
```

### 3. Forcer le rechargement CSS
- Le fichier `https-fixes.css` utilise le paramètre `?v=20250906`
- Modifier ce paramètre si nécessaire pour forcer le rechargement

### 4. Tests de validation
1. **Page demande d'identifiants** : https://votresite.com/demande-identifiants
   - Vérifier que le titre est plus petit
   - Vérifier que les espacements sont réduits
   - Vérifier que les champs de formulaire sont uniformes

2. **Page de connexion** : https://votresite.com/auth/login
   - Vérifier que le conteneur est plus petit
   - Vérifier que le titre est harmonisé

3. **Test responsive**
   - Tester sur mobile (320px, 768px)
   - Tester sur tablette (1024px)
   - Tester sur desktop (1280px+)

4. **Test cross-browser**
   - Chrome, Firefox, Safari, Edge
   - Vérifier que les tailles sont cohérentes

## Rollback en cas de problème

### Restaurer depuis les sauvegardes locales
```bash
# Les sauvegardes sont dans ./backups/YYYYMMDD_HHMMSS/
cp -r ./backups/[DATE]/layouts_backup/* ./src/views/layouts/
cp -r ./backups/[DATE]/pages_backup/* ./src/views/pages/
```

### Rollback Git
```bash
git revert HEAD  # Annuler le dernier commit
# ou
git reset --hard HEAD~1  # Revenir au commit précédent (ATTENTION : perte des changements)
```

### Retirer temporairement le CSS de correction
Dans `src/views/layouts/base.twig`, commenter la ligne :
```html
<!-- <link rel="stylesheet" href="/assets/css/https-fixes.css?v=20250906"> -->
```

## Checksum des fichiers pour validation

```bash
# Générer les checksums avant déploiement
md5sum src/views/layouts/base.twig
md5sum src/views/pages/demande-identifiants.twig
md5sum src/views/pages/auth/login.twig
md5sum public/assets/css/https-fixes.css

# Vérifier après déploiement que les fichiers sont identiques
```

---

**Date de création :** 6 septembre 2025  
**Auteur :** GitHub Copilot  
**Objectif :** Corriger les différences de rendu entre environnement local et HTTPS

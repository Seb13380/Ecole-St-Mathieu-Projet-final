# 🚀 GUIDE D'OPTIMISATION PERFORMANCE - École Saint-Mathieu

## 📋 RÉCAPITULATIF DES OPTIMISATIONS APPLIQUÉES

### ✅ 1. SCRIPT DE CONVERSION WEBP
**Fichier :** `scripts/convert-images-to-webp.js`
**Objectif :** Convertir toutes les images existantes (JPG/PNG) en WebP
**Gain attendu :** -60% à -80% de taille de fichier

### ✅ 2. CACHE STATIQUE OPTIMISÉ
**Fichier :** `app.js` (lignes 40-75)
**Objectif :** Cache agressif pour images, CSS, JS
**Gain attendu :** Chargement instantané au 2ème visit

### ✅ 3. CONTROLLER MENUS OPTIMISÉ
**Fichier :** `src/controllers/menuController.js` (lignes 7-65)
**Objectif :** Debug et optimisation affichage menus restaurant
**Gain attendu :** Résolution problème menus non affichés

### ✅ 4. MONITORING PERFORMANCE
**Fichier :** `app.js` (lignes 140-200)
**Objectif :** Détecter requêtes lentes et bottlenecks
**Gain attendu :** Identification temps réel des problèmes

### ✅ 5. MACROS TWIG OPTIMISÉES
**Fichier :** `src/views/macros/image-macros.twig`
**Objectif :** WebP avec fallback automatique dans templates
**Gain attendu :** Images optimisées dans tous les templates

---

## 🎯 ÉTAPES DE MISE EN ŒUVRE

### ÉTAPE 1 : Installer les dépendances nécessaires
```bash
# Si Sharp n'est pas déjà installé
npm install sharp

# Vérifier que Sharp fonctionne
node -e "console.log(require('sharp'))"
```

### ÉTAPE 2 : Lancer la conversion WebP
```bash
# Exécuter le script de conversion
node scripts/convert-images-to-webp.js

# Vérifier les images converties
ls -la public/uploads/actualites/*.webp
ls -la public/uploads/carousel/*.webp
```

### ÉTAPE 3 : Redémarrer l'application
```bash
# Arrêter l'application
pm2 stop app.js

# Redémarrer avec les nouvelles optimisations
pm2 start app.js
pm2 logs app.js --lines 50
```

### ÉTAPE 4 : Utiliser les macros dans vos templates
```twig
{# Importer les macros optimisées #}
{% import 'macros/image-macros.twig' as img %}

{# Utiliser dans vos templates #}
{{ img.image_optimized('/uploads/actualites/image.jpg', 'Mon actualité', 'rounded-lg shadow-md') }}
{{ img.actualite_image(actualite, 'w-full h-48 object-cover') }}
{{ img.menu_image(menu, 'w-full h-auto rounded-lg') }}
```

---

## 📊 RÉSULTATS ATTENDUS

### AVANT LES OPTIMISATIONS :
- ❌ Images : 10+ secondes de chargement
- ❌ Menus restaurant : Problèmes d'affichage
- ❌ Pas de cache : Rechargement complet à chaque visite
- ❌ Pas de monitoring : Problèmes non détectés

### APRÈS LES OPTIMISATIONS :
- ✅ Images WebP : 1-2 secondes de chargement
- ✅ Cache statique : Chargement instantané (2ème visite)
- ✅ Menus optimisés : Affichage fiable avec gestion d'erreurs
- ✅ Monitoring actif : Détection temps réel des lenteurs

---

## 🔧 VÉRIFICATIONS POST-DEPLOYMENT

### 1. Tester les images WebP
```bash
# Vérifier qu'une image WebP s'affiche
curl -I https://votre-site.fr/uploads/actualites/exemple.webp

# Doit retourner : Content-Type: image/webp
```

### 2. Vérifier le cache
```bash
# Tester les headers de cache
curl -I https://votre-site.fr/uploads/actualites/exemple.webp

# Doit contenir : Cache-Control: public, max-age=2592000
```

### 3. Monitorer les performances
```bash
# Surveiller les logs pour détecter les requêtes lentes
pm2 logs app.js | grep "LENT\|CRITIQUE"

# Exemples de logs attendus :
# ✅ OK: GET /actualites - 45ms
# ⏰ MOYEN: GET /uploads/image.jpg - 650ms  
# 🐌 LENT: GET /menus - 1200ms
```

### 4. Tester les menus restaurant
1. Aller sur `/restauration/menus`
2. Vérifier que les menus s'affichent
3. Regarder les logs pour messages d'erreur
4. Tester sur mobile et desktop

---

## 🚨 DÉPANNAGE

### Problème : Sharp ne s'installe pas
```bash
# Solution 1 : Réinstaller
npm uninstall sharp
npm install sharp --platform=linux --arch=x64

# Solution 2 : Compilation manuelle
npm install sharp --build-from-source
```

### Problème : Images WebP ne s'affichent pas
1. Vérifier que les fichiers .webp existent dans public/uploads/
2. Tester l'URL directe : `https://votre-site.fr/uploads/actualites/image.webp`
3. Vérifier les permissions fichiers : `chmod 644 public/uploads/*/*.webp`

### Problème : Cache trop agressif
```javascript
// Réduire la durée de cache dans app.js si nécessaire
maxAge: '1d' // au lieu de '30d'
```

### Problème : Menus toujours pas visibles
1. Vérifier la base de données : `SELECT * FROM menu WHERE actif = true;`
2. Contrôler les logs : `pm2 logs app.js | grep "menu"`
3. Tester l'endpoint direct : `curl https://votre-site.fr/restauration/menus`

---

## 📈 MESURES DE PERFORMANCE

### Avant optimisation (mesures à prendre) :
```bash
# Tester vitesse de chargement
curl -w "%{time_total}" -o /dev/null -s https://votre-site.fr/uploads/actualites/image.jpg

# Taille des images
du -sh public/uploads/actualites/*.jpg
```

### Après optimisation (comparaison) :
```bash
# Tester vitesse WebP
curl -w "%{time_total}" -o /dev/null -s https://votre-site.fr/uploads/actualites/image.webp

# Taille des images WebP
du -sh public/uploads/actualites/*.webp
```

---

## 🎯 AMÉLIORATIONS FUTURES POSSIBLES

1. **CDN** : Déployer images sur Cloudflare/AWS CloudFront
2. **Compression** : Activer Gzip/Brotli sur Nginx
3. **Database** : Index sur tables menus pour requêtes plus rapides
4. **Minification** : CSS/JS minifiés en production
5. **Prefetch** : Précharger ressources critiques

---

## ✅ CHECKLIST FINAL

- [ ] Script WebP exécuté avec succès
- [ ] App.js redémarré avec nouvelles optimisations  
- [ ] Images WebP visibles sur le site
- [ ] Cache statique fonctionnel (test 2ème visite)
- [ ] Menus restaurant s'affichent correctement
- [ ] Monitoring actif dans les logs
- [ ] Macros Twig utilisées dans templates principaux
- [ ] Tests sur mobile et desktop réussis
- [ ] Performance globale améliorée (< 2s au lieu de 10s)

**Votre site devrait maintenant être BEAUCOUP plus rapide ! 🚀**
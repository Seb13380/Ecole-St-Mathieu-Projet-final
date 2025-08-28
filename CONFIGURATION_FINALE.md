# 🎓 SYSTÈME DE GESTION ÉCOLE ST MATHIEU - CONFIGURATION FINALE

## 📋 STATUT ACTUEL
✅ **Système fonctionnel** - Local et VPS opérationnels  
✅ **Authentification** - Identifiants mis à jour  
✅ **Déploiement sécurisé** - Protection des uploads  
✅ **Workflow collaboratif** - Prêt pour l'équipe  

---

## 🔐 IDENTIFIANTS DE CONNEXION

### 👤 LIONEL CAMBOULIVES (Directeur)
- **Email**: `l.camboulives@stmathieu.org`
- **Mot de passe**: `Lionel123!`
- **Rôle**: `DIRECTION`
- **Accès**: 
  - Administration complète
  - Gestion des invitations parents
  - Système de tickets
  - Tous les contenus

### 👤 FRANK QUARACINO (Gestionnaire site)
- **Email**: `frank.quaracino@orange.fr`
- **Mot de passe**: `Frank123!`
- **Rôle**: `GESTIONNAIRE_SITE`
- **Accès**:
  - Gestion des contenus
  - Hero carousel
  - Actualités et travaux
  - Menus restaurant

---

## 🌐 URLs D'ACCÈS

### 🏠 Environnement Local (Développement)
- **URL**: `http://localhost:3007`
- **Usage**: Tests et développement
- **Base de données**: MySQL locale

### 🚀 Environnement VPS (Production)
- **URL**: `http://82.165.44.88:3007`
- **Usage**: Site en production
- **Base de données**: MySQL VPS Ionos

---

## 🔧 WORKFLOW DE DÉVELOPPEMENT

### 📁 Structure des branches Git
```
main (production) ← deploy-safe.sh
 ↑
dev (développement) ← travail quotidien
```

### 🚀 Déploiement sécurisé
```bash
# Sur le VPS, utiliser le script de déploiement sécurisé
./deploy-safe.sh
```

**Ce script :**
1. Sauvegarde les uploads utilisateurs
2. Effectue le `git pull`
3. Restaure les uploads
4. Redémarre le service

### 🛡️ Protection des données
Les dossiers suivants sont **protégés** du versioning Git :
- `public/uploads/` - Documents uploadés
- `public/images/` - Images carousel
- `public/documents/` - Fichiers utilisateurs

---

## 📂 FONCTIONNALITÉS DISPONIBLES

### 🏠 **Accueil**
- Hero carousel (images défilantes)
- Actualités récentes
- Informations école

### 📰 **Actualités**
- Création/modification d'articles
- Upload d'images
- Gestion de la visibilité

### 🏗️ **Travaux**
- Suivi des projets école
- Documentation avec images
- Historique des réalisations

### 🍽️ **Restaurant**
- Gestion des menus
- Planning hebdomadaire
- Accès selon les rôles

### 📋 **Administration** (DIRECTION)
- Gestion des utilisateurs
- Système d'invitations parents
- Tickets de support

---

## 🚨 PROCHAINES ÉTAPES

### 1. ✅ **Mettre à jour le VPS**
```bash
# Se connecter au VPS et exécuter
node update-vps-credentials.js
```

### 2. 📧 **Communiquer les identifiants**
- Transmettre les logins à Lionel et Frank
- Expliquer les rôles et accès

### 3. 🔄 **Workflow collaboratif**
- **Lionel/Frank** : Travaillent sur le VPS production
- **Développeur** : Travaille en local, déploie via Git

### 4. 🔧 **Maintenance continue**
- Utiliser `deploy-safe.sh` pour tous les déploiements
- Sauvegarder régulièrement la base de données
- Monitorer les logs d'erreur

---

## 📞 SUPPORT TECHNIQUE

### 🗂️ Scripts disponibles
- `update-credentials.js` - Mise à jour identifiants local
- `update-vps-credentials.js` - Mise à jour identifiants VPS  
- `test-login-credentials.js` - Test des connexions
- `deploy-safe.sh` - Déploiement sécurisé VPS

### 🔍 Debugging
- Logs serveur : Console lors du démarrage
- Erreurs base : Vérifier connexion MySQL
- Problèmes uploads : Vérifier permissions dossiers

---

## ⚡ COMMANDES RAPIDES

### Démarrage local
```bash
npm start
```

### Test connexions
```bash
node test-login-credentials.js
```

### Déploiement VPS
```bash
./deploy-safe.sh
```

---

**🎉 Le système est maintenant prêt pour la collaboration !**  
**Lionel et Frank peuvent gérer le contenu pendant que le développement continue en parallèle.**

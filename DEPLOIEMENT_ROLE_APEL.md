# 🚀 DÉPLOIEMENT RAPIDE - Rôle APEL

## ⚡ En 5 minutes

### 1. Créer les comptes APEL

```bash
# Exécuter le script de création
node create-apel-users.js
```

**Comptes créés :**
- 📧 president.apel@ecole-saint-mathieu.fr
- 📧 tresorier.apel@ecole-saint-mathieu.fr  
- 📧 secretaire.apel@ecole-saint-mathieu.fr

**Mot de passe temporaire:** `APEL2025!`

---

### 2. Tester en local

```bash
# Se connecter avec un compte APEL
# Aller sur http://localhost:3000/auth/login
# Email: president.apel@ecole-saint-mathieu.fr
# Mot de passe: APEL2025!

# Vérifier les accès :
✅ Dashboard parent accessible
✅ Bouton "Gestion Documents" visible
✅ Peut créer des documents
✅ Peut modifier des documents
✅ Peut supprimer des documents
```

---

### 3. Déployer sur le VPS

```bash
# 1. Commit et push
git add .
git commit -m "feat: Ajout rôle APEL avec gestion documents"
git push origin dev

# 2. Sur le VPS
ssh user@votre-vps
cd /path/to/Ecole-St-Mathieu-Projet-final
git pull

# 3. Créer les comptes APEL sur le VPS
node create-apel-users.js

# 4. Redémarrer l'application
pm2 restart all

# 5. Vérifier les logs
pm2 logs --lines 50
```

---

### 4. Communiquer aux membres APEL

**Email type :**

```
Objet: Accès au portail de l'école - Membre APEL

Bonjour [Prénom],

Votre compte APEL a été créé sur le portail de l'école Saint-Mathieu.

🔐 Identifiants de connexion :
Email : [email]
Mot de passe temporaire : APEL2025!

🌐 Connexion :
https://ecole-saint-mathieu.fr/auth/login

⚠️ Important :
Vous devez changer votre mot de passe dès la première connexion.

📄 Vos accès :
- Dashboard parent (consultation)
- Gestion des documents APEL (création, modification, suppression)
- Messagerie
- Actualités

Pour toute question, contactez-nous.

Cordialement,
L'équipe École Saint-Mathieu
```

---

## 📋 Fichiers modifiés

- ✅ `src/middleware/auth.js` - Middleware `requireDocumentManager`
- ✅ `src/routes/documentRoutes.js` - Routes avec nouveau middleware
- ✅ `src/views/partials/header.twig` - Menu APEL
- ✅ `src/views/pages/parent/dashboard.twig` - Carte gestion documents
- ✅ `create-apel-users.js` - Script création comptes
- ✅ `ROLE_APEL_DOCUMENTATION.md` - Documentation complète

---

## ✅ Tests à effectuer

### Test 1: Connexion APEL
- [ ] Se connecter avec compte APEL
- [ ] Vérifier accès dashboard parent
- [ ] Vérifier bouton "Gestion Documents" présent

### Test 2: Gestion documents
- [ ] Créer un document APEL
- [ ] Modifier un document
- [ ] Activer/Désactiver un document
- [ ] Supprimer un document

### Test 3: Accès parent
- [ ] Consulter les actualités
- [ ] Consulter les documents école
- [ ] Consulter les documents APEL

### Test 4: Restrictions
- [ ] Vérifier qu'APEL ne peut PAS accéder au dashboard direction
- [ ] Vérifier qu'APEL ne peut PAS gérer les inscriptions
- [ ] Vérifier qu'APEL ne peut PAS gérer les utilisateurs

---

## 📞 Support

Documentation complète : `ROLE_APEL_DOCUMENTATION.md`

---

**Date :** 13 octobre 2025

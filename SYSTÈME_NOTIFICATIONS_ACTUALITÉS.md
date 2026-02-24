# 📧 Système de Notifications Email pour les Actualités

## Vue d'ensemble

Le système de notifications par email a été implémenté pour informer automatiquement tous les parents lorsqu'une nouvelle actualité est publiée ou rendue visible sur le site de l'École Saint-Mathieu.

## 🚀 Fonctionnalités

### Déclenchement automatique des notifications

Les notifications par email sont envoyées automatiquement dans les cas suivants :

1. **Nouvelle actualité créée et visible** : Lors de la création d'une actualité avec la case "Visible sur le site" cochée
2. **Actualité rendue visible** : Lorsqu'une actualité masquée est rendue visible via le bouton de visibilité

### Destinataires

- **Tous les parents** : Tous les utilisateurs ayant le rôle `PARENT` dans la base de données
- **Mode test** : Si `TEST_MODE=true` dans le fichier `.env`, tous les emails sont redirigés vers `TEST_EMAIL`

### Contenu de l'email

L'email de notification contient :

- **En-tête École Saint-Mathieu** avec logo
- **Indicateur d'importance** (si l'actualité est marquée comme importante)
- **Titre de l'actualité**
- **Extrait du contenu** (200 premiers caractères)
- **Informations sur le média** (si présent)
- **Auteur et date de publication**
- **Bouton d'accès** vers l'actualité complète
- **Lien vers l'espace parent**
- **Informations de contact**

## 📋 Utilisation

### Pour le Directeur et Frank

1. **Créer une nouvelle actualité** :
   - Allez dans "Gestion des Actualités"
   - Rédigez votre actualité
   - ✅ Cochez "Visible sur le site"
   - Cliquez sur "Publier l'Actualité"
   - 📧 Les parents recevront automatiquement un email

2. **Rendre visible une actualité existante** :
   - Dans la liste des actualités existantes
   - Cliquez sur l'icône 👁️ (visibilité)
   - 📧 Les parents recevront automatiquement un email

### Logs et suivi

Le système affiche dans la console du serveur :
```
📧 Envoi des notifications aux parents...
✅ Notifications envoyées à 3 parents
```

## 🛠️ Configuration technique

### Variables d'environnement requises

```env
# Configuration email
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app

# Mode test (optionnel)
TEST_MODE=true
TEST_EMAIL=votre-email-test@gmail.com

# URL de base du site
BASE_URL=http://localhost:3007
```

### Fichiers modifiés

1. **`src/services/emailService.js`** : 
   - Nouvelle méthode `sendNewActualiteNotification()`

2. **`src/controllers/actualiteController.js`** :
   - Notifications lors de `createActualite()`
   - Notifications lors de `toggleVisibility()`

3. **`test-actualite-notifications.js`** :
   - Script de test pour vérifier le bon fonctionnement

## 🧪 Tests

### Tester le système

```bash
# Tester les notifications
node test-actualite-notifications.js

# Créer un parent de test
node test-actualite-notifications.js --create-parent
```

### Vérifications automatiques

Le script de test vérifie :
- ✅ Configuration email valide
- ✅ Présence de parents dans la base de données
- ✅ Existence d'actualités à tester
- ✅ Envoi effectif des emails

## 📱 Format de l'email reçu

```
📧 Objet : 📰 🚨 IMPORTANT - Nouvelle actualité - École Saint-Mathieu
   (ou juste "📰 Nouvelle actualité - École Saint-Mathieu" si non importante)

📝 Contenu :
   - Design responsive et professionnel
   - Couleurs de l'école (bleu/vert)
   - Boutons d'action clairs
   - Footer avec informations de contact
```

## 🔒 Sécurité et bonnes pratiques

- **BCC utilisé** : Les emails des parents ne sont pas visibles entre eux
- **Mode test** : Évite l'envoi accidentel d'emails en développement
- **Gestion des erreurs** : Les erreurs d'email n'interrompent pas la création d'actualités
- **Logging complet** : Toutes les actions sont tracées dans les logs serveur

## 🚨 Points d'attention

1. **Configuration Gmail** : Utilisez un mot de passe d'application, pas votre mot de passe principal
2. **Limites d'envoi** : Gmail limite à ~500 emails par jour pour les comptes gratuits
3. **Mode test** : N'oubliez pas de désactiver `TEST_MODE` en production
4. **Gestion d'erreurs** : Surveillez les logs pour détecter les problèmes d'envoi

## 📈 Améliorations futures possibles

- **Désabonnement** : Possibilité pour les parents de se désabonner
- **Préférences** : Choix du type de notifications (importantes seulement, etc.)
- **Statistiques** : Tracking des emails ouverts/cliqués
- **Templates** : Personnalisation avancée des emails
- **Planification** : Envoi différé des notifications

---

✅ **Système opérationnel et testé** - Prêt pour la production !

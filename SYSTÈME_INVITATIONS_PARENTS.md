# 📧 Système d'Invitations Parents - École Saint-Mathieu

## 🎯 Nouveau système de connexion des parents

Le système de codes d'invitation a été remplacé par un système plus moderne et sécurisé où le chef d'établissement envoie directement des liens d'inscription personnalisés par email aux parents.

## 🚀 Fonctionnalités

### Pour le Chef d'Établissement
- **Interface de gestion des invitations** : `/parent-invitations/manage`
- **Création d'invitations personnalisées** avec pré-remplissage des informations
- **Envoi automatique d'emails** avec liens sécurisés
- **Suivi des invitations** (envoyées, utilisées, expirées)
- **Gestion des invitations** (supprimer, renvoyer)

### Pour les Parents
- **Lien d'inscription unique** reçu par email
- **Formulaire pré-rempli** avec les informations connues
- **Inscription simplifiée** en une seule étape
- **Création automatique** du compte parent et de l'enfant

## 🔧 Utilisation

### 1. Connexion Directeur
```
URL : http://localhost:3007/auth/login
Email : directeur@ecole-saint-mathieu.fr
Mot de passe : DirecteurSaintMathieu2024!
```

### 2. Accès à la gestion des invitations
- Aller sur le dashboard directeur
- Cliquer sur "Invitations Parents"
- Ou accéder directement : `/parent-invitations/manage`

### 3. Créer une invitation
1. Remplir le formulaire avec :
   - Informations du parent (email, prénom, nom)
   - Informations de l'enfant (prénom, nom, date de naissance)
   - Classe assignée (optionnel)
2. Cliquer sur "Créer et envoyer l'invitation"
3. L'email est envoyé automatiquement avec le lien personnalisé

### 4. Le parent reçoit l'email
- Email avec lien unique et sécurisé
- Valide pendant 7 jours
- Formulaire pré-rempli à compléter

## 🛠️ Configuration Email

Dans le fichier `.env`, configurez :
```properties
BASE_URL="http://localhost:3007"
EMAIL_USER="votre_email@ecole.fr"
EMAIL_PASS="votre_mot_de_passe"
EMAIL_SERVICE="gmail"
```

**Note** : Pour la production, utilisez un service email professionnel (SendGrid, Mailgun, etc.)

## 📊 Base de Données

### Nouvelle table : `ParentInvitation`
```sql
- id (Int) : Identifiant unique
- token (String) : Token unique pour le lien
- parentEmail (String) : Email du parent
- parentFirstName (String) : Prénom du parent
- parentLastName (String) : Nom du parent
- childFirstName (String) : Prénom de l'enfant
- childLastName (String) : Nom de l'enfant
- childDateNaissance (DateTime) : Date de naissance
- classeId (Int) : Classe assignée
- emailSent (Boolean) : Email envoyé
- used (Boolean) : Invitation utilisée
- createdBy (Int) : Créé par (directeur)
- expiresAt (DateTime) : Date d'expiration
```

## 🔒 Sécurité

- **Tokens uniques** générés par crypto.randomBytes()
- **Expiration** automatique après 7 jours
- **Vérification** de l'unicité des emails
- **Protection** contre la réutilisation des invitations
- **Accès restreint** aux directeurs uniquement

## 🎯 Avantages vs ancien système

| Ancien système (codes) | Nouveau système (liens) |
|------------------------|--------------------------|
| Code générique à partager | Lien personnalisé par email |
| Formulaire vide à remplir | Informations pré-remplies |
| Gestion manuelle des codes | Suivi automatique des invitations |
| Pas d'expiration | Expiration sécurisée |
| Communication téléphonique | Email professionnel |

## 🧪 Test du système

1. **Démarrer le serveur** : `npm start`
2. **Se connecter comme directeur** avec les identifiants ci-dessus
3. **Créer une invitation test** avec votre email
4. **Vérifier la réception** de l'email d'invitation
5. **Cliquer sur le lien** et créer le compte
6. **Se connecter** avec le nouveau compte parent

## 🔄 Migration depuis l'ancien système

- L'ancien système de codes d'invitation reste fonctionnel
- Les nouveaux parents utilisent le système de liens
- Migration progressive possible
- Pas d'impact sur les comptes existants

## 📞 Support

En cas de problème :
1. Vérifier la configuration email dans `.env`
2. Vérifier que le serveur fonctionne
3. Consulter les logs de l'application
4. Vérifier la base de données

## 🎉 Prêt à utiliser !

Le système est maintenant opérationnel. Le chef d'établissement peut commencer à inviter de nouveaux parents via l'interface dédiée.

# 📧 Système de Demandes d'Inscription - École Saint-Mathieu

## 🎯 Nouveau système de validation des inscriptions

Le système permet maintenant aux parents de s'inscrire directement et au directeur de valider ou refuser ces demandes.

## 🚀 Fonctionnalités

### Pour les Parents
- **Inscription directe** sur `/auth/register`
- **Formulaire complet** avec informations parent et enfants
- **Confirmation automatique** par email
- **Suivi de la demande** par statut

### Pour le Directeur
- **Interface de gestion** : `/admin/inscriptions`
- **Validation des demandes** avec approbation/refus
- **Création automatique des comptes** lors de l'approbation
- **Envoi des identifiants** par email
- **🆕 Notification email** pour chaque nouvelle demande à sgdigitalweb13@gmail.com

## 🔧 Utilisation

### 1. Connexion Directeur
```
URL : http://localhost:3007/auth/login
Email : lionel.camboulives@ecole-saint-mathieu.fr
Mot de passe : Directeur2025!
```

### 2. Notifications automatiques
- **Email de notification** envoyé automatiquement à sgdigitalweb13@gmail.com
- **Contenu** : Informations du parent et des enfants à inscrire
- **Lien direct** vers l'interface de gestion des demandes

### 3. Accès à la gestion des demandes
- Dashboard directeur → "Demandes d'inscription"
- Ou directement : `/admin/inscriptions`
- Ou via le lien dans l'email de notification

### 4. Processus pour les parents
1. Aller sur `/auth/register`
2. Remplir le formulaire complet
3. Recevoir email de confirmation
4. Attendre validation du directeur

### 5. Processus pour le directeur
1. Recevoir la notification email sur sgdigitalweb13@gmail.com
2. Cliquer sur le lien dans l'email ou se connecter
3. Consulter les demandes en attente
4. Approuver → Comptes créés automatiquement
5. Refuser → Email de refus envoyé

## 🧪 Test du système

1. **Démarrer le serveur** : `npm start`
2. **Créer une demande test** sur `/auth/register`
3. **Vérifier la réception** de l'email sur sgdigitalweb13@gmail.com
4. **Se connecter comme directeur** 
5. **Valider la demande** sur `/admin/inscriptions`
6. **Vérifier la création** des comptes automatiques

## ✅ Avantages du nouveau système

- **Automatisation complète** de la création des comptes
- **Suivi centralisé** des demandes
- **Communication email** automatique
- **Sécurité renforcée** avec validation manuelle
- **Interface intuitive** pour les directeurs
- **🆕 Notifications instantanées** au directeur pour chaque demande

## 📧 Configuration des notifications

Le directeur reçoit automatiquement un email à l'adresse **sgdigitalweb13@gmail.com** contenant :
- Les informations complètes du parent
- La liste des enfants à inscrire avec leurs dates de naissance
- Un lien direct vers l'interface de gestion
- La date et l'heure de la demande

## 🎉 Système opérationnel !

Les parents peuvent maintenant s'inscrire directement et le directeur est notifié instantanément par email pour valider les demandes via une interface dédiée.
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

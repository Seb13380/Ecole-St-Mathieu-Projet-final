# 🎫 Système de Tickets Numériques pour la Cantine

## 📋 Vue d'ensemble

Ce système remplace les tickets papier de la cantine par une solution numérique complète permettant :
- ✅ **Achat de tickets** par les parents
- 📅 **Réservation de repas** via un calendrier interactif
- 🍽️ **Gestion restaurant** pour les employés de la cantine

## 🔑 Comptes de test

### Parent (achats et réservations)
- **Email :** `sebcecg@gmail.com`
- **Mot de passe :** `Paul3726&`
- **Accès :** Achat de tickets, calendrier de réservation

### Restaurant (gestion cantine)
- **Email :** `restaurant@ecole-saint-mathieu.fr`
- **Mot de passe :** `Restaurant123!`
- **Accès :** Tableau de bord restaurant, validation des tickets

## 🚀 Comment tester le système

### 1. Tester l'interface Parent
1. Allez sur http://localhost:3000
2. Cliquez sur "Se connecter"
3. Utilisez les identifiants parent ci-dessus
4. Dans le dashboard parent :
   - **Acheter des tickets** : `/parent/tickets/purchase`
   - **Voir le calendrier** : Cliquez sur "🗓️ Calendrier" pour un enfant
   - **Réserver des repas** : Cliquez sur une date dans le calendrier

### 2. Tester l'interface Restaurant
1. Déconnectez-vous (si connecté)
2. Connectez-vous avec les identifiants restaurant
3. Accédez au tableau de bord restaurant : `/restaurant/dashboard`
4. **Fonctionnalités disponibles :**
   - Voir les réservations du jour
   - Marquer les tickets comme "consommés" ou "absents"
   - Consulter l'historique : `/restaurant/history`
   - Voir les statistiques : `/restaurant/stats`

## 📱 Fonctionnalités principales

### Interface Parent
- **Achat de tickets** : Achat par lots (10, 20, 30, 50 tickets)
- **Calendrier interactif** : Réservation/annulation de repas
- **Gestion par enfant** : Tickets séparés pour chaque enfant
- **Alertes intelligentes** : Notifications quand il reste peu de tickets

### Interface Restaurant
- **Tableau de bord temps réel** : Vue d'ensemble des réservations du jour
- **Validation rapide** : Marquer les tickets comme servis ou absents
- **Recherche et filtres** : Trouver rapidement une réservation
- **Statistiques détaillées** : Suivi de la consommation et des absences

## 🛠️ Technologies utilisées

- **Backend :** Node.js + Express.js
- **Base de données :** Prisma ORM (configuré pour MySQL)
- **Templates :** Twig
- **Styles :** Tailwind CSS
- **Sessions :** Express-session

## 📊 Modèle de données

### TicketBooklet (Carnets de tickets)
- Achat par quantité (10, 20, 30, 50)
- Statut : ACTIVE, EXPIRED, CONSUMED
- Prix : 7.30€ par ticket

### MealReservation (Réservations de repas)
- Date du repas
- Statut : RESERVED, CONSUMED, NO_SHOW, CANCELLED
- Lien avec l'élève et le carnet de tickets

### Système de paiement
- Méthodes : CREDIT_CARD, BANK_TRANSFER, CASH, CHECK
- Statut : PENDING, COMPLETED, FAILED, REFUNDED

## 🔄 Workflow complet

1. **Parent achète des tickets** → Création d'un TicketBooklet
2. **Parent réserve un repas** → Création d'une MealReservation + consommation d'1 ticket
3. **Enfant arrive à la cantine** → Restaurant marque le ticket comme consommé
4. **Statistiques mises à jour** → Suivi de la consommation en temps réel

## ⚠️ Note importante

Ce système utilise actuellement des **données de test simulées** pour permettre le développement et les tests sans base de données MySQL complète. En production, il faudra :
- Configurer MySQL
- Exécuter les migrations Prisma
- Supprimer les comptes de test
- Implémenter le vrai système de paiement

## 🎯 Prochaines étapes possibles

- [ ] Export CSV/Excel des données
- [ ] Notifications par email
- [ ] Interface mobile dédiée
- [ ] Intégration paiement en ligne
- [ ] Système de remboursement automatique
- [ ] Planning des menus
- [ ] Gestion des allergies alimentaires

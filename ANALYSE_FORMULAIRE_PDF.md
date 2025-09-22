# 📋 ANALYSE DU FORMULAIRE D'INSCRIPTION PDF

## 🎯 Objectif
Analyser le formulaire d'inscription PDF pour créer une structure de données complète qui permettra de générer des documents consultables et imprimables par Lionel, Yamina et Frank.

## 📝 Structure identifiée dans le PDF

### 📋 **INFORMATIONS GÉNÉRALES**
- **Année scolaire** : 2025/2026 (champ sélectionnable)
- **Date de dépôt** : Automatique à la soumission
- **Statut du dossier** : EN_ATTENTE, VALIDÉ, REFUSÉ

### 👨 **RESPONSABLE 1 (PÈRE)**
- **Nom** *(obligatoire)*
- **Prénom** *(obligatoire)*
- **Profession**
- **Téléphone** *(obligatoire)*
- **Email** *(obligatoire)*

### 👩 **RESPONSABLE 2 (MÈRE)**
- **Nom** *(obligatoire)*
- **Prénom** *(obligatoire)*
- **Profession**
- **Téléphone** *(obligatoire)*
- **Email** *(obligatoire)*

### 🏠 **ADRESSE FAMILIALE**
- **Adresse complète** *(obligatoire)*
  - Numéro et rue
  - Code postal
  - Ville
- **Téléphone fixe du domicile**

### 👶 **ENFANT À INSCRIRE**
- **Nom** *(obligatoire)*
- **Prénom** *(obligatoire)*
- **Date de naissance** *(obligatoire)*
- **Sexe** : Masculin / Féminin
- **Classe demandée** *(obligatoire)*
  - PS (Petite Section)
  - MS (Moyenne Section)
  - GS (Grande Section)
  - CP, CE1, CE2, CM1, CM2
- **École actuelle** (si applicable)
- **Année scolaire de dernière scolarisation**

### 🏥 **INFORMATIONS MÉDICALES**
- **Médecin traitant** : Nom et téléphone
- **Allergies connues**
- **Traitements médicaux en cours**
- **Régime alimentaire particulier**
- **PAI (Projet d'Accueil Individualisé)** : Oui/Non
- **Besoins particuliers ou handicap**

### 🚨 **PERSONNES À CONTACTER EN CAS D'URGENCE**
- **Contact d'urgence 1** :
  - Nom et prénom
  - Lien de parenté
  - Téléphone
- **Contact d'urgence 2** :
  - Nom et prénom
  - Lien de parenté
  - Téléphone

### 📷 **AUTORISATIONS**
- **Autorisation de photographier l'enfant** : Oui/Non
- **Autorisation de filmer l'enfant** : Oui/Non
- **Autorisation de sortie** : Oui/Non
- **Autorisation publication site internet/réseaux sociaux** : Oui/Non

### 🚌 **TRANSPORT ET RESTAURATION**
- **Transport scolaire souhaité** : Oui/Non
- **Restauration scolaire souhaitée** : Oui/Non
- **Jours de restauration** : Lundi, Mardi, Jeudi, Vendredi

### 📞 **PERSONNES AUTORISÉES À RÉCUPÉRER L'ENFANT**
- **Personne autorisée 1** :
  - Nom et prénom
  - Téléphone
  - Lien avec l'enfant
- **Personne autorisée 2** :
  - Nom et prénom
  - Téléphone
  - Lien avec l'enfant

### 📄 **DOCUMENTS À FOURNIR** (checklist)
- [ ] Certificat de radiation (si changement d'école)
- [ ] Photocopie du livret de famille
- [ ] Justificatif de domicile
- [ ] Attestation d'assurance scolaire
- [ ] Photocopie du carnet de santé (vaccinations)
- [ ] Certificat médical (si nécessaire)

### ✍️ **ENGAGEMENTS ET SIGNATURES**
- **Engagement à respecter le règlement intérieur** : Case à cocher
- **Engagement financier OGEC** : Case à cocher
- **Date de signature**
- **Signature du père**
- **Signature de la mère**

## 🗂️ **MÉTADONNÉES SYSTÈME**
- **ID unique du dossier**
- **Date de création**
- **Date de dernière modification**
- **Traité par** (Lionel, Yamina, Frank)
- **Date de traitement**
- **Notes administratives**
- **Chemin vers le PDF généré**
- **Statut d'impression**

## 📊 **STATISTIQUES À PRÉVOIR**
- Nombre de dossiers en attente
- Nombre de dossiers traités par mois
- Répartition par classe demandée
- Taux d'acceptation/refus

## 🎯 **PROCHAINES ÉTAPES**
1. Créer le modèle Prisma avec tous ces champs
2. Adapter le formulaire Twig pour correspondre exactement
3. Implémenter la génération PDF avec mise en forme identique
4. Créer l'interface de gestion pour l'équipe administrative

---

*Analyse réalisée le 20 septembre 2025*
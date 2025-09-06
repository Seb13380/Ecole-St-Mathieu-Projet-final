🔧 === CORRECTION DES FORMULAIRES D'INSCRIPTION ===

PROBLÈMES IDENTIFIÉS:
1. Modèle Prisma PreInscriptionRequest exige le champ "parentPassword"
2. Modèle attend "children" en JSON, pas des champs individuels d'élève
3. Plusieurs contrôleurs manquaient le champ parentPassword

CORRECTIONS APPLIQUÉES:

1. 📁 src/controllers/preInscriptionController.js:
   ✅ Ajout du champ parentPassword (mot de passe temporaire)
   ✅ Conversion des données élève individuelles en format JSON children
   ✅ Structure de données corrigée pour correspondre au modèle Prisma

2. 📁 src/controllers/inscriptionEleveController.js:
   ✅ Ajout du champ parentPassword manquant
   ✅ Génération d'un mot de passe temporaire aléatoire

3. 📁 src/controllers/inscriptionController.js:
   ✅ Déjà correct (avait parentPassword)

MODÈLE PRISMA ATTENDU:
model PreInscriptionRequest {
  id               Int     @id @default(autoincrement())
  parentFirstName  String
  parentLastName   String
  parentEmail      String
  parentPhone      String
  parentAddress    String?
  parentPassword   String  ← REQUIS
  anneeScolaire    String  @default("2025/2026")
  children         Json    ← REQUIS (format JSON)
  specialNeeds     String?
  message          String?
  status           PreInscriptionStatus @default(PENDING)
  submittedAt      DateTime @default(now())
  processedAt      DateTime?
  processedBy      Int?
  adminNotes       String?
}

FORMAT ATTENDU POUR CHILDREN:
[{
  "firstName": "Prénom",
  "lastName": "Nom",
  "birthDate": "2018-06-15",
  "currentClass": "CP",
  "requestedClass": "CE1",
  "previousSchool": "École précédente"
}]

TESTS RECOMMANDÉS:
1. 🌐 Aller sur /pre-inscription (formulaire simple)
2. 🌐 Aller sur /inscription-eleve (formulaire public complet)
3. 📝 Remplir et soumettre les formulaires
4. ✅ Vérifier que les demandes sont créées sans erreur
5. 👥 Tester l'approbation des demandes (création parent + enfants)

URLS DE TEST:
- Formulaire simple: http://localhost:3007/pre-inscription
- Formulaire complet: http://localhost:3007/inscription-eleve
- Gestion admin: http://localhost:3007/directeur/inscriptions

STATUT: ✅ PROBLÈMES RÉSOLUS
Date: ${new Date().toLocaleString('fr-FR')}

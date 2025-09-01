const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestDocuments() {
    try {
        console.log('🔧 Création de documents de test pour dépannage urgence...\n');

        // Vérifier si Lionel existe
        const lionel = await prisma.user.findFirst({
            where: { role: 'DIRECTION' }
        });

        if (!lionel) {
            console.log('❌ Aucun utilisateur DIRECTION trouvé ! Vous devez d\'abord créer Lionel.');
            return;
        }

        console.log(`✅ Utilisateur trouvé: ${lionel.firstName} ${lionel.lastName}`);

        // Documents minimum critiques pour demain
        const documentsEssentiels = [
            {
                type: 'REGLEMENT_INTERIEUR',
                titre: 'Règlement Intérieur - Urgence',
                description: 'Document d\'urgence pour le déploiement',
                contenu: `
                    <h1>Règlement Intérieur - École Saint-Mathieu</h1>
                    <p><strong>Document temporaire pour le déploiement d'urgence</strong></p>
                    
                    <h2>Horaires</h2>
                    <ul>
                        <li>Ouverture: 8h30 - 16h45</li>
                        <li>Maternelles: sortie à 16h30</li>
                        <li>Garderie: 7h30 - 18h00</li>
                    </ul>
                    
                    <h2>Contact</h2>
                    <p>École Saint-Mathieu<br>
                    22 place des Héros<br>
                    13013 MARSEILLE</p>
                `,
                active: true,
                ordre: 0,
                auteurId: lionel.id
            },
            {
                type: 'PROJET_EDUCATIF',
                titre: 'Projet Éducatif',
                description: 'Notre vision éducative',
                contenu: `
                    <h1>Projet Éducatif - École Saint-Mathieu</h1>
                    <p>L'École Saint-Mathieu s'engage à offrir un enseignement de qualité dans un cadre bienveillant.</p>
                    
                    <h2>Nos valeurs</h2>
                    <ul>
                        <li>Respect et tolérance</li>
                        <li>Épanouissement de chaque enfant</li>
                        <li>Excellence académique</li>
                        <li>Ouverture au monde</li>
                    </ul>
                `,
                active: true,
                ordre: 1,
                auteurId: lionel.id
            },
            {
                type: 'DOSSIER_INSCRIPTION',
                titre: 'Dossier d\'inscription 2025-2026',
                description: 'Documents pour l\'inscription',
                contenu: `
                    <h1>Dossier d'inscription</h1>
                    <p>Pour inscrire votre enfant, merci de nous contacter.</p>
                    
                    <h2>Documents nécessaires:</h2>
                    <ul>
                        <li>Formulaire d'inscription</li>
                        <li>Livret de famille</li>
                        <li>Certificat de scolarité</li>
                        <li>Photos d'identité</li>
                    </ul>
                    
                    <p><strong>Contact:</strong> secretariat@saint-mathieu.fr</p>
                `,
                active: true,
                ordre: 2,
                auteurId: lionel.id
            }
        ];

        console.log('📝 Création des documents essentiels...');

        for (const docData of documentsEssentiels) {
            try {
                const doc = await prisma.document.create({
                    data: docData
                });
                console.log(`✅ Créé: ${doc.type} - ${doc.titre}`);
            } catch (error) {
                console.log(`⚠️  ${docData.type} existe déjà ou erreur: ${error.message}`);
            }
        }

        console.log('\n🎯 Test de la page des documents...');

        // Vérifier que les documents sont bien créés
        const totalDocs = await prisma.document.count();
        const docsActifs = await prisma.document.count({ where: { active: true } });

        console.log(`📊 Total documents: ${totalDocs}`);
        console.log(`✅ Documents actifs: ${docsActifs}`);

        if (docsActifs >= 3) {
            console.log('\n🎉 SUCCESS ! La page /documents/ecole devrait maintenant afficher les documents !');
            console.log('🔗 Testez: http://localhost:3007/documents/ecole');
        } else {
            console.log('\n⚠️  Problème: Pas assez de documents actifs');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestDocuments();

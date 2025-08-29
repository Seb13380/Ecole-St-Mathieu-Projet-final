const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDossierInscription() {
    try {
        console.log('=== CRÉATION DOSSIER D\'INSCRIPTION ===');

        // Trouver Frank pour être l'auteur
        const frank = await prisma.user.findFirst({
            where: { firstName: { contains: 'Frank' } }
        });

        if (!frank) {
            console.log('❌ Frank non trouvé');
            return;
        }

        // Créer le document Dossier d'inscription
        const dossierInscription = await prisma.document.create({
            data: {
                type: 'DOSSIER_INSCRIPTION',
                titre: 'Dossier d\'inscription 2025-2026',
                description: 'Formulaires et documents nécessaires pour l\'inscription de votre enfant à l\'École Saint-Mathieu.',
                contenu: `
                    <h1>Dossier d'inscription - École Saint-Mathieu</h1>
                    
                    <h2>Documents à fournir :</h2>
                    <ul>
                        <li>Formulaire d'inscription complété</li>
                        <li>Copie du livret de famille</li>
                        <li>Certificat de scolarité de l'année en cours</li>
                        <li>2 photos d'identité récentes</li>
                        <li>Certificat médical</li>
                        <li>Attestation d'assurance scolaire</li>
                    </ul>
                    
                    <h2>Processus d'inscription :</h2>
                    <ol>
                        <li>Compléter le dossier d'inscription</li>
                        <li>Prendre rendez-vous avec la direction</li>
                        <li>Entretien avec l'enfant et les parents</li>
                        <li>Confirmation de l'inscription</li>
                    </ol>
                    
                    <h2>Contact :</h2>
                    <p>Pour toute question concernant l'inscription, contactez le secrétariat de l'école.</p>
                `,
                active: true,
                auteurId: frank.id
            }
        });

        console.log('✅ Dossier d\'inscription créé avec succès !');
        console.log(`   - ID: ${dossierInscription.id}`);
        console.log(`   - Titre: ${dossierInscription.titre}`);
        console.log(`   - Type: ${dossierInscription.type}`);

        console.log('\n🎯 Testez sur : http://localhost:3007/documents/ecole');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDossierInscription();

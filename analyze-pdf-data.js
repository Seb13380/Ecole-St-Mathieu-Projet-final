const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzePDFData() {
    try {
        console.log('🔍 Analyse des données pour PDF...\n');

        // Récupérer une demande d'inscription récente
        const request = await prisma.preInscriptionRequest.findFirst({
            orderBy: { submittedAt: 'desc' }
        });

        if (!request) {
            console.log('❌ Aucune demande d\'inscription trouvée');
            return;
        }

        console.log('📋 Demande trouvée:');
        console.log('   - ID:', request.id);
        console.log('   - Nom famille:', request.parentLastName);
        console.log('   - Email parent:', request.parentEmail);
        console.log('   - Téléphone parent:', request.parentPhone);
        console.log('   - Adresse parent:', request.parentAddress);
        console.log('   - Année scolaire:', request.anneeScolaire);
        console.log('   - Situation familiale:', request.familySituation);
        console.log('   - Besoins particuliers:', request.specialNeeds);
        console.log('   - Notes admin:', request.adminNotes);
        console.log('   - Statut:', request.status);
        console.log('');

        // Champs spécifiques mère
        console.log('📝 Informations mère:');
        console.log('   - Prénom mère:', request.motherFirstName);
        console.log('   - Nom mère:', request.motherLastName);
        console.log('   - Email mère:', request.motherEmail);
        console.log('   - Téléphone mère:', request.motherPhone);
        console.log('');

        // Analyser les enfants
        console.log('👶 Enfants (JSON):');
        let children = [];
        if (request.children) {
            try {
                children = typeof request.children === 'string'
                    ? JSON.parse(request.children)
                    : request.children;
                console.log('   - Nombre d\'enfants:', children.length);
                children.forEach((child, index) => {
                    console.log(`   - Enfant ${index + 1}:`, {
                        prénom: child.firstName,
                        nom: child.lastName,
                        dateNaissance: child.birthDate,
                        lieuNaissance: child.birthPlace || child.lieuNaissance,
                        nationalité: child.nationality || child.nationalite,
                        classedemandée: child.requestedClass || child.schoolLevel,
                        écoleActuelle: child.currentSchool || child.previousSchool,
                        classeActuelle: child.currentClass
                    });
                });
            } catch (e) {
                console.log('   ❌ Erreur parsing children:', e.message);
            }
        }
        console.log('');

        // Analyser le message JSON
        console.log('📱 Message/Infos supplémentaires (JSON):');
        if (request.message) {
            try {
                const parentsInfo = typeof request.message === 'string'
                    ? JSON.parse(request.message)
                    : request.message;
                console.log('   - Structure:', Object.keys(parentsInfo));
                console.log('   - Contenu:', JSON.stringify(parentsInfo, null, 4));
            } catch (e) {
                console.log('   ❌ Erreur parsing message:', e.message);
                console.log('   - Contenu brut:', request.message);
            }
        }

        // Informations qui pourraient manquer
        console.log('\n🤔 ANALYSE - Informations potentiellement manquantes:');

        const missing = [];

        if (!request.motherFirstName && !request.motherLastName) {
            missing.push('• Informations complètes de la mère');
        }

        if (!request.familySituation) {
            missing.push('• Situation familiale');
        }

        if (children.length === 0) {
            missing.push('• Aucun enfant renseigné');
        } else {
            children.forEach((child, index) => {
                if (!child.birthPlace && !child.lieuNaissance) {
                    missing.push(`• Lieu de naissance de l'enfant ${index + 1}`);
                }
                if (!child.nationality && !child.nationalite) {
                    missing.push(`• Nationalité de l'enfant ${index + 1}`);
                }
                if (!child.currentSchool && !child.previousSchool) {
                    missing.push(`• École actuelle de l'enfant ${index + 1}`);
                }
            });
        }

        if (!request.specialNeeds) {
            missing.push('• Besoins particuliers non renseignés');
        }

        if (missing.length === 0) {
            console.log('   ✅ Toutes les informations principales semblent présentes !');
        } else {
            console.log('   ❌ Informations manquantes potentielles:');
            missing.forEach(item => console.log('     ' + item));
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzePDFData();
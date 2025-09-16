const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectPreInscription() {
    console.log('🔍 Inspection détaillée d\'une pré-inscription...\n');

    try {
        // Récupérer la dernière pré-inscription
        const request = await prisma.preInscriptionRequest.findFirst({
            where: {
                status: 'PENDING'
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        if (!request) {
            console.log('❌ Aucune pré-inscription trouvée');
            return;
        }

        console.log('📋 Pré-inscription trouvée:');
        console.log(`   ID: ${request.id}`);
        console.log(`   Parent: ${request.parentFirstName} ${request.parentLastName}`);
        console.log(`   Email: ${request.parentEmail}`);
        console.log(`   Status: ${request.status}`);
        console.log(`   Date: ${request.submittedAt}`);

        console.log('\n🔍 Données children (raw):');
        console.log(`   Type: ${typeof request.children}`);
        console.log(`   Valeur: ${request.children}`);
        console.log(`   Est string: ${typeof request.children === 'string'}`);

        console.log('\n🧪 Tentative de parsing:');
        if (typeof request.children === 'string') {
            console.log('   → C\'est une string, tentative de JSON.parse...');
            try {
                const parsed = JSON.parse(request.children);
                console.log('   ✅ Parsing réussi:', JSON.stringify(parsed, null, 2));
            } catch (e) {
                console.log('   ❌ Parsing échoué:', e.message);
            }
        } else {
            console.log('   → Ce n\'est pas une string, valeur directe:');
            console.log('   ', JSON.stringify(request.children, null, 2));

            if (Array.isArray(request.children)) {
                console.log('\n📋 Analyse des enfants:');
                request.children.forEach((child, index) => {
                    console.log(`   Enfant ${index + 1}:`);
                    console.log(`      firstName: ${child.firstName || 'N/A'}`);
                    console.log(`      lastName: ${child.lastName || 'N/A'}`);
                    console.log(`      birthDate: ${child.birthDate || 'N/A'}`);
                    console.log(`      requestedClass: ${child.requestedClass || 'MANQUANTE!'}`);
                    console.log(`      currentClass: ${child.currentClass || 'N/A'}`);
                    console.log(`      previousSchool: ${child.previousSchool || 'N/A'}`);

                    if (!child.requestedClass) {
                        console.log(`      🔥 PROBLÈME: requestedClass manquante pour cet enfant!`);
                    }
                });
            }
        }

        console.log('\n📊 Tous les champs:');
        Object.keys(request).forEach(key => {
            console.log(`   ${key}: ${request[key]} (${typeof request[key]})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectPreInscription();
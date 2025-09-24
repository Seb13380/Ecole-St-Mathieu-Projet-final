const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeInscription29() {
    try {
        console.log('🔍 ANALYSE COMPLÈTE - Demande d\'inscription ID 29\n');

        const request = await prisma.preInscriptionRequest.findUnique({
            where: { id: 29 }
        });

        if (!request) {
            console.log('❌ Demande non trouvée');
            return;
        }

        console.log('📋 CHAMPS DIRECTS DE LA BASE:');
        console.log('   - parentFirstName:', `"${request.parentFirstName}"`);
        console.log('   - parentLastName:', `"${request.parentLastName}"`);
        console.log('   - parentEmail:', `"${request.parentEmail}"`);
        console.log('   - parentPhone:', `"${request.parentPhone}"`);
        console.log('   - parentAddress:', `"${request.parentAddress}"`);
        console.log('');

        console.log('📋 CHAMPS SPÉCIFIQUES MÈRE:');
        console.log('   - motherFirstName:', `"${request.motherFirstName || 'undefined'}"`);
        console.log('   - motherLastName:', `"${request.motherLastName || 'undefined'}"`);
        console.log('   - motherEmail:', `"${request.motherEmail || 'undefined'}"`);
        console.log('   - motherPhone:', `"${request.motherPhone || 'undefined'}"`);
        console.log('');

        console.log('📋 SITUATION FAMILIALE:');
        console.log('   - familySituation:', `"${request.familySituation || 'undefined'}"`);
        console.log('   - situationFamiliale:', `"${request.situationFamiliale || 'undefined'}"`);
        console.log('');

        // Analyse du champ MESSAGE (JSON)
        console.log('📱 ANALYSE DU CHAMP MESSAGE:');
        if (request.message) {
            try {
                const messageData = JSON.parse(request.message);
                console.log('   Structure JSON:', Object.keys(messageData));
                console.log('   Contenu complet:');

                Object.entries(messageData).forEach(([key, value]) => {
                    console.log(`   - ${key}: "${value}"`);
                });

                // Analyse spécifique pour téléphone mère
                console.log('\n🔍 RECHERCHE TÉLÉPHONE MÈRE:');
                console.log('   - messageData.mere:', `"${messageData.mere || 'N/A'}"`);

                if (messageData.mere) {
                    // Tenter d'extraire le téléphone depuis la chaîne
                    const mereStr = messageData.mere;
                    console.log('   - Contenu mere string:', `"${mereStr}"`);

                    // Rechercher des patterns de téléphone
                    const phonePatterns = [
                        /(\d{10})/,  // 10 chiffres
                        /(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/,  // Format français
                        /(\+33\s?\d{9})/  // Format international
                    ];

                    phonePatterns.forEach((pattern, index) => {
                        const match = mereStr.match(pattern);
                        if (match) {
                            console.log(`   - Pattern ${index + 1} trouvé:`, match[1]);
                        }
                    });
                }

                console.log('\n🔍 RECHERCHE SITUATION FAMILIALE:');
                const situationKeys = ['situation', 'familySituation', 'mariage', 'statut', 'civil'];
                situationKeys.forEach(key => {
                    if (messageData[key]) {
                        console.log(`   - messageData.${key}:`, `"${messageData[key]}"`);
                    }
                });

            } catch (e) {
                console.log('   ❌ Erreur parsing JSON:', e.message);
                console.log('   - Contenu brut:', request.message.substring(0, 200) + '...');
            }
        } else {
            console.log('   ⚠️ Aucun message JSON disponible');
        }

        // Analyse des enfants
        console.log('\n👶 ANALYSE DES ENFANTS:');
        if (request.children) {
            try {
                const children = JSON.parse(request.children);
                console.log(`   Nombre d'enfants: ${children.length}`);
                children.forEach((child, index) => {
                    console.log(`   Enfant ${index + 1}:`);
                    Object.entries(child).forEach(([key, value]) => {
                        console.log(`     - ${key}: "${value}"`);
                    });
                });
            } catch (e) {
                console.log('   ❌ Erreur parsing enfants:', e.message);
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeInscription29();
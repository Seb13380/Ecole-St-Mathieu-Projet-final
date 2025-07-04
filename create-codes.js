const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCodes() {
    try {
        console.log('📝 Création des codes d\'invitation...');

        // Récupérer l'admin
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            console.log('❌ Aucun administrateur trouvé. Exécutez d\'abord create-admin.js');
            return;
        }

        // Créer les codes directement dans la table (sans utiliser le modèle)
        const codes = [
            { code: 'DIR2024STM', role: 'DIRECTION' },
            { code: 'ENS2024STM', role: 'ENSEIGNANT' },
            { code: 'APEL2024STM', role: 'APEL' }
        ];

        for (const codeData of codes) {
            // Utiliser une requête SQL directe
            await prisma.$executeRaw`
        INSERT INTO InvitationCode (code, role, createdBy, valideJusqu, createdAt, utilise)
        VALUES (${codeData.code}, ${codeData.role}, ${admin.id}, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), false)
        ON DUPLICATE KEY UPDATE code = code
      `;
            console.log(`✨ Code créé: ${codeData.code} (${codeData.role})`);
        }

        console.log('\n🎉 Codes d\'invitation créés avec succès !');
        console.log('🔒 Codes disponibles (valides 30 jours):');
        console.log('• DIRECTION: DIR2024STM');
        console.log('• ENSEIGNANT: ENS2024STM');
        console.log('• APEL: APEL2024STM');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createCodes();

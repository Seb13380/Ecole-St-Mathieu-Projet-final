const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTable() {
    try {
        console.log('📋 Création de la table InvitationCode...');

        // Créer la table
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS InvitationCode (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        utilisePar VARCHAR(255),
        utilise BOOLEAN DEFAULT false,
        valideJusqu DATETIME,
        createdBy INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        usedAt DATETIME
      )
    `;

        console.log('✅ Table InvitationCode créée avec succès !');

        // Récupérer l'admin
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (admin) {
            // Créer les codes
            const codes = [
                { code: 'DIR2024STM', role: 'DIRECTION' },
                { code: 'ENS2024STM', role: 'ENSEIGNANT' },
                { code: 'APEL2024STM', role: 'APEL' }
            ];

            for (const codeData of codes) {
                await prisma.$executeRaw`
          INSERT INTO InvitationCode (code, role, createdBy, valideJusqu, createdAt, utilise)
          VALUES (${codeData.code}, ${codeData.role}, ${admin.id}, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), false)
          ON DUPLICATE KEY UPDATE code = code
        `;
                console.log(`✨ Code créé: ${codeData.code} (${codeData.role})`);
            }

            console.log('\n🎉 Système d\'invitation configuré !');
            console.log('🔒 Codes disponibles (valides 30 jours):');
            console.log('• DIRECTION: DIR2024STM');
            console.log('• ENSEIGNANT: ENS2024STM');
            console.log('• APEL: APEL2024STM');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTable();

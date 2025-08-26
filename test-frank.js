// Test de connexion pour Frank
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFrankLogin() {
    try {
        console.log('🧪 Test de connexion pour Frank...\n');

        // Récupérer Frank
        const frank = await prisma.user.findUnique({
            where: { email: 'frank@stmathieu.org' }
        });

        if (!frank) {
            console.log('❌ Frank non trouvé dans la base de données');
            return;
        }

        console.log('✅ Frank trouvé:');
        console.log(`   📧 Email: ${frank.email}`);
        console.log(`   👤 Nom: ${frank.firstName} ${frank.lastName}`);
        console.log(`   🎭 Rôle: ${frank.role}`);

        // Tester le mot de passe
        const passwordTest = await bcrypt.compare('Frank2025!', frank.password);
        console.log(`   🔐 Test mot de passe "Frank2025!": ${passwordTest ? '✅ VALIDE' : '❌ INVALIDE'}`);

        if (!passwordTest) {
            console.log('\n🔧 Réinitialisation du mot de passe...');
            const newHashedPassword = await bcrypt.hash('Frank2025!', 10);

            await prisma.user.update({
                where: { id: frank.id },
                data: { password: newHashedPassword }
            });

            console.log('✅ Mot de passe réinitialisé avec succès');
        }

        console.log('\n📋 Informations de connexion:');
        console.log('===============================');
        console.log(`Email: frank@stmathieu.org`);
        console.log(`Mot de passe: Frank2025!`);
        console.log(`URL: http://localhost:3007/auth/login`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFrankLogin();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testLionelLogin() {
    try {
        console.log('🧪 Test de connexion Lionel Camboulives...\n');

        const email = 'lionel.camboulives@ecole-saint-mathieu.fr';
        const password = 'Directeur2025!';

        // 1. Récupérer l'utilisateur
        console.log('1️⃣ Recherche de l\'utilisateur...');
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('❌ Utilisateur non trouvé !');
            return;
        }

        console.log(`✅ Utilisateur trouvé : ${user.firstName} ${user.lastName}`);
        console.log(`   🎭 Rôle: ${user.role}`);

        // 2. Vérifier le mot de passe
        console.log('\n2️⃣ Vérification du mot de passe...');
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('❌ Mot de passe incorrect !');
            return;
        }

        console.log('✅ Mot de passe correct');

        // 3. Déterminer la redirection selon le rôle
        console.log('\n3️⃣ Détermination de la redirection...');
        switch (user.role) {
            case 'DIRECTION':
                console.log('✅ Rôle DIRECTION → Redirection vers /directeur/dashboard');
                break;
            case 'ADMIN':
                console.log('✅ Rôle ADMIN → Redirection vers /admin/dashboard');
                break;
            case 'PARENT':
                console.log('✅ Rôle PARENT → Redirection vers /parent/dashboard');
                break;
            default:
                console.log(`⚠️  Rôle ${user.role} → Redirection vers /`);
        }

        console.log('\n🎉 Test de connexion réussi !');
        console.log(`\n📝 Pour tester en réel :`);
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Mot de passe: ${password}`);
        console.log(`   🌐 URL: http://localhost:3007/login`);

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLionelLogin();

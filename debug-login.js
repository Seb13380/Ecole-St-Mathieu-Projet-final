const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugLogin() {
    try {
        console.log('🔍 Debug de la connexion admin...');

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (!user) {
            console.log('❌ Utilisateur non trouvé avec cet email');
            return;
        }

        console.log('✅ Utilisateur trouvé :');
        console.log('📧 Email:', user.email);
        console.log('👤 Nom:', user.firstName, user.lastName);
        console.log('🔒 Rôle:', user.role);
        console.log('📅 Créé le:', user.createdAt);

        // Tester le mot de passe
        const testPassword = 'StMathieu2025!';
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);

        console.log('\n🔑 Test du mot de passe:');
        console.log('Mot de passe testé:', testPassword);
        console.log('Résultat:', isPasswordValid ? '✅ VALIDE' : '❌ INVALIDE');

        if (!isPasswordValid) {
            console.log('\n🔧 Correction du mot de passe...');
            const newHashedPassword = await bcrypt.hash('StMathieu2025!', 10);

            await prisma.user.update({
                where: { email: 'l.camboulives@orange.fr' },
                data: { password: newHashedPassword }
            });

            console.log('✅ Mot de passe mis à jour !');
        }

        // Vérifier les autres utilisateurs admin
        const allAdmins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true, firstName: true, lastName: true, role: true }
        });

        console.log('\n👨‍💼 Tous les administrateurs :');
        allAdmins.forEach(admin => {
            console.log(`- ${admin.email} (${admin.firstName} ${admin.lastName})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLogin();

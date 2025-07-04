const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createNewAdmin() {
    try {
        console.log('🔐 Création du nouvel administrateur...');

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (existingUser) {
            console.log('⚠️  Un utilisateur avec cet email existe déjà.');
            console.log('🔄 Mise à jour vers le rôle ADMIN...');

            // Mettre à jour le mot de passe et le rôle
            const hashedPassword = await bcrypt.hash('StMathieu2025!', 10);

            const updatedUser = await prisma.user.update({
                where: { email: 'l.camboulives@orange.fr' },
                data: {
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });

            console.log('✅ Utilisateur mis à jour vers ADMIN !');
        } else {
            // Créer un nouveau compte admin
            const hashedPassword = await bcrypt.hash('StMathieu2025!', 10);

            const newAdmin = await prisma.user.create({
                data: {
                    firstName: 'Lionel',
                    lastName: 'Camboulives',
                    email: 'l.camboulives@orange.fr',
                    password: hashedPassword,
                    phone: '06.12.34.56.78',
                    adress: 'École Saint-Mathieu',
                    role: 'ADMIN'
                }
            });

            console.log('🎉 Nouvel administrateur créé avec succès !');
        }

        console.log('\n📋 Identifiants de connexion :');
        console.log('📧 Email: l.camboulives@orange.fr');
        console.log('🔑 Mot de passe: StMathieu2025!');
        console.log('🔒 Rôle: ADMIN');
        console.log('\n✅ Vous pouvez maintenant vous connecter !');

        // Vérifier que l'admin peut bien se connecter
        const testAdmin = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (testAdmin && testAdmin.role === 'ADMIN') {
            console.log('✅ Vérification réussie - Admin prêt à se connecter !');
        } else {
            console.log('❌ Problème avec la création de l\'admin');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createNewAdmin();

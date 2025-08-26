const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createNewAdmin() {
    try {
        console.log('🔐 Création du nouvel administrateur...');

        // Emails à vérifier (canonique + legacy)
        const canonicalEmail = 'lionel.camboulives@ecole-saint-mathieu.fr';
        const legacyEmail = 'l.camboulives@stmathieu.org';

        // Vérifier si l'email canonique existe déjà
        let existingUser = await prisma.user.findUnique({
            where: { email: canonicalEmail }
        });

        // Si pas trouvé, vérifier l'ancien email pour migration
        let legacyUser = null;
        if (!existingUser) {
            legacyUser = await prisma.user.findUnique({
                where: { email: legacyEmail }
            });
        }

        const hashedPassword = await bcrypt.hash('Directeur2025!', 10);

        if (existingUser) {
            console.log('⚠️  Un utilisateur avec l\'email canonique existe déjà.');
            console.log('🔄 Mise à jour vers le rôle DIRECTION...');

            const updatedUser = await prisma.user.update({
                where: { email: canonicalEmail },
                data: {
                    password: hashedPassword,
                    role: 'DIRECTION'
                }
            });

            console.log('✅ Utilisateur mis à jour vers DIRECTION !');
        } else if (legacyUser) {
            console.log('♻️  Migration de l\'ancien email vers le nouveau...');

            const updatedUser = await prisma.user.update({
                where: { email: legacyEmail },
                data: {
                    email: canonicalEmail,
                    password: hashedPassword,
                    role: 'DIRECTION'
                }
            });

            console.log('✅ Utilisateur migré vers DIRECTION !');
        } else {
            // Créer un nouveau compte admin avec les bonnes données
            const newAdmin = await prisma.user.create({
                data: {
                    firstName: 'Lionel',
                    lastName: 'Camboulives',
                    email: canonicalEmail,  // Email canonique pour les tests
                    password: hashedPassword,
                    phone: '06.63.78.69.68',
                    adress: 'École Saint-Mathieu',
                    role: 'DIRECTION'  // Rôle attendu par les tests
                }
            });

            console.log('🎉 Nouvel administrateur créé avec succès !');
        }

        console.log('\n📋 Identifiants de connexion :');
        console.log(`📧 Email: ${canonicalEmail}`);
        console.log('🔑 Mot de passe: Directeur2025!');
        console.log('🔒 Rôle: DIRECTION');
        console.log('\n✅ Vous pouvez maintenant vous connecter !');

        // Vérifier que l'admin peut bien se connecter
        const testAdmin = await prisma.user.findUnique({
            where: { email: canonicalEmail }
        });

        if (testAdmin && testAdmin.role === 'DIRECTION') {
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

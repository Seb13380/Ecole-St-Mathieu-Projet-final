// Script pour créer tous les utilisateurs principaux de l'école
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAllUsers() {
    try {
        console.log('🏫 === Création de tous les utilisateurs principaux de l\'École Saint-Mathieu ===\n');

        // 1. Créer Lionel Camboulives - Directeur
        console.log('👑 Création du directeur Lionel Camboulives...');
        const existingDirector = await prisma.user.findUnique({
            where: { email: 'l.camboulives@stmathieu.org' }
        });

        if (existingDirector) {
            console.log('⚠️  Lionel existe déjà, mise à jour...');
            await prisma.user.update({
                where: { email: 'l.camboulives@stmathieu.org' },
                data: {
                    firstName: 'Lionel',
                    lastName: 'Camboulives',
                    role: 'DIRECTION'
                }
            });
            console.log('✅ Lionel mis à jour');
        } else {
            const hashedPassword = await bcrypt.hash('Directeur2025!', 10);
            await prisma.user.create({
                data: {
                    firstName: 'Lionel',
                    lastName: 'Camboulives',
                    email: 'l.camboulives@stmathieu.org',
                    password: hashedPassword,
                    phone: '04.91.12.34.56',
                    adress: 'École Saint-Mathieu',
                    role: 'DIRECTION'
                }
            });
            console.log('✅ Lionel Camboulives créé (Directeur)');
        }

        // 2. Créer Frank - Maintenance du site
        console.log('\n🔧 Création de Frank pour la maintenance...');
        const existingFrank = await prisma.user.findUnique({
            where: { email: 'frank@stmathieu.org' }
        });

        if (existingFrank) {
            console.log('⚠️  Frank existe déjà, mise à jour...');
            await prisma.user.update({
                where: { email: 'frank@stmathieu.org' },
                data: {
                    firstName: 'Frank',
                    lastName: 'Gestionnaire Site',
                    role: 'GESTIONNAIRE_SITE'
                }
            });
            console.log('✅ Frank mis à jour');
        } else {
            const hashedPassword = await bcrypt.hash('Frank2025!', 10);
            await prisma.user.create({
                data: {
                    firstName: 'Frank',
                    lastName: 'Gestionnaire Site',
                    email: 'frank@stmathieu.org',
                    password: hashedPassword,
                    phone: '04.91.23.45.67',
                    adress: 'École Saint-Mathieu',
                    role: 'GESTIONNAIRE_SITE'
                }
            });
            console.log('✅ Frank créé (Gestionnaire site)');
        }

        // 3. Créer Yamina - Assistante de direction
        console.log('\n👩‍💼 Création de Yamina, assistante de direction...');
        const existingYamina = await prisma.user.findUnique({
            where: { email: 'yamina@ecole-saint-mathieu.fr' }
        });

        if (existingYamina) {
            console.log('⚠️  Yamina existe déjà, mise à jour...');
            await prisma.user.update({
                where: { email: 'yamina@ecole-saint-mathieu.fr' },
                data: {
                    firstName: 'Yamina',
                    lastName: 'Assistante',
                    role: 'ASSISTANT_DIRECTION'
                }
            });
            console.log('✅ Yamina mise à jour');
        } else {
            const hashedPassword = await bcrypt.hash('Yamina2025!', 10);
            await prisma.user.create({
                data: {
                    firstName: 'Yamina',
                    lastName: 'Assistante',
                    email: 'yamina@ecole-saint-mathieu.fr',
                    password: hashedPassword,
                    phone: '04.91.34.56.78',
                    adress: 'École Saint-Mathieu',
                    role: 'ASSISTANT_DIRECTION'
                }
            });
            console.log('✅ Yamina créée (Assistante de direction)');
        }

        // 4. Créer Sébastien Giordano - Administrateur
        console.log('\n👨‍💻 Création de Sébastien Giordano, administrateur...');
        const existingSeb = await prisma.user.findUnique({
            where: { email: 'sebastien.giordano@ecole-saint-mathieu.fr' }
        });

        if (existingSeb) {
            console.log('⚠️  Sébastien existe déjà, mise à jour...');
            await prisma.user.update({
                where: { email: 'sebastien.giordano@ecole-saint-mathieu.fr' },
                data: {
                    firstName: 'Sébastien',
                    lastName: 'Giordano',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Sébastien mis à jour');
        } else {
            const hashedPassword = await bcrypt.hash('Admin2025!', 10);
            await prisma.user.create({
                data: {
                    firstName: 'Sébastien',
                    lastName: 'Giordano',
                    email: 'sebastien.giordano@ecole-saint-mathieu.fr',
                    password: hashedPassword,
                    phone: '04.91.45.67.89',
                    adress: 'École Saint-Mathieu',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Sébastien Giordano créé (Administrateur)');
        }

        // 5. Créer Cécile - Contrôle restauration
        console.log('\n🍽️ Création de Cécile pour la restauration...');
        const existingCecile = await prisma.user.findUnique({
            where: { email: 'cecile@ecole-saint-mathieu.fr' }
        });

        if (existingCecile) {
            console.log('⚠️  Cécile existe déjà, mise à jour...');
            await prisma.user.update({
                where: { email: 'cecile@ecole-saint-mathieu.fr' },
                data: {
                    firstName: 'Cécile',
                    lastName: 'Restauration',
                    role: 'ADMIN' // Rôle admin pour gérer la restauration
                }
            });
            console.log('✅ Cécile mise à jour');
        } else {
            const hashedPassword = await bcrypt.hash('Cecile2025!', 10);
            await prisma.user.create({
                data: {
                    firstName: 'Cécile',
                    lastName: 'Restauration',
                    email: 'cecile@ecole-saint-mathieu.fr',
                    password: hashedPassword,
                    phone: '04.91.56.78.90',
                    adress: 'École Saint-Mathieu',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Cécile créée (Contrôle restauration)');
        }

        console.log('\n🎉 === Récapitulatif des comptes créés ===');
        console.log('👑 Lionel Camboulives (Directeur): l.camboulives@stmathieu.org / Directeur2025!');
        console.log('🔧 Frank (Gestionnaire Site): frank@stmathieu.org / Frank2025!');
        console.log('👩‍💼 Yamina (Assistante): yamina@ecole-saint-mathieu.fr / Yamina2025!');
        console.log('👨‍💻 Sébastien Giordano (Admin): sebastien.giordano@ecole-saint-mathieu.fr / Admin2025!');
        console.log('🍽️ Cécile (Restauration): cecile@ecole-saint-mathieu.fr / Cecile2025!');

        console.log('\n📋 === Permissions et accès ===');
        console.log('• Lionel: Accès complet direction + gestion invitations parents');
        console.log('• Frank: Gestionnaire technique du site + galerie');
        console.log('• Yamina: Assistance administrative');
        console.log('• Sébastien: Administration complète du système');
        console.log('• Cécile: Gestion élèves et tickets de restauration');

        console.log('\n⚠️ IMPORTANT: Changez ces mots de passe lors de la première connexion !');

    } catch (error) {
        console.error('❌ Erreur lors de la création des utilisateurs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
createAllUsers()
    .then(() => {
        console.log('\n✅ Tous les utilisateurs ont été créés avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });

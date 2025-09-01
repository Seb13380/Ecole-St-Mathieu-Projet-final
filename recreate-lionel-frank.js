const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function recreateLionelAndFrank() {
    try {
        console.log('🔐 Recréation de Lionel et Frank...');

        // === CRÉATION DE LIONEL (DIRECTION) ===
        console.log('\n👨‍💼 Création de Lionel Camboulives...');
        
        const lionelEmail = 'l.camboulives@stmathieu.org';
        const lionelPassword = await bcrypt.hash('Lionel123!', 10);

        // Vérifier si Lionel existe déjà
        const existingLionel = await prisma.user.findUnique({
            where: { email: lionelEmail }
        });

        if (existingLionel) {
            console.log('⚠️  Lionel existe déjà, mise à jour...');
            await prisma.user.update({
                where: { email: lionelEmail },
                data: {
                    password: lionelPassword,
                    role: 'DIRECTION',
                    firstName: 'Lionel',
                    lastName: 'Camboulives',
                    phone: '06.63.78.69.68',
                    adress: 'École Saint-Mathieu'
                }
            });
            console.log('✅ Lionel mis à jour avec succès !');
        } else {
            const lionel = await prisma.user.create({
                data: {
                    firstName: 'Lionel',
                    lastName: 'Camboulives',
                    email: lionelEmail,
                    password: lionelPassword,
                    phone: '06.63.78.69.68',
                    adress: 'École Saint-Mathieu',
                    role: 'DIRECTION'
                }
            });
            console.log('✅ Lionel créé avec succès !');
        }

        // === CRÉATION DE FRANK (GESTIONNAIRE_SITE) ===
        console.log('\n🔧 Création de Frank...');
        
        const frankEmail = 'frank.quaracino@orange.fr';
        const frankPassword = await bcrypt.hash('Frank123!', 10);

        // Vérifier si Frank existe déjà
        const existingFrank = await prisma.user.findUnique({
            where: { email: frankEmail }
        });

        if (existingFrank) {
            console.log('⚠️  Frank existe déjà, mise à jour...');
            await prisma.user.update({
                where: { email: frankEmail },
                data: {
                    password: frankPassword,
                    role: 'GESTIONNAIRE_SITE',
                    firstName: 'Frank',
                    lastName: 'Quaracino',
                    phone: '06.12.34.56.79',
                    adress: 'École Saint-Mathieu'
                }
            });
            console.log('✅ Frank mis à jour avec succès !');
        } else {
            const frank = await prisma.user.create({
                data: {
                    firstName: 'Frank',
                    lastName: 'Quaracino',
                    email: frankEmail,
                    password: frankPassword,
                    phone: '06.12.34.56.79',
                    adress: 'École Saint-Mathieu',
                    role: 'GESTIONNAIRE_SITE'
                }
            });
            console.log('✅ Frank créé avec succès !');
        }

        // === RÉCAPITULATIF ===
        console.log('\n🎉 RÉCAPITULATIF DES COMPTES CRÉÉS:');
        console.log('═══════════════════════════════════════');
        
        console.log('\n👨‍💼 LIONEL CAMBOULIVES (DIRECTION):');
        console.log(`📧 Email: ${lionelEmail}`);
        console.log('🔑 Mot de passe: Lionel123!');
        console.log('📱 Téléphone: 06.63.78.69.68');
        console.log('🔒 Rôle: DIRECTION');
        
        console.log('\n🔧 FRANK QUARACINO (GESTIONNAIRE SITE):');
        console.log(`📧 Email: ${frankEmail}`);
        console.log('🔑 Mot de passe: Frank123!');
        console.log('📱 Téléphone: 06.12.34.56.79');
        console.log('🔒 Rôle: GESTIONNAIRE_SITE');
        
        console.log('\n✅ Tous les comptes sont prêts à être utilisés !');
        console.log('⚠️  IMPORTANT: Changez ces mots de passe après la première connexion !');

        // Vérification finale
        const finalLionel = await prisma.user.findUnique({
            where: { email: lionelEmail }
        });
        
        const finalFrank = await prisma.user.findUnique({
            where: { email: frankEmail }
        });

        if (finalLionel && finalFrank) {
            console.log('\n✅ Vérification finale réussie - Tous les comptes sont opérationnels !');
        } else {
            console.log('\n❌ Problème avec la création des comptes');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la recréation des utilisateurs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
recreateLionelAndFrank()
    .then(() => {
        console.log('\n🎯 Script terminé avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erreur:', error);
        process.exit(1);
    });

// Script pour modifier l'email de Lionel et mettre à jour Frank
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updateUsers() {
    try {
        console.log('🔧 Mise à jour des utilisateurs...');

        // 1. Mettre à jour l'email de Lionel
        console.log('📧 Recherche de Lionel...');

        // Chercher Lionel par différents critères possibles
        let lionel = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'lionel@stmathieu.org' },
                    { email: 'lionel.camboulives@stmathieu.org' },
                    { firstName: 'Lionel' },
                    { lastName: { contains: 'Camboulives' } }
                ]
            }
        });

        if (lionel) {
            console.log('✅ Lionel trouvé:', lionel.email);

            // Mettre à jour son email
            const updatedLionel = await prisma.user.update({
                where: { id: lionel.id },
                data: {
                    email: 'l.camboulives@stmathieu.org',
                    firstName: 'Lionel',
                    lastName: 'Camboulives'
                }
            });

            console.log('✅ Email de Lionel mis à jour:', updatedLionel.email);
        } else {
            console.log('❌ Lionel non trouvé dans la base de données');
        }

        // 2. Créer ou mettre à jour Frank
        console.log('🔧 Gestion de Frank...');

        const existingFrank = await prisma.user.findUnique({
            where: { email: 'frank@stmathieu.org' }
        });

        if (existingFrank) {
            console.log('✅ Frank existe déjà, mise à jour de ses droits...');

            const updatedFrank = await prisma.user.update({
                where: { email: 'frank@stmathieu.org' },
                data: {
                    role: 'ADMIN', // Utiliser ADMIN temporairement
                    firstName: 'Frank',
                    lastName: 'Gestionnaire Site'
                }
            });

            console.log('✅ Droits de Frank mis à jour:', updatedFrank.role);
        } else {
            console.log('🆕 Création de Frank...');

            const hashedPassword = await bcrypt.hash('Frank2025!', 10);

            const frank = await prisma.user.create({
                data: {
                    firstName: 'Frank',
                    lastName: 'Gestionnaire Site',
                    email: 'frank@stmathieu.org',
                    password: hashedPassword,
                    phone: '06.12.34.56.79',
                    adress: 'École Saint-Mathieu',
                    role: 'ADMIN' // Utiliser ADMIN temporairement, on changera ensuite
                }
            });

            console.log('✅ Frank créé avec succès:', frank.email);
            console.log('🔑 Mot de passe: Frank2025!');
        }

        // 3. Mettre à jour les anciens rôles MAINTENANCE_SITE vers GESTIONNAIRE_SITE
        console.log('🔄 Migration des rôles reportée - garder MAINTENANCE_SITE pour le moment');

        // const updatedRoles = await prisma.user.updateMany({
        //     where: { role: 'MAINTENANCE_SITE' },
        //     data: { role: 'GESTIONNAIRE_SITE' }
        // });

        // if (updatedRoles.count > 0) {
        //     console.log(`✅ ${updatedRoles.count} utilisateur(s) migré(s) de MAINTENANCE_SITE vers GESTIONNAIRE_SITE`);
        // }

        // 4. Afficher un résumé des utilisateurs admin
        console.log('\n📋 Résumé des utilisateurs administratifs:');

        const adminUsers = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'DIRECTION']
                }
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });

        adminUsers.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
updateUsers()
    .then(() => {
        console.log('\n✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updateUserCredentials() {
    try {
        console.log('=== MISE À JOUR DES IDENTIFIANTS ===\n');

        // Nouveaux mots de passe
        const lionelPassword = 'Lionel123!';
        const frankPassword = 'Frank123!';

        // Hash des mots de passe
        const lionelHash = await bcrypt.hash(lionelPassword, 10);
        const frankHash = await bcrypt.hash(frankPassword, 10);

        // Mise à jour Lionel
        console.log('🔄 Mise à jour de Lionel...');
        const lionelUpdate = await prisma.user.update({
            where: { email: 'l.camboulives@stmathieu.org' },
            data: { 
                email: 'l.camboulives@stmathieu.org',
                password: lionelHash 
            },
            select: { id: true, email: true, firstName: true, lastName: true, role: true }
        });

        console.log('✅ LIONEL mis à jour:');
        console.log('  - Email:', lionelUpdate.email);
        console.log('  - Nom:', lionelUpdate.firstName, lionelUpdate.lastName);
        console.log('  - Rôle:', lionelUpdate.role);
        console.log('  - Nouveau mot de passe:', lionelPassword);

        // Mise à jour Frank - d'abord chercher s'il existe
        let frank = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'frank@stmathieu.org' },
                    { firstName: { contains: 'Frank' } }
                ]
            }
        });

        if (frank) {
            console.log('\n🔄 Mise à jour de Frank...');
            const frankUpdate = await prisma.user.update({
                where: { id: frank.id },
                data: { 
                    email: 'frank.quaracino@orange.fr',
                    password: frankHash,
                    lastName: 'Quaracino'
                },
                select: { id: true, email: true, firstName: true, lastName: true, role: true }
            });

            console.log('✅ FRANK mis à jour:');
            console.log('  - Email:', frankUpdate.email);
            console.log('  - Nom:', frankUpdate.firstName, frankUpdate.lastName);
            console.log('  - Rôle:', frankUpdate.role);
            console.log('  - Nouveau mot de passe:', frankPassword);
        } else {
            console.log('\n🆕 Création de Frank...');
            const newFrank = await prisma.user.create({
                data: {
                    firstName: 'Frank',
                    lastName: 'Quaracino',
                    email: 'frank.quaracino@orange.fr',
                    password: frankHash,
                    role: 'GESTIONNAIRE_SITE',
                    adress: '123 Rue de l\'École',
                    phone: '0123456789'
                },
                select: { id: true, email: true, firstName: true, lastName: true, role: true }
            });

            console.log('✅ FRANK créé:');
            console.log('  - Email:', newFrank.email);
            console.log('  - Nom:', newFrank.firstName, newFrank.lastName);
            console.log('  - Rôle:', newFrank.role);
            console.log('  - Nouveau mot de passe:', frankPassword);
        }

        console.log('\n=== NOUVEAUX IDENTIFIANTS FINAUX ===');
        console.log('🔐 LIONEL:');
        console.log('   Email: l.camboulives@stmathieu.org');
        console.log('   Mot de passe: Lionel123!');

        console.log('\n🔐 FRANK:');
        console.log('   Email: frank.quaracino@orange.fr');
        console.log('   Mot de passe: Frank123!');

        console.log('\n🎉 Mise à jour terminée !');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserCredentials();

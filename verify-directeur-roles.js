#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDirecteurRoles() {
    try {
        console.log('ðŸ” === VÃ‰RIFICATION RÃ”LES DIRECTEUR ===');
        console.log('==\n');

        // VÃ©rifier Lionel
        const lionel = await prisma.user.findFirst({
            where: { username: 'lionel' },
            include: { role: true }
        });

        if (lionel) {
            console.log('ðŸ‘¨â€ðŸ’¼ LIONEL:');
            console.log(`   ID: ${lionel.id}`);
            console.log(`   Username: ${lionel.username}`);
            console.log(`   Email: ${lionel.email}`);
            console.log(`   RÃ´le: ${lionel.role?.name || 'AUCUN'}`);
            console.log(`   RÃ´le ID: ${lionel.role?.id || 'N/A'}`);
        } else {
            console.log('âŒ Lionel non trouvÃ©');
        }

        console.log('');

        // VÃ©rifier Frank
        const frank = await prisma.user.findFirst({
            where: { username: 'frank' },
            include: { role: true }
        });

        if (frank) {
            console.log('ðŸ‘¨â€ðŸ’¼ FRANK:');
            console.log(`   ID: ${frank.id}`);
            console.log(`   Username: ${frank.username}`);
            console.log(`   Email: ${frank.email}`);
            console.log(`   RÃ´le: ${frank.role?.name || 'AUCUN'}`);
            console.log(`   RÃ´le ID: ${frank.role?.id || 'N/A'}`);
        } else {
            console.log('âŒ Frank non trouvÃ©');
        }

        console.log('\nðŸ·ï¸ === TOUS LES RÃ”LES ===');
        console.log('===');
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' }
        });

        roles.forEach(role => {
            console.log(`   ${role.id}: ${role.name}`);
        });

        console.log('\nðŸ‘¥ === UTILISATEURS AVEC RÃ”LE DIRECTEUR ===');
        console.log('');
        const directeurs = await prisma.user.findMany({
            where: {
                role: {
                    name: 'DIRECTEUR'
                }
            },
            include: { role: true }
        });

        if (directeurs.length > 0) {
            directeurs.forEach(user => {
                console.log(`   ${user.username} (${user.email}) - RÃ´le: ${user.role?.name}`);
            });
        } else {
            console.log('   âŒ Aucun utilisateur avec le rÃ´le DIRECTEUR trouvÃ©');
        }

    } catch (error) {
        console.error('âŒ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDirecteurRoles();


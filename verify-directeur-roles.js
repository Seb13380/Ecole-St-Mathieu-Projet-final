#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDirecteurRoles() {
    try {
        console.log('🔍 === VÉRIFICATION RÔLES DIRECTEUR ===');
        console.log('=====================================\n');

        // Vérifier Lionel
        const lionel = await prisma.user.findFirst({
            where: { username: 'lionel' },
            include: { role: true }
        });

        if (lionel) {
            console.log('👨‍💼 LIONEL:');
            console.log(`   ID: ${lionel.id}`);
            console.log(`   Username: ${lionel.username}`);
            console.log(`   Email: ${lionel.email}`);
            console.log(`   Rôle: ${lionel.role?.name || 'AUCUN'}`);
            console.log(`   Rôle ID: ${lionel.role?.id || 'N/A'}`);
        } else {
            console.log('❌ Lionel non trouvé');
        }

        console.log('');

        // Vérifier Frank
        const frank = await prisma.user.findFirst({
            where: { username: 'frank' },
            include: { role: true }
        });

        if (frank) {
            console.log('👨‍💼 FRANK:');
            console.log(`   ID: ${frank.id}`);
            console.log(`   Username: ${frank.username}`);
            console.log(`   Email: ${frank.email}`);
            console.log(`   Rôle: ${frank.role?.name || 'AUCUN'}`);
            console.log(`   Rôle ID: ${frank.role?.id || 'N/A'}`);
        } else {
            console.log('❌ Frank non trouvé');
        }

        console.log('\n🏷️ === TOUS LES RÔLES ===');
        console.log('========================');
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' }
        });

        roles.forEach(role => {
            console.log(`   ${role.id}: ${role.name}`);
        });

        console.log('\n👥 === UTILISATEURS AVEC RÔLE DIRECTEUR ===');
        console.log('==========================================');
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
                console.log(`   ${user.username} (${user.email}) - Rôle: ${user.role?.name}`);
            });
        } else {
            console.log('   ❌ Aucun utilisateur avec le rôle DIRECTEUR trouvé');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDirecteurRoles();

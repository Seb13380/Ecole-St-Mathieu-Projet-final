#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🏷️ RÔLES DISPONIBLES:');
        const roles = await prisma.role.findMany();
        roles.forEach(r => console.log('   ', r.name));

        console.log('\n👥 UTILISATEURS LIONEL ET FRANK:');
        const users = await prisma.user.findMany({
            where: { username: { in: ['lionel', 'frank'] } },
            include: { role: true }
        });
        users.forEach(u => console.log('   ', u.username, '->', u.role?.name || 'AUCUN'));

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

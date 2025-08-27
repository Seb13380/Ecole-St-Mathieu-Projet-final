const express = require('express');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAdminSession() {
    try {
        // Cherchons un utilisateur admin
        const admin = await prisma.user.findFirst({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { role: 'DIRECTION' },
                    { role: 'GESTIONNAIRE_SITE' }
                ]
            }
        });

        if (!admin) {
            console.log('Aucun utilisateur admin trouvé');
            return;
        }

        console.log('Utilisateur admin trouvé:');
        console.log('- ID:', admin.id);
        console.log('- Email:', admin.email);
        console.log('- Nom:', admin.firstName, admin.lastName);
        console.log('- Rôle:', admin.role);

        // Pour tester, vous devrez vous connecter avec cet utilisateur
        console.log('\n=== Instructions pour tester ===');
        console.log('1. Allez sur http://localhost:3007/login');
        console.log(`2. Connectez-vous avec l'email: ${admin.email}`);
        console.log('3. Utilisez le mot de passe que vous connaissez pour cet utilisateur');
        console.log('4. Allez ensuite sur http://localhost:3007/documents/admin');
        console.log('5. Testez les boutons de publication/suppression');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminSession();

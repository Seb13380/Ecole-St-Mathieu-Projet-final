// Test complet du système de gestion des menus PDF
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompleteMenuSystem() {
    console.log('Test complet du systeme de gestion des menus PDF...\n');

    try {
        // 1. Vérifier les utilisateurs autorisés
        console.log('1. Utilisateurs autorises pour gerer les menus PDF:');

        const authorizedUsers = await prisma.user.findMany({
            where: {
                role: {
                    in: ['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']
                }
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });

        authorizedUsers.forEach(user => {
            console.log(`   - ${user.firstName} ${user.lastName} (${user.role}) : ${user.email}`);
        });

        console.log('\n2. Menus actuellement en base:');

        const menus = await prisma.menu.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (menus.length > 0) {
            menus.forEach((menu, index) => {
                console.log(`   ${index + 1}. ${menu.semaine}`);
                console.log(`      Statut: ${menu.statut} (Actif: ${menu.actif})`);
                console.log(`      Auteur: ${menu.auteur?.firstName} ${menu.auteur?.lastName}`);
                console.log(`      Fichier: ${menu.pdfUrl ? 'OK' : 'MANQUANT'}`);
                console.log('');
            });
        } else {
            console.log('   Aucun menu en base');
        }

        console.log('3. Routes disponibles:');
        console.log('   - Gestion: http://localhost:3007/admin/menus-pdf');
        console.log('   - Affichage public: http://localhost:3007/restauration/menus');
        console.log('   - Alternative: http://localhost:3007/menus');

        console.log('\n4. Test a effectuer:');
        console.log('   a) Se connecter avec un compte autorise');
        console.log('   b) Aller sur /admin/menus-pdf');
        console.log('   c) Uploader un nouveau menu PDF');
        console.log('   d) Verifier l\'affichage sur /restauration/menus');

        console.log('\n5. Mots de passe:');
        console.log('   - Lionel: Directeur2025!');
        console.log('   - Frank: Maintenance2025!');
        console.log('   - Sebastien: Admin2025!');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCompleteMenuSystem();

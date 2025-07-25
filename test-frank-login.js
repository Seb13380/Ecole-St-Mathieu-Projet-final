// Test connexion Frank et accès menus PDF
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testFrankMenuAccess() {
    console.log('Test connexion Frank et acces menus PDF...\n');

    try {
        // Test de connexion Frank
        const frank = await prisma.user.findUnique({
            where: { email: 'frank.maintenance@ecole-saint-mathieu.fr' }
        });

        if (frank) {
            console.log('Frank trouve :');
            console.log(`   Nom: ${frank.firstName} ${frank.lastName}`);
            console.log(`   Email: ${frank.email}`);
            console.log(`   Role: ${frank.role}`);

            // Test du mot de passe
            const passwordValid = await bcrypt.compare('Maintenance2025!', frank.password);
            console.log(`   Mot de passe valide: ${passwordValid ? 'Oui' : 'Non'}`);

            // Test des permissions
            const allowedRoles = ['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN'];
            const hasMenuAccess = allowedRoles.includes(frank.role);
            console.log(`   Acces menus PDF: ${hasMenuAccess ? 'Autorise' : 'Refuse'}`);

            console.log('\nSimulation acces au systeme de menus :');
            if (hasMenuAccess) {
                console.log('   Route /admin/menus-pdf -> Acces autorise');
                console.log('   Peut uploader des PDFs');
                console.log('   Peut gerer les statuts des menus');
                console.log('   Peut supprimer des menus');
            } else {
                console.log('   Route /admin/menus-pdf -> Acces refuse');
            }

            console.log('\nPour tester manuellement :');
            console.log('   1. Aller sur http://localhost:3007/login');
            console.log('   2. Se connecter avec frank.maintenance@ecole-saint-mathieu.fr');
            console.log('   3. Mot de passe: Maintenance2025!');
            console.log('   4. Aller sur http://localhost:3007/admin/menus-pdf');
            console.log('   5. Uploader un menu PDF');
            console.log('   6. Verifier dans /restauration que le menu apparait');

        } else {
            console.log('Frank non trouve');
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFrankMenuAccess();

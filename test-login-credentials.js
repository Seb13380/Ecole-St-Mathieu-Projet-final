const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testCredentials() {
    try {
        console.log('=== TEST DES NOUVEAUX IDENTIFIANTS ===\n');

        // Test Lionel
        console.log('🧪 Test de connexion Lionel...');
        const lionel = await prisma.user.findUnique({
            where: { email: 'l.camboulives@stmathieu.org' },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, password: true }
        });

        if (lionel) {
            const lionelPasswordMatch = await bcrypt.compare('Lionel123!', lionel.password);
            console.log('✅ Lionel trouvé:');
            console.log('  - Email:', lionel.email);
            console.log('  - Nom:', lionel.firstName, lionel.lastName);
            console.log('  - Rôle:', lionel.role);
            console.log('  - Mot de passe correct:', lionelPasswordMatch ? '✅ OUI' : '❌ NON');
        } else {
            console.log('❌ Lionel non trouvé');
        }

        // Test Frank
        console.log('\n🧪 Test de connexion Frank...');
        const frank = await prisma.user.findUnique({
            where: { email: 'frank.quaracino@orange.fr' },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, password: true }
        });

        if (frank) {
            const frankPasswordMatch = await bcrypt.compare('Frank123!', frank.password);
            console.log('✅ Frank trouvé:');
            console.log('  - Email:', frank.email);
            console.log('  - Nom:', frank.firstName, frank.lastName);
            console.log('  - Rôle:', frank.role);
            console.log('  - Mot de passe correct:', frankPasswordMatch ? '✅ OUI' : '❌ NON');
        } else {
            console.log('❌ Frank non trouvé');
        }

        console.log('\n=== RÉSUMÉ DES IDENTIFIANTS DE CONNEXION ===');
        console.log('🔐 Pour se connecter au système:');
        console.log('\n👤 LIONEL CAMBOULIVES (Directeur):');
        console.log('   Email: l.camboulives@stmathieu.org');
        console.log('   Mot de passe: Lionel123!');
        console.log('   Rôle: DIRECTION');
        console.log('   Accès: Gestion complète, invitations parents, administration');

        console.log('\n👤 FRANK QUARACINO (Gestionnaire site):');
        console.log('   Email: frank.quaracino@orange.fr');
        console.log('   Mot de passe: Frank123!');
        console.log('   Rôle: GESTIONNAIRE_SITE');
        console.log('   Accès: Gestion contenus, carousel, actualités, travaux');

        console.log('\n🌐 URLs:');
        console.log('   Local: http://localhost:3007');
        console.log('   VPS: http://82.165.44.88:3007');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCredentials();

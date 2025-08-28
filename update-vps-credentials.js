const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Configuration pour la base de données VPS
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'mysql://u1116_pGdCBBbKwS:w%231BETwxe%5EKzWB%40Fx4%40@127.0.0.1:3306/s1116_ecole_st_mathieu'
        }
    }
});

async function updateVPSCredentials() {
    try {
        console.log('=== MISE À JOUR IDENTIFIANTS VPS ===\n');

        // Nouveaux mots de passe
        const lionelPassword = 'Lionel123!';
        const frankPassword = 'Frank123!';

        // Hash des mots de passe
        const lionelHash = await bcrypt.hash(lionelPassword, 10);
        const frankHash = await bcrypt.hash(frankPassword, 10);

        // Vérifier et créer Lionel si nécessaire
        let lionel = await prisma.user.findUnique({
            where: { email: 'l.camboulives@stmathieu.org' }
        });

        if (!lionel) {
            // Chercher par nom
            lionel = await prisma.user.findFirst({
                where: { 
                    AND: [
                        { firstName: { contains: 'Lionel' } },
                        { lastName: { contains: 'Camboulives' } }
                    ]
                }
            });
        }

        if (lionel) {
            console.log('🔄 Mise à jour de Lionel...');
            const lionelUpdate = await prisma.user.update({
                where: { id: lionel.id },
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
        } else {
            console.log('🆕 Création de Lionel...');
            const newLionel = await prisma.user.create({
                data: {
                    firstName: 'Lionel',
                    lastName: 'Camboulives',
                    email: 'l.camboulives@stmathieu.org',
                    password: lionelHash,
                    role: 'DIRECTION',
                    adress: 'École St Mathieu',
                    phone: '0123456789'
                },
                select: { id: true, email: true, firstName: true, lastName: true, role: true }
            });

            console.log('✅ LIONEL créé:');
            console.log('  - Email:', newLionel.email);
            console.log('  - Nom:', newLionel.firstName, newLionel.lastName);
            console.log('  - Rôle:', newLionel.role);
            console.log('  - Nouveau mot de passe:', lionelPassword);
        }

        // Vérifier et créer/mettre à jour Frank
        let frank = await prisma.user.findUnique({
            where: { email: 'frank.quaracino@orange.fr' }
        });

        if (!frank) {
            // Chercher par nom
            frank = await prisma.user.findFirst({
                where: {
                    OR: [
                        { firstName: { contains: 'Frank' } },
                        { email: { contains: 'frank' } }
                    ]
                }
            });
        }

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
                    adress: 'École St Mathieu',
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

        console.log('\n=== IDENTIFIANTS VPS FINAUX ===');
        console.log('🔐 LIONEL (DIRECTION):');
        console.log('   Email: l.camboulives@stmathieu.org');
        console.log('   Mot de passe: Lionel123!');

        console.log('\n🔐 FRANK (GESTIONNAIRE):');
        console.log('   Email: frank.quaracino@orange.fr');
        console.log('   Mot de passe: Frank123!');

        console.log('\n🎉 Mise à jour VPS terminée !');
        console.log('\n📝 Prochaines étapes:');
        console.log('   1. Tester la connexion sur le VPS avec ces identifiants');
        console.log('   2. Utiliser deploy-safe.sh pour le prochain déploiement');
        console.log('   3. Communiquer les identifiants à Lionel et Frank');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour VPS:', error);
        if (error.code === 'P2002') {
            console.error('   Erreur: Email déjà utilisé');
        }
    } finally {
        await prisma.$disconnect();
    }
}

updateVPSCredentials();

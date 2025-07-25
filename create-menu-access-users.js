// Création des comptes Frank et Sébastien avec accès aux menus PDF
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUsersWithMenuAccess() {
    console.log('Creation des comptes Frank et Sebastien...\n');

    try {
        // Créer Frank (Maintenance)
        const frankPassword = 'Maintenance2025!';
        const frankHashedPassword = await bcrypt.hash(frankPassword, 10);

        const frank = await prisma.user.upsert({
            where: { email: 'frank.maintenance@ecole-saint-mathieu.fr' },
            update: {
                role: 'MAINTENANCE_SITE'
            },
            create: {
                email: 'frank.maintenance@ecole-saint-mathieu.fr',
                password: frankHashedPassword,
                firstName: 'Frank',
                lastName: 'Maintenance',
                adress: 'École Saint-Mathieu',
                phone: '0123456789',
                role: 'MAINTENANCE_SITE'
            }
        });

        console.log('Frank cree/mis a jour :');
        console.log(`   Nom: ${frank.firstName} ${frank.lastName}`);
        console.log(`   Email: ${frank.email}`);
        console.log(`   Role: ${frank.role}`);
        console.log(`   Mot de passe: ${frankPassword}`);
        console.log(`   Acces menus PDF: Autorise`);

        console.log('\n' + '='.repeat(50) + '\n');

        // Créer Sébastien (Admin)
        const sebastienPassword = 'Admin2025!';
        const sebastienHashedPassword = await bcrypt.hash(sebastienPassword, 10);

        const sebastien = await prisma.user.upsert({
            where: { email: 'sebastien.admin@ecole-saint-mathieu.fr' },
            update: {
                role: 'ADMIN'
            },
            create: {
                email: 'sebastien.admin@ecole-saint-mathieu.fr',
                password: sebastienHashedPassword,
                firstName: 'Sébastien',
                lastName: 'Administrateur',
                adress: 'École Saint-Mathieu',
                phone: '0123456790',
                role: 'ADMIN'
            }
        });

        console.log('Sebastien cree/mis a jour :');
        console.log(`   Nom: ${sebastien.firstName} ${sebastien.lastName}`);
        console.log(`   Email: ${sebastien.email}`);
        console.log(`   Role: ${sebastien.role}`);
        console.log(`   Mot de passe: ${sebastienPassword}`);
        console.log(`   Acces menus PDF: Autorise`);

        console.log('\n' + '='.repeat(50) + '\n');

        console.log('RECAPITULATIF - Acces a la gestion des menus PDF :');
        console.log('1. Lionel (Direction) : lionel.camboulives@ecole-saint-mathieu.fr / Directeur2025!');
        console.log('2. Frank (Maintenance) : frank.maintenance@ecole-saint-mathieu.fr / Maintenance2025!');
        console.log('3. Sebastien (Admin) : sebastien.admin@ecole-saint-mathieu.fr / Admin2025!');

        console.log('\nLien direct : http://localhost:3007/admin/menus-pdf');

        console.log('\nFonctionnalites disponibles :');
        console.log('- Upload de menus PDF');
        console.log('- Gestion du statut (actif/planifie/brouillon/archive)');
        console.log('- Suppression de menus');
        console.log('- Visualisation des menus actifs dans /restauration');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createUsersWithMenuAccess();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function addMissingUsers() {
    console.log('🔧 Ajout des utilisateurs manquants avec les bons rôles...');

    try {
        // 1. ADMIN - Sébastien GIORDANO (Accès total) - Nouvel email
        console.log('1. Ajout de l\'admin principal...');
        const adminHash = await bcrypt.hash('Admin2025!', 10);
        await prisma.user.upsert({
            where: { email: 'sebastien.giordano@admin.fr' },
            update: {
                role: 'ADMIN',
                firstName: 'Sébastien',
                lastName: 'GIORDANO'
            },
            create: {
                firstName: 'Sébastien',
                lastName: 'GIORDANO',
                email: 'sebastien.giordano@admin.fr',
                password: adminHash,
                role: 'ADMIN',
                phone: '0600000000',
                adress: 'Administrateur technique'
            }
        });
        console.log('✅ ADMIN - sebastien.giordano@admin.fr créé/mis à jour');

        // 2. RESTAURATION - Nadine (Tickets restauration/étude)
        console.log('2. Ajout de Nadine restauration...');
        const nadineHash = await bcrypt.hash('Nadine2025!', 10);
        await prisma.user.upsert({
            where: { email: 'nadine.restauration@ecole-saint-mathieu.fr' },
            update: {
                role: 'RESTAURATION',
                firstName: 'Nadine',
                lastName: 'Restauration'
            },
            create: {
                firstName: 'Nadine',
                lastName: 'Restauration',
                email: 'nadine.restauration@ecole-saint-mathieu.fr',
                password: nadineHash,
                role: 'RESTAURATION',
                phone: '0600000006',
                adress: 'École Saint-Mathieu'
            }
        });
        console.log('✅ RESTAURATION - Nadine créée');

        // 3. Corriger le rôle de Yamina (actuellement ASSISTANT_DIRECTION)
        console.log('3. Correction du rôle de Yamina...');
        await prisma.user.update({
            where: { email: 'yamina@ecole-saint-mathieu.fr' },
            data: {
                role: 'SECRETAIRE_DIRECTION',
                firstName: 'Yamina',
                lastName: 'Secrétaire'
            }
        });
        console.log('✅ YAMINA - Rôle corrigé vers SECRETAIRE_DIRECTION');

        // 4. Corriger l'email de Cécile (actuellement plusieurs)
        console.log('4. Correction des comptes de Cécile...');
        const cecileHash = await bcrypt.hash('Cecile2025!', 10);
        await prisma.user.upsert({
            where: { email: 'cecile.restauration@ecole-saint-mathieu.fr' },
            update: {
                role: 'RESTAURATION',
                firstName: 'Cécile',
                lastName: 'Restauration'
            },
            create: {
                firstName: 'Cécile',
                lastName: 'Restauration',
                email: 'cecile.restauration@ecole-saint-mathieu.fr',
                password: cecileHash,
                role: 'RESTAURATION',
                phone: '0600000005',
                adress: 'École Saint-Mathieu'
            }
        });
        console.log('✅ RESTAURATION - Cécile email standardisé');

        console.log('\n🎯 HIÉRARCHIE DES RÔLES FINALISÉE :');
        console.log('┌─ ADMIN : Sébastien (sebastien.giordano@admin.fr), Lionel (l.camboulives@orange.fr), Cécile (cecile@ecole-saint-mathieu.fr)');
        console.log('├─ DIRECTION : Lionel (lionel.camboulives@ecole-saint-mathieu.fr)');
        console.log('├─ MAINTENANCE_SITE : Frank (frank@ecole-saint-mathieu.fr)');
        console.log('├─ SECRETAIRE_DIRECTION : Yamina (yamina@ecole-saint-mathieu.fr)');
        console.log('├─ RESTAURATION : Cécile (cecile.restauration@ecole-saint-mathieu.fr), Nadine (nadine.restauration@ecole-saint-mathieu.fr)');
        console.log('└─ PARENT : Sébastien (sebcecg@gmail.com)');

        console.log('\n🔑 NOUVEAUX MOTS DE PASSE :');
        console.log('🔐 sebastien.giordano@admin.fr / Admin2025!');
        console.log('🔐 nadine.restauration@ecole-saint-mathieu.fr / Nadine2025!');
        console.log('🔐 cecile.restauration@ecole-saint-mathieu.fr / Cecile2025!');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addMissingUsers();

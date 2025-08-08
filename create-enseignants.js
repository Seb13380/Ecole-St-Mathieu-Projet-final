const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createEnseignants() {
    console.log('👩‍🏫 Création des comptes ENSEIGNANTS...');

    try {
        // Enseignants exemples pour l'École Saint-Mathieu
        const enseignants = [
            {
                firstName: 'Marie',
                lastName: 'Dubois',
                email: 'marie.dubois@ecole-saint-mathieu.fr',
                phone: '0601010101',
                password: 'Enseignant2025!'
            },
            {
                firstName: 'Pierre',
                lastName: 'Martin',
                email: 'pierre.martin@ecole-saint-mathieu.fr',
                phone: '0601010102',
                password: 'Enseignant2025!'
            },
            {
                firstName: 'Sophie',
                lastName: 'Leroy',
                email: 'sophie.leroy@ecole-saint-mathieu.fr',
                phone: '0601010103',
                password: 'Enseignant2025!'
            },
            {
                firstName: 'Thomas',
                lastName: 'Moreau',
                email: 'thomas.moreau@ecole-saint-mathieu.fr',
                phone: '0601010104',
                password: 'Enseignant2025!'
            },
            {
                firstName: 'Claire',
                lastName: 'Bernard',
                email: 'claire.bernard@ecole-saint-mathieu.fr',
                phone: '0601010105',
                password: 'Enseignant2025!'
            }
        ];

        for (const prof of enseignants) {
            const hashedPassword = await bcrypt.hash(prof.password, 10);

            await prisma.user.upsert({
                where: { email: prof.email },
                update: {
                    role: 'ENSEIGNANT',
                    firstName: prof.firstName,
                    lastName: prof.lastName
                },
                create: {
                    firstName: prof.firstName,
                    lastName: prof.lastName,
                    email: prof.email,
                    password: hashedPassword,
                    role: 'ENSEIGNANT',
                    phone: prof.phone,
                    adress: 'École Saint-Mathieu'
                }
            });

            console.log(`✅ ENSEIGNANT - ${prof.firstName} ${prof.lastName} créé(e)`);
        }

        console.log('\n🎯 HIÉRARCHIE COMPLÈTE MISE À JOUR :');
        console.log('┌─ ADMIN : Accès total système (Sébastien, Lionel ancien)');
        console.log('├─ DIRECTION : Gestion école (Lionel)');
        console.log('├─ ENSEIGNANT : Gestion classes, notes, actualités pédago');
        console.log('├─ MAINTENANCE_SITE : Contenu site (Franck)');
        console.log('├─ SECRETAIRE_DIRECTION : Comptabilité (Yamina)');
        console.log('├─ RESTAURATION : Tickets (Cécile, Nadine)');
        console.log('└─ PARENT : Consultation après invitation');

        console.log('\n📚 PERMISSIONS ENSEIGNANTS :');
        console.log('✅ Gestion des classes assignées');
        console.log('✅ Saisie et consultation des notes');
        console.log('✅ Gestion des absences élèves');
        console.log('✅ Création d\'actualités pédagogiques');
        console.log('✅ Consultation emplois du temps');
        console.log('✅ Messagerie avec parents/direction');
        console.log('❌ Pas d\'accès admin/technique');
        console.log('❌ Pas d\'accès gestion tickets restaurant');

        console.log('\n🔑 COMPTES ENSEIGNANTS CRÉÉS :');
        enseignants.forEach(prof => {
            console.log(`🔐 ${prof.email} / ${prof.password}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createEnseignants();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupUsers() {
    try {
        console.log('🔧 Configuration des utilisateurs principaux...\n');

        // 1. Mettre à jour le rôle de Lionel : ADMIN → DIRECTEUR
        console.log('👨‍💼 Mise à jour du rôle de Lionel Camboulives...');
        const lionel = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (lionel) {
            await prisma.user.update({
                where: { email: 'l.camboulives@orange.fr' },
                data: { role: 'DIRECTEUR' }
            });
            console.log('✅ Lionel Camboulives mis à jour : ADMIN → DIRECTEUR');
        } else {
            console.log('❌ Compte de Lionel non trouvé');
        }

        // 2. Créer votre compte SUPER_ADMIN
        console.log('\n🛠️ Création du compte SUPER_ADMIN...');
        const superAdminEmail = 'admin@st-mathieu.fr'; // Changez par votre email
        const superAdminPassword = 'SuperAdmin2025!'; // Changez par votre mot de passe

        const existingSuperAdmin = await prisma.user.findUnique({
            where: { email: superAdminEmail }
        });

        if (!existingSuperAdmin) {
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

            await prisma.user.create({
                data: {
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: superAdminEmail,
                    password: hashedPassword,
                    phone: '00.00.00.00.00',
                    adress: 'École Saint-Mathieu',
                    role: 'SUPER_ADMIN'
                }
            });
            console.log('✅ Compte SUPER_ADMIN créé');
        } else {
            console.log('⚠️ Compte SUPER_ADMIN existe déjà');
        }

        // 3. Créer un compte ASSISTANT_DIRECTION (optionnel)
        console.log('\n👩‍💼 Création du compte ASSISTANT_DIRECTION...');
        const assistantEmail = 'assistant@st-mathieu.fr'; // Changez par l'email de l'assistante
        const assistantPassword = 'Assistant2025!';

        const existingAssistant = await prisma.user.findUnique({
            where: { email: assistantEmail }
        });

        if (!existingAssistant) {
            const hashedPassword = await bcrypt.hash(assistantPassword, 10);

            await prisma.user.create({
                data: {
                    firstName: 'Assistant',
                    lastName: 'Direction',
                    email: assistantEmail,
                    password: hashedPassword,
                    phone: '00.00.00.00.00',
                    adress: 'École Saint-Mathieu',
                    role: 'ASSISTANT_DIRECTION'
                }
            });
            console.log('✅ Compte ASSISTANT_DIRECTION créé');
        } else {
            console.log('⚠️ Compte ASSISTANT_DIRECTION existe déjà');
        }

        // 4. Créer un compte APEL (optionnel)
        console.log('\n👨‍👩‍👧‍👦 Création du compte APEL...');
        const apelEmail = 'apel@st-mathieu.fr'; // Changez par l'email de l'APEL
        const apelPassword = 'Apel2025!';

        const existingApel = await prisma.user.findUnique({
            where: { email: apelEmail }
        });

        if (!existingApel) {
            const hashedPassword = await bcrypt.hash(apelPassword, 10);

            await prisma.user.create({
                data: {
                    firstName: 'Responsable',
                    lastName: 'APEL',
                    email: apelEmail,
                    password: hashedPassword,
                    phone: '00.00.00.00.00',
                    adress: 'École Saint-Mathieu',
                    role: 'APEL'
                }
            });
            console.log('✅ Compte APEL créé');
        } else {
            console.log('⚠️ Compte APEL existe déjà');
        }

        // Affichage des comptes créés
        console.log('\n📋 RÉCAPITULATIF DES COMPTES :');
        console.log('=====================================');

        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ['SUPER_ADMIN', 'DIRECTEUR', 'ASSISTANT_DIRECTION', 'APEL']
                }
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
            },
            orderBy: {
                role: 'asc'
            }
        });

        users.forEach(user => {
            console.log(`📧 ${user.role}: ${user.firstName} ${user.lastName} (${user.email})`);
        });

        console.log('\n🔑 MOTS DE PASSE :');
        console.log('=====================================');
        console.log('🎯 DIRECTEUR (Lionel): StMathieu2025!');
        console.log('🛠️ SUPER_ADMIN: SuperAdmin2025!');
        console.log('👩‍💼 ASSISTANT_DIRECTION: Assistant2025!');
        console.log('👨‍👩‍👧‍👦 APEL: Apel2025!');

        console.log('\n⚠️ IMPORTANT: Changez ces mots de passe après la première connexion !');
        console.log('✅ Configuration terminée avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupUsers();

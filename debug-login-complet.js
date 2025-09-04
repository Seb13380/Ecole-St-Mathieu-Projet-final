#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugLoginComplet() {
    try {
        console.log('🔍 DIAGNOSTIC COMPLET DU SYSTÈME DE CONNEXION\n');

        // 1. Vérifier les utilisateurs en base
        console.log('1️⃣ Vérification des utilisateurs en base...');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        console.log(`📊 ${allUsers.length} utilisateurs trouvés:`);
        allUsers.forEach(user => {
            console.log(`   • ${user.firstName} ${user.lastName} (${user.email}) - Rôle: ${user.role}`);
        });

        // 2. Tester les comptes de test
        console.log('\n2️⃣ Test des comptes de test hardcodés...');
        const testAccounts = [
            { email: 'sebcecg@gmail.com', password: 'Paul3726&', expectedRole: 'PARENT' },
            { email: 'restaurant@ecole-saint-mathieu.fr', password: 'Restaurant123!', expectedRole: 'RESTAURANT' }
        ];

        testAccounts.forEach(account => {
            console.log(`   ✓ Compte test: ${account.email} (${account.expectedRole})`);
        });

        // 3. Vérifier un utilisateur spécifique en base
        console.log('\n3️⃣ Test de connexion avec un utilisateur en base...');
        const firstUser = allUsers[0];
        if (firstUser) {
            console.log(`   Tentative avec: ${firstUser.email}`);

            const userWithPassword = await prisma.user.findUnique({
                where: { email: firstUser.email }
            });

            if (userWithPassword) {
                console.log(`   ✓ Utilisateur trouvé avec mot de passe hashé`);
                console.log(`   📝 Hash: ${userWithPassword.password.substring(0, 20)}...`);

                // Test avec un mot de passe générique
                const testPasswords = ['123456', 'password', 'test123', 'Paul3726&'];
                for (const testPass of testPasswords) {
                    try {
                        const isValid = await bcrypt.compare(testPass, userWithPassword.password);
                        if (isValid) {
                            console.log(`   🎯 TROUVÉ! Mot de passe: "${testPass}"`);
                            break;
                        }
                    } catch (err) {
                        // Ignore et continue
                    }
                }
            }
        }

        // 4. Créer un utilisateur de test si nécessaire
        console.log('\n4️⃣ Création d\'un utilisateur de test...');
        const testUserEmail = 'test-admin@ecole.fr';

        const existingTestUser = await prisma.user.findUnique({
            where: { email: testUserEmail }
        });

        if (existingTestUser) {
            console.log(`   ℹ️  Utilisateur test existe déjà: ${testUserEmail}`);
        } else {
            const hashedPassword = await bcrypt.hash('test123', 10);

            const newTestUser = await prisma.user.create({
                data: {
                    firstName: 'Test',
                    lastName: 'Admin',
                    email: testUserEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                    adress: '123 Test Street',
                    phone: '0123456789'
                }
            });

            console.log(`   ✅ Utilisateur de test créé: ${testUserEmail} / mot de passe: test123`);
        }

        // 5. Instructions pour les tests
        console.log('\n🧪 COMPTES DE TEST DISPONIBLES:');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│ COMPTES HARDCODÉS (sans base de données):                  │');
        console.log('│ • sebcecg@gmail.com / Paul3726& (PARENT)                   │');
        console.log('│ • restaurant@ecole-saint-mathieu.fr / Restaurant123! (RESTAURANT) │');
        console.log('├─────────────────────────────────────────────────────────────│');
        console.log('│ COMPTES EN BASE DE DONNÉES:                                │');
        console.log(`│ • ${testUserEmail} / test123 (ADMIN)               │`);

        if (allUsers.length > 0) {
            console.log('│ • Autres utilisateurs (voir liste ci-dessus)               │');
        }
        console.log('└─────────────────────────────────────────────────────────────┘');

        console.log('\n🔧 DIAGNOSTIC:');
        console.log('1. Le système de session est configuré dans app.js');
        console.log('2. Le middleware d\'auth vérifie req.session.user');
        console.log('3. Les templates reçoivent isAuthenticated et user via res.locals');
        console.log('4. Les redirections se font selon le rôle dans loginController.js');

        console.log('\n🎯 PROCHAINES ÉTAPES:');
        console.log('1. Teste avec un des comptes ci-dessus');
        console.log('2. Vérifie les cookies de session dans le navigateur (F12 > Application > Cookies)');
        console.log('3. Regarde les logs serveur pendant la connexion');
        console.log('4. Si ça ne marche toujours pas, vide le cache navigateur (Ctrl+Shift+Delete)');

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLoginComplet();

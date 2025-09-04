#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
    try {
        console.log('🔍 TEST DE CONNEXION À LA BASE DE DONNÉES\n');

        // Test 1: Connexion basique
        console.log('1️⃣ Test de connexion basique...');
        await prisma.$connect();
        console.log('✅ Connexion Prisma établie');

        // Test 2: Requête simple
        console.log('\n2️⃣ Test de requête simple...');
        const userCount = await prisma.user.count();
        console.log(`✅ Nombre d'utilisateurs: ${userCount}`);

        // Test 3: Lecture de quelques utilisateurs
        console.log('\n3️⃣ Test de lecture des utilisateurs...');
        const users = await prisma.user.findMany({
            take: 5,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });

        console.log('✅ Utilisateurs récupérés:');
        users.forEach(user => {
            console.log(`   • ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

        // Test 4: Vérification des tables
        console.log('\n4️⃣ Test des tables principales...');

        const counts = {
            users: await prisma.user.count(),
            students: await prisma.student.count(),
            documents: await prisma.document.count(),
            actualites: await prisma.actualite.count()
        };

        console.log('✅ Compteurs des tables:');
        Object.entries(counts).forEach(([table, count]) => {
            console.log(`   • ${table}: ${count} enregistrements`);
        });

        // Test 5: Informations de connexion
        console.log('\n5️⃣ Informations de connexion...');
        console.log(`   📋 DATABASE_URL: ${process.env.DATABASE_URL}`);
        console.log(`   🌐 Serveur: ${process.env.DATABASE_URL?.includes('localhost') ? 'Local' : 'Distant'}`);

        console.log('\n🎉 RÉSULTAT: Base de données connectée et fonctionnelle!');

    } catch (error) {
        console.error('\n❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES:');
        console.error('Type:', error.name);
        console.error('Message:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n🔧 DIAGNOSTIC:');
            console.error('• MySQL/MariaDB n\'est pas démarré');
            console.error('• Vérifiez que le serveur de base de données fonctionne');
            console.error('• Port 3306 peut être occupé par un autre service');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n🔧 DIAGNOSTIC:');
            console.error('• Adresse du serveur introuvable');
            console.error('• Vérifiez DATABASE_URL dans .env');
        } else if (error.message.includes('Access denied')) {
            console.error('\n🔧 DIAGNOSTIC:');
            console.error('• Identifiants incorrect (utilisateur/mot de passe)');
            console.error('• Vérifiez DATABASE_URL dans .env');
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
            console.error('\n🔧 DIAGNOSTIC:');
            console.error('• La base de données "ecole_st_mathieu" n\'existe pas');
            console.error('• Créez la base ou vérifiez le nom dans DATABASE_URL');
        }

        console.error('\n🛠️  SOLUTIONS:');
        console.error('1. Vérifiez que MySQL/MariaDB est démarré');
        console.error('2. Vérifiez DATABASE_URL dans .env');
        console.error('3. Testez la connexion manuellement: mysql -u root -p');
        console.error('4. Si nécessaire, créez la base: CREATE DATABASE ecole_st_mathieu;');
    } finally {
        await prisma.$disconnect();
    }
}

testDatabaseConnection();

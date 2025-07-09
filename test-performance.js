const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function performanceTest() {
    console.log('⚡ Test de performance des composants...\n');

    try {
        // Test 1: Base de données
        console.log('1️⃣ Test de la base de données...');
        const start1 = Date.now();
        await prisma.user.findFirst();
        const end1 = Date.now();
        console.log(`✅ Base de données: ${end1 - start1}ms`);

        // Test 2: Recherche utilisateur spécifique
        console.log('2️⃣ Test recherche utilisateur...');
        const start2 = Date.now();
        const user = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });
        const end2 = Date.now();
        console.log(`✅ Recherche utilisateur: ${end2 - start2}ms`);

        if (user) {
            // Test 3: bcrypt
            console.log('3️⃣ Test bcrypt...');
            const start3 = Date.now();
            const valid = await bcrypt.compare('AdminStMathieu2024!', user.password);
            const end3 = Date.now();
            console.log(`✅ bcrypt: ${end3 - start3}ms - Résultat: ${valid}`);
        }

        // Test 4: Requête complexe
        console.log('4️⃣ Test requête complexe...');
        const start4 = Date.now();
        const stats = await prisma.user.count();
        const end4 = Date.now();
        console.log(`✅ Requête complexe: ${end4 - start4}ms - ${stats} utilisateurs`);

        console.log('\n🎉 Tests terminés !');

    } catch (error) {
        console.error('❌ Erreur durant les tests:', error);
    } finally {
        await prisma.$disconnect();
    }
}

performanceTest();

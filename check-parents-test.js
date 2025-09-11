const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkParents() {
    try {
        console.log('🔍 Vérification des parents existants...');

        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true
            }
        });

        console.log(`\n📊 ${parents.length} parent(s) trouvé(s):\n`);

        parents.forEach(parent => {
            console.log(`👤 ${parent.firstName} ${parent.lastName}`);
            console.log(`   📧 ${parent.email}`);
            console.log(`   🆔 ID: ${parent.id}`);
            console.log(`   📅 Créé le: ${parent.createdAt.toLocaleDateString('fr-FR')}\n`);
        });

        if (parents.length === 0) {
            console.log('⚠️ Aucun parent trouvé. Création d\'un parent test...');

            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('TestParent123!', 12);

            const testParent = await prisma.user.create({
                data: {
                    firstName: 'Marie',
                    lastName: 'Dupont',
                    email: 'marie.dupont@test.com',
                    password: hashedPassword,
                    role: 'PARENT',
                    address: '123 Rue de la Paix, 13000 Marseille'
                }
            });

            console.log('✅ Parent test créé:');
            console.log(`👤 ${testParent.firstName} ${testParent.lastName}`);
            console.log(`📧 ${testParent.email}`);
            console.log(`🔑 Mot de passe: TestParent123!`);
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
        process.exit();
    }
}

checkParents();

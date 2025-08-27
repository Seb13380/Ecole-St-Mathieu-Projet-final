const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkParentChildren() {
    try {
        console.log('👨‍👩‍👧‍👦 DIAGNOSTIC PARENTS-ENFANTS');
        console.log('===============================\n');

        // Récupérer tous les parents
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' }
        });

        console.log(`👥 ${parents.length} compte(s) parent(s) trouvé(s):\n`);

        for (const parent of parents) {
            console.log(`📧 Parent: ${parent.firstName} ${parent.lastName} (${parent.email})`);

            // Chercher les enfants liés
            const children = await prisma.student.findMany({
                where: { parentId: parent.id },
                include: {
                    classe: true
                }
            });

            if (children.length > 0) {
                console.log(`   ✅ ${children.length} enfant(s):`);
                children.forEach((child, index) => {
                    console.log(`      ${index + 1}. ${child.firstName} ${child.lastName} (${child.classe?.nom || 'Pas de classe'})`);
                });
            } else {
                console.log('   ❌ Aucun enfant associé');

                // Chercher dans les demandes d'inscription pour ce parent
                const requests = await prisma.inscriptionRequest.findMany({
                    where: {
                        parentEmail: parent.email,
                        status: 'APPROVED'
                    }
                });

                if (requests.length > 0) {
                    console.log('   ⚠️  PROBLÈME: Demande approuvée trouvée mais enfants non créés!');
                    console.log(`      → ${requests.length} demande(s) approuvée(s)`);
                }
            }
            console.log('');
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkParentChildren();

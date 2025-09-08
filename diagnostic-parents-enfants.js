const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkParentChildren() {
    try {
        console.log('ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦ DIAGNOSTIC PARENTS-ENFANTS');
        console.log('===\n');

        // RÃ©cupÃ©rer tous les parents
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' }
        });

        console.log(`ðŸ‘¥ ${parents.length} compte(s) parent(s) trouvÃ©(s):\n`);

        for (const parent of parents) {
            console.log(`ðŸ“§ Parent: ${parent.firstName} ${parent.lastName} (${parent.email})`);

            // Chercher les enfants liÃ©s
            const children = await prisma.student.findMany({
                where: { parentId: parent.id },
                include: {
                    classe: true
                }
            });

            if (children.length > 0) {
                console.log(`   âœ… ${children.length} enfant(s):`);
                children.forEach((child, index) => {
                    console.log(`      ${index + 1}. ${child.firstName} ${child.lastName} (${child.classe?.nom || 'Pas de classe'})`);
                });
            } else {
                console.log('   âŒ Aucun enfant associÃ©');

                // Chercher dans les demandes d'inscription pour ce parent
                const requests = await prisma.inscriptionRequest.findMany({
                    where: {
                        parentEmail: parent.email,
                        status: 'APPROVED'
                    }
                });

                if (requests.length > 0) {
                    console.log('   âš ï¸  PROBLÃˆME: Demande approuvÃ©e trouvÃ©e mais enfants non crÃ©Ã©s!');
                    console.log(`      â†’ ${requests.length} demande(s) approuvÃ©e(s)`);
                }
            }
            console.log('');
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('âŒ Erreur:', error.message);
        process.exit(1);
    }
}

checkParentChildren();


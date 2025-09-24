const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanOrphanParents() {
    try {
        console.log('🧹 Nettoyage des parents orphelins...\n');

        // Trouver tous les parents sans enfants
        const allParents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            include: {
                enfants: {
                    include: {
                        student: true
                    }
                }
            }
        });

        const orphanParents = allParents.filter(parent => parent.enfants.length === 0);
        
        console.log(`🚨 Parents orphelins trouvés: ${orphanParents.length}`);

        if (orphanParents.length === 0) {
            console.log('✅ Aucun parent orphelin à nettoyer !');
            return;
        }

        // Demander confirmation (simulation pour cet exemple)
        console.log('⚠️  ATTENTION: Cette opération va supprimer tous les parents sans enfants !');
        console.log('📋 Parents qui seront supprimés:');
        
        orphanParents.slice(0, 10).forEach((parent, index) => {
            console.log(`${index + 1}. ${parent.firstName} ${parent.lastName} (${parent.email})`);
        });
        
        if (orphanParents.length > 10) {
            console.log(`... et ${orphanParents.length - 10} autres`);
        }

        // SUPPRESSION (décommentez la ligne suivante pour exécuter)
        // const deleted = await prisma.user.deleteMany({
        //     where: {
        //         role: 'PARENT',
        //         enfants: {
        //             none: {}
        //         }
        //     }
        // });

        console.log('\n💡 Pour exécuter la suppression:');
        console.log('   1. Décommentez les lignes de suppression dans le script');
        console.log('   2. Relancez le script');
        console.log('   3. Puis faites votre import Excel');

        // console.log(`✅ ${deleted.count} parents orphelins supprimés !`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanOrphanParents();
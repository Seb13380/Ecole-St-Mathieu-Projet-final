const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixClassesWithNaN() {
    try {
        console.log('🔧 Correction des classes avec enseignantId = NaN...');

        // Récupérer toutes les classes
        const classes = await prisma.classe.findMany();

        console.log(`📊 Total classes trouvées: ${classes.length}`);

        let classesFixed = 0;

        for (const classe of classes) {
            // Vérifier si enseignantId est NaN ou invalide
            if (isNaN(classe.enseignantId) || classe.enseignantId === null) {
                console.log(`🔧 Correction classe ${classe.nom} - enseignantId: ${classe.enseignantId} → null`);

                await prisma.classe.update({
                    where: { id: classe.id },
                    data: { enseignantId: null }
                });

                classesFixed++;
            } else {
                console.log(`✅ Classe ${classe.nom} - enseignantId OK: ${classe.enseignantId}`);
            }
        }

        console.log(`\n🎯 Résumé:`);
        console.log(`- Classes corrigées: ${classesFixed}`);
        console.log(`- Classes OK: ${classes.length - classesFixed}`);
        console.log('✅ Correction terminée !');

    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixClassesWithNaN();

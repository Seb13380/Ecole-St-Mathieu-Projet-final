const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🔧 SCRIPT DE CORRECTION DES RELATIONS PARENT-ENFANT MANQUANTES
 * 
 * Problème : Les élèves ont un parentId mais pas de relation dans ParentStudent
 * Solution : Créer les relations manquantes
 */

async function fixMissingRelations() {
    try {
        console.log('🔍 Recherche des élèves avec parentId mais sans relation ParentStudent...\n');

        // Récupérer tous les élèves qui ont un parentId
        const students = await prisma.student.findMany({
            where: {
                parentId: { not: null }
            },
            include: {
                parents: true // Relations ParentStudent existantes
            }
        });

        console.log(`📊 ${students.length} élève(s) trouvé(s) avec un parentId\n`);

        let fixed = 0;
        let alreadyOk = 0;
        let errors = 0;

        for (const student of students) {
            const parentId = student.parentId;
            
            // Vérifier si la relation existe déjà
            const existingRelation = student.parents.find(p => p.parentId === parentId);

            if (existingRelation) {
                console.log(`✅ Élève "${student.firstName} ${student.lastName}" (ID: ${student.id}) - Relation déjà OK avec parent #${parentId}`);
                alreadyOk++;
            } else {
                try {
                    // Créer la relation manquante
                    await prisma.parentStudent.create({
                        data: {
                            parentId: parentId,
                            studentId: student.id
                        }
                    });
                    
                    console.log(`🔧 CORRIGÉ: Élève "${student.firstName} ${student.lastName}" (ID: ${student.id}) - Relation créée avec parent #${parentId}`);
                    fixed++;
                } catch (error) {
                    console.error(`❌ Erreur pour l'élève ${student.id}:`, error.message);
                    errors++;
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📈 RÉSULTATS:');
        console.log('='.repeat(60));
        console.log(`✅ Relations déjà OK     : ${alreadyOk}`);
        console.log(`🔧 Relations créées     : ${fixed}`);
        console.log(`❌ Erreurs              : ${errors}`);
        console.log(`📊 Total élèves traités : ${students.length}`);
        console.log('='.repeat(60));

        if (fixed > 0) {
            console.log('\n✅ Les parents peuvent maintenant voir leurs enfants !');
        }

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
fixMissingRelations();

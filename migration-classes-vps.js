// Migration VPS - Correction des classes et relations parents-enfants
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrationClassesVPS() {
    console.log('🔄 MIGRATION VPS - CORRECTION CLASSES ET RELATIONS');
    console.log('='.repeat(60));

    try {
        // 1. AUDIT INITIAL - État actuel
        console.log('\n📊 AUDIT INITIAL:');

        const allClasses = await prisma.classe.findMany({
            include: {
                _count: { select: { students: true } }
            },
            orderBy: { nom: 'asc' }
        });

        console.log('\n📚 CLASSES ACTUELLES:');
        allClasses.forEach(classe => {
            console.log(`   - ${classe.nom} (ID: ${classe.id}) - ${classe._count.students} élèves`);
        });

        const allStudents = await prisma.student.findMany({
            include: {
                classe: { select: { nom: true } },
                parent: { select: { firstName: true, lastName: true } }
            }
        });

        console.log(`\n👨‍🎓 TOTAL ÉLÈVES: ${allStudents.length}`);

        const studentsWithoutParent = allStudents.filter(s => !s.parent);
        console.log(`👨‍👩‍👧‍👦 ÉLÈVES SANS PARENT: ${studentsWithoutParent.length}`);

        // 2. IDENTIFICATION DES CLASSES À CONSERVER ET SUPPRIMER
        const classesToKeep = ['1-PS', '2-MS', '3-GS', '4-CP', '5-CE1', '6-CE2', '7-CM1', '8-CM2'];
        const classesToKeepObjects = allClasses.filter(c => classesToKeep.includes(c.nom));
        const classesToDelete = allClasses.filter(c => !classesToKeep.includes(c.nom));

        console.log('\n✅ CLASSES À CONSERVER:');
        classesToKeepObjects.forEach(c => console.log(`   - ${c.nom} (ID: ${c.id})`));

        console.log('\n❌ CLASSES À SUPPRIMER:');
        classesToDelete.forEach(c => console.log(`   - ${c.nom} (ID: ${c.id}) - ${c._count.students} élèves`));

        // 3. MAPPING DES CLASSES (correspondances)
        const classMapping = {
            'Cours Préparatoire': '4-CP',
            'Maternelle Petite section': '1-PS',
            'Maternelle Moyenne section': '2-MS',
            'Maternelle Grande section': '3-GS',
            'CE1': '5-CE1',
            'CE2': '6-CE2',
            'CM1': '7-CM1',
            'CM2': '8-CM2'
        };

        console.log('\n🔄 CORRESPONDANCES CLASSES:');
        Object.entries(classMapping).forEach(([old, nouveau]) => {
            console.log(`   ${old} → ${nouveau}`);
        });

        // 4. PLAN DE MIGRATION
        console.log('\n📋 PLAN DE MIGRATION:');
        console.log('   1. Transférer les élèves vers les bonnes classes');
        console.log('   2. Supprimer les anciennes classes vides');
        console.log('   3. Corriger les relations parents-enfants manquantes');
        console.log('   4. Vérification finale');

        console.log('\n⚠️  ATTENTION: EXÉCUTION EN MODE LECTURE SEULE');
        console.log('   Pour exécuter la migration, modifiez le script.');

        // DÉCOMMENTEZ CES LIGNES POUR EXÉCUTER LA MIGRATION RÉELLE
        /*
        console.log('\n🚀 DÉBUT DE LA MIGRATION...');
        
        // Étape 1: Transférer les élèves
        for (const [oldClassName, newClassName] of Object.entries(classMapping)) {
            const oldClass = allClasses.find(c => c.nom === oldClassName);
            const newClass = allClasses.find(c => c.nom === newClassName);
            
            if (oldClass && newClass && oldClass._count.students > 0) {
                console.log(`🔄 Transfert ${oldClass._count.students} élèves: ${oldClassName} → ${newClassName}`);
                
                await prisma.student.updateMany({
                    where: { classeId: oldClass.id },
                    data: { classeId: newClass.id }
                });
            }
        }
        
        // Étape 2: Supprimer les anciennes classes vides
        for (const oldClass of classesToDelete) {
            const studentsCount = await prisma.student.count({
                where: { classeId: oldClass.id }
            });
            
            if (studentsCount === 0) {
                console.log(`🗑️  Suppression classe vide: ${oldClass.nom}`);
                await prisma.classe.delete({
                    where: { id: oldClass.id }
                });
            } else {
                console.log(`⚠️  Classe ${oldClass.nom} non supprimée: ${studentsCount} élèves restants`);
            }
        }
        
        console.log('\n✅ MIGRATION TERMINÉE');
        */

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter l'audit
migrationClassesVPS();
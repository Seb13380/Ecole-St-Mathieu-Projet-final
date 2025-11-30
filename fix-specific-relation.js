const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🔧 CORRECTION RELATION PARENT-ENFANT SPÉCIFIQUE
 * Pour corriger une relation manquante entre un parent et son enfant
 */

async function fixSpecificRelation() {
    try {
        console.log('🔍 Recherche de tous les parents et élèves récents...\n');

        // Lister les 5 derniers parents créés
        const recentParents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            orderBy: { id: 'desc' },
            take: 5,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
            }
        });

        console.log('📋 Les 5 derniers parents créés :');
        recentParents.forEach((p, i) => {
            console.log(`   ${i + 1}. #${p.id} - ${p.firstName} ${p.lastName} (${p.email})`);
        });

        // Lister les 5 derniers élèves créés
        const recentStudents = await prisma.student.findMany({
            orderBy: { id: 'desc' },
            take: 5,
            include: {
                parents: true,
                classe: true
            }
        });

        console.log('\n📋 Les 5 derniers élèves créés :');
        recentStudents.forEach((s, i) => {
            console.log(`   ${i + 1}. #${s.id} - ${s.firstName} ${s.lastName} (ParentId: ${s.parentId || 'Aucun'}) - Relations: ${s.parents.length}`);
            if (s.classe) {
                console.log(`       Classe: ${s.classe.nom}`);
            }
        });

        // Chercher les élèves avec parentId mais sans relation ParentStudent
        console.log('\n🔍 Recherche des élèves avec parentId mais sans relation ParentStudent...');
        
        const orphans = [];
        for (const student of recentStudents) {
            if (student.parentId) {
                const hasRelation = student.parents.some(p => p.parentId === student.parentId);
                if (!hasRelation) {
                    orphans.push(student);
                }
            }
        }

        if (orphans.length > 0) {
            console.log(`\n🚨 ${orphans.length} élève(s) trouvé(s) sans relation !\n`);
            
            for (const student of orphans) {
                console.log(`\n🔧 Correction pour : ${student.firstName} ${student.lastName} (ID: #${student.id})`);
                console.log(`   ParentId: ${student.parentId}`);
                
                // Récupérer le parent
                const parent = await prisma.user.findUnique({
                    where: { id: student.parentId },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                });

                if (parent) {
                    console.log(`   Parent: ${parent.firstName} ${parent.lastName} (${parent.email})`);
                    
                    // Créer la relation
                    await prisma.parentStudent.create({
                        data: {
                            parentId: student.parentId,
                            studentId: student.id
                        }
                    });
                    
                    console.log(`   ✅ Relation créée avec succès !`);
                } else {
                    console.log(`   ❌ Parent #${student.parentId} non trouvé !`);
                }
            }
        } else {
            console.log('   ✅ Tous les élèves récents ont leurs relations correctes');
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ TERMINÉ !');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter
fixSpecificRelation();

// Correction relations parents-enfants VPS
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigerRelationsParentsEnfants() {
    console.log('👨‍👩‍👧‍👦 CORRECTION RELATIONS PARENTS-ENFANTS');
    console.log('='.repeat(50));

    try {
        // 1. Identifier les élèves sans parent
        const studentsWithoutParent = await prisma.student.findMany({
            where: { parentId: null },
            include: { classe: { select: { nom: true } } }
        });

        console.log(`\n📊 ÉLÈVES SANS PARENT: ${studentsWithoutParent.length}`);

        if (studentsWithoutParent.length > 0) {
            console.log('\n📋 LISTE DES ÉLÈVES SANS PARENT:');
            studentsWithoutParent.forEach(student => {
                console.log(`   - ${student.firstName} ${student.lastName} (${student.classe?.nom || 'Sans classe'})`);
            });
        }

        // 2. Identifier les parents sans enfant
        const parentsWithoutChildren = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                students: { none: {} }
            }
        });

        console.log(`\n📊 PARENTS SANS ENFANT: ${parentsWithoutChildren.length}`);

        if (parentsWithoutChildren.length > 0) {
            console.log('\n📋 LISTE DES PARENTS SANS ENFANT:');
            parentsWithoutChildren.forEach(parent => {
                console.log(`   - ${parent.firstName} ${parent.lastName} (${parent.email})`);
            });
        }

        // 3. Suggestions de correspondances basées sur les noms
        console.log('\n🔍 RECHERCHE DE CORRESPONDANCES POSSIBLES:');

        for (const student of studentsWithoutParent) {
            const possibleParents = parentsWithoutChildren.filter(parent => {
                // Recherche par nom de famille similaire
                const studentLastName = student.lastName.toLowerCase();
                const parentLastName = parent.lastName.toLowerCase();

                // Correspondance exacte ou similaire
                return studentLastName === parentLastName ||
                    studentLastName.includes(parentLastName) ||
                    parentLastName.includes(studentLastName);
            });

            if (possibleParents.length > 0) {
                console.log(`\n   👨‍🎓 Élève: ${student.firstName} ${student.lastName}`);
                console.log('   👨‍👩‍👧‍👦 Parents possibles:');
                possibleParents.forEach(parent => {
                    console.log(`      - ${parent.firstName} ${parent.lastName} (${parent.email})`);
                });
            }
        }

        // 4. Proposer un script de liaison automatique
        console.log('\n🔧 SCRIPT DE LIAISON AUTOMATIQUE:');
        console.log('   Pour lier automatiquement par nom de famille identique:');
        console.log('   Décommentez la section ci-dessous dans le script');

        /* DÉCOMMENTEZ POUR EXÉCUTER LA LIAISON AUTOMATIQUE
        console.log('\n🚀 LIAISON AUTOMATIQUE EN COURS...');
        
        let liaisonsCreees = 0;
        
        for (const student of studentsWithoutParent) {
            const matchingParent = parentsWithoutChildren.find(parent => 
                parent.lastName.toLowerCase() === student.lastName.toLowerCase()
            );
            
            if (matchingParent) {
                console.log(`🔗 Liaison: ${student.firstName} ${student.lastName} ← ${matchingParent.firstName} ${matchingParent.lastName}`);
                
                await prisma.student.update({
                    where: { id: student.id },
                    data: { parentId: matchingParent.id }
                });
                
                liaisonsCreees++;
            }
        }
        
        console.log(`\n✅ ${liaisonsCreees} liaisons créées automatiquement`);
        */

        console.log('\n📝 INSTRUCTIONS MANUELLES:');
        console.log('   1. Examinez les correspondances proposées ci-dessus');
        console.log('   2. Modifiez le script pour activer la liaison automatique si approprié');
        console.log('   3. Ou créez les liaisons manuellement via l\'interface admin');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

corrigerRelationsParentsEnfants();
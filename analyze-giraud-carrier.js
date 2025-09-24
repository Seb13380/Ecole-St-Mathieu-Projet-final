const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeGiraudCarrier() {
    try {
        console.log('🔍 Analyse spécifique de la famille GIRAUD CARRIER...\n');

        // Chercher tous les parents avec "CARRIER" dans le nom
        const carrierParents = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                OR: [
                    { lastName: { contains: 'CARRIER' } },
                    { firstName: { contains: 'CARRIER' } }
                ]
            },
            include: {
                enfants: {
                    include: {
                        student: true
                    }
                }
            }
        });

        console.log(`📊 Parents avec "CARRIER": ${carrierParents.length}`);
        carrierParents.forEach(parent => {
            console.log(`- ${parent.firstName} ${parent.lastName} (${parent.email}) - ${parent.enfants.length} enfant(s)`);
            parent.enfants.forEach(relation => {
                console.log(`  └─ ${relation.student.firstName} ${relation.student.lastName}`);
            });
        });

        // Chercher l'enfant Elise GIRAUD CARRIER
        const eliseLike = await prisma.student.findMany({
            where: {
                OR: [
                    { firstName: { contains: 'Elise' } },
                    { lastName: { contains: 'GIRAUD' } },
                    { lastName: { contains: 'CARRIER' } }
                ]
            },
            include: {
                parents: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        console.log(`\n👶 Étudiants correspondant à Elise/GIRAUD/CARRIER: ${eliseLike.length}`);
        eliseLike.forEach(student => {
            console.log(`- ${student.firstName} ${student.lastName} (né le ${student.dateNaissance})`);
            console.log(`  Parents (${student.parents.length}):`);
            student.parents.forEach(relation => {
                console.log(`    └─ ${relation.parent.firstName} ${relation.parent.lastName} (${relation.parent.email})`);
            });
        });

        // Chercher les parents avec "Non renseigné"
        const nonRenseigneParents = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                lastName: 'Non renseigné'
            },
            take: 10
        });

        console.log(`\n🚨 Échantillon de parents "Non renseigné": ${nonRenseigneParents.length > 10 ? '10/' : ''}${nonRenseigneParents.length}`);
        nonRenseigneParents.forEach(parent => {
            console.log(`- ${parent.firstName} ${parent.lastName} (${parent.email})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeGiraudCarrier();
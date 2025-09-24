const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigerNomsParents() {
    try {
        console.log('🔄 CORRECTION DES NOMS DE PARENTS\n');

        // Trouver les parents avec des prénoms dupliqués comme nom de famille
        const parentsProblematiques = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                OR: [
                    { firstName: { equals: prisma.user.fields.lastName } },
                    // Ou des conditions spécifiques qu'on a vues
                    { firstName: 'Salah', lastName: 'Salah' },
                    { firstName: 'Hayet', lastName: 'Hayet' },
                    { firstName: 'Rémy', lastName: 'Rémy' },
                    { firstName: 'PRISCILLA', lastName: 'PRISCILLA' },
                    { firstName: 'Sébastien', lastName: 'Sébastien' },
                    { firstName: 'Catherine', lastName: 'Catherine' },
                ]
            }
        });

        // Version plus simple - on trouve tous les parents où firstName == lastName
        const allParents = await prisma.user.findMany({
            where: { role: 'PARENT' }
        });

        const problematic = allParents.filter(p => p.firstName === p.lastName);

        console.log(`Found ${problematic.length} parents with duplicated first/last names:`);
        
        problematic.forEach(p => {
            console.log(`  ID ${p.id}: ${p.firstName} ${p.lastName} (${p.email})`);
        });

        if (problematic.length === 0) {
            console.log('✅ No problematic data found!');
            return;
        }

        // Pour chaque parent problématique, on propose de corriger
        console.log('\n🔧 CORRECTIONS:');
        
        for (const parent of problematic) {
            // Stratégie: garder le firstName et mettre "Non renseigné" comme lastName
            console.log(`\nCorrecting: ${parent.firstName} ${parent.lastName} -> ${parent.firstName} Non renseigné`);
            
            await prisma.user.update({
                where: { id: parent.id },
                data: { 
                    lastName: 'Non renseigné' 
                }
            });
            
            console.log(`✅ Updated parent ID ${parent.id}: ${parent.firstName} Non renseigné`);
        }

        console.log(`\n✅ CORRECTION COMPLETED! Updated ${problematic.length} parents.`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

corrigerNomsParents();
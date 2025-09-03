const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActualites() {
    try {
        const actualites = await prisma.actualite.findMany({
            orderBy: { datePublication: 'desc' },
            take: 5
        });

        console.log('=== ACTUALITÉS RÉCENTES ===');
        actualites.forEach((act, i) => {
            console.log(`${i + 1}. ${act.titre}`);
            console.log(`   Contenu: ${act.contenu.substring(0, 100)}...`);
            console.log(`   Lien externe: ${act.lienExterne || 'Aucun'}`);
            console.log(`   Texte lien: ${act.lienTexte || 'Aucun'}`);
            console.log(`   Important: ${act.important}`);
            console.log('   ---');
        });
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkActualites();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClasses() {
    try {
        console.log('🔍 Vérification des classes disponibles...');
        
        const classes = await prisma.classe.findMany({
            orderBy: { id: 'asc' }
        });
        
        console.log('📚 Classes trouvées:');
        classes.forEach(classe => {
            console.log(`  - ID: ${classe.id}, Nom: ${classe.nom}, Niveau: ${classe.niveau}, Année: ${classe.anneeScolaire}`);
        });
        
        if (classes.length === 0) {
            console.log('❌ Aucune classe trouvée ! Il faut exécuter le seed.');
        } else {
            console.log(`✅ ${classes.length} classe(s) disponible(s)`);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkClasses();

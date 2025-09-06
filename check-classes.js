const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClasses() {
    try {
        const classes = await prisma.classe.findMany();
        console.log('Classes disponibles:');
        classes.forEach(c => console.log(`- ID ${c.id}: ${c.nom}`));
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkClasses();

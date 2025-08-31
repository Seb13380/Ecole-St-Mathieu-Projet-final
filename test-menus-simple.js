const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMenus() {
    try {
        const menus = await prisma.menu.findMany();
        console.log('✅ Nombre de menus dans la base:', menus.length);

        if (menus.length > 0) {
            console.log('📋 Premier menu:', {
                id: menus[0].id,
                semaine: menus[0].semaine,
                dateDebut: menus[0].dateDebut,
                dateFin: menus[0].dateFin,
                actif: menus[0].actif
            });
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Erreur:', error);
        await prisma.$disconnect();
    }
}

testMenus();

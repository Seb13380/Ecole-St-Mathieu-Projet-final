const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMenus() {
  try {
    const menus = await prisma.menu.findMany();
    console.log('📊 Nombre de menus en base:', menus.length);
    
    if (menus.length > 0) {
      console.log('📝 Premier menu:', {
        id: menus[0].id,
        semaine: menus[0].semaine,
        dateDebut: menus[0].dateDebut,
        dateFin: menus[0].dateFin,
        actif: menus[0].actif,
        statut: menus[0].statut
      });
    } else {
      console.log('❌ Aucun menu trouvé en base de données');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMenus();

// Test de la route /restauration/menus
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRestaurantMenus() {
    console.log('Test de la route /restauration/menus...\n');

    try {
        // Vérifier s'il y a des menus actifs dans la base
        const menusActifs = await prisma.menu.findMany({
            where: { actif: true },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Menus actifs trouvés: ${menusActifs.length}`);

        if (menusActifs.length > 0) {
            console.log('\nDétails des menus:');
            menusActifs.forEach((menu, index) => {
                console.log(`${index + 1}. ${menu.titre || menu.semaine}`);
                console.log(`   - Fichier: ${menu.fichierPdf}`);
                console.log(`   - Statut: ${menu.statut}`);
                console.log(`   - Actif: ${menu.actif}`);
                console.log(`   - Auteur: ${menu.auteur?.firstName} ${menu.auteur?.lastName}`);
                console.log('');
            });
        } else {
            console.log('Aucun menu actif trouvé.');
            console.log('La page affichera "Aucun menu disponible".');
        }

        // Vérifier tous les menus (pour debug)
        const tousLesMenus = await prisma.menu.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        console.log(`\nTotal de menus en base: ${tousLesMenus.length}`);

        if (tousLesMenus.length > 0) {
            console.log('\nTous les menus:');
            tousLesMenus.forEach((menu, index) => {
                console.log(`${index + 1}. ${menu.titre || menu.semaine} - Statut: ${menu.statut} - Actif: ${menu.actif}`);
            });
        }

        console.log('\nPour tester la route:');
        console.log('1. URL: http://localhost:3007/restauration/menus');
        console.log('2. Si page blanche, vérifier les logs du serveur');
        console.log('3. Essayer d\'abord d\'uploader un menu via /admin/menus-pdf');

    } catch (error) {
        console.error('Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testRestaurantMenus();

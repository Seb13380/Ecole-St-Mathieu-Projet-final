// Script de debug pour les menus
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugMenus() {
    console.log('🔍 Debug des menus...');
    
    try {
        // Test 1: Compter tous les menus
        const totalMenus = await prisma.menu.count();
        console.log(`📊 Total menus en base: ${totalMenus}`);
        
        // Test 2: Menus actifs
        const menusActifs = await prisma.menu.count({
            where: { actif: true }
        });
        console.log(`✅ Menus actifs: ${menusActifs}`);
        
        // Test 3: Récupérer quelques menus avec détails
        const menus = await prisma.menu.findMany({
            where: { actif: true },
            select: {
                id: true,
                semaine: true,
                dateDebut: true,
                dateFin: true,
                actif: true,
                statut: true,
                createdAt: true
            },
            orderBy: { dateDebut: 'desc' },
            take: 3
        });
        
        console.log('📋 Menus trouvés:');
        menus.forEach(menu => {
            console.log(`  - ID: ${menu.id} | ${menu.semaine} | Actif: ${menu.actif} | Statut: ${menu.statut}`);
            console.log(`    Dates: ${menu.dateDebut} → ${menu.dateFin}`);
        });
        
        // Test 4: Même requête que le controller
        const menusController = await prisma.menu.findMany({
            where: {
                actif: true
            },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { dateDebut: 'asc' },
            take: 10
        });
        
        console.log(`🎯 Requête controller trouve: ${menusController.length} menus`);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugMenus();
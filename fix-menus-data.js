const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fixMenusData() {
    console.log('🔧 Réparation des données de menus...\n');

    try {
        // 1. Supprimer TOUS les menus existants (reset complet)
        console.log('🗑️ Suppression de tous les menus existants...');
        const deletedMenus = await prisma.menu.deleteMany({});

        console.log(`   ✅ ${deletedMenus.count} menus supprimés`);

        // 2. Analyser les fichiers existants
        console.log('\n📁 Analyse des fichiers existants...');
        const menuDir = path.join(__dirname, 'public', 'assets', 'documents', 'menus');
        const files = fs.readdirSync(menuDir);

        // 3. Recréer les menus à partir des fichiers les plus récents
        console.log('\n🔄 Recréation des menus...');

        // Filtrer les fichiers récents (septembre 2025)
        const recentFiles = files.filter(file =>
            file.includes('2025-09') && file.endsWith('.pdf')
        ).sort().reverse(); // Les plus récents en premier

        console.log(`   Fichiers récents trouvés: ${recentFiles.length}`);

        // Créer des menus pour les fichiers récents
        const menuData = [
            {
                semaine: "Menu du 22 au 26 Septembre 2025",
                dateDebut: new Date('2025-09-22T12:00:00.000Z'),
                dateFin: new Date('2025-09-27T12:00:00.000Z'),
                file: recentFiles[0] // Le plus récent
            },
            {
                semaine: "Menu du 15 au 19 Septembre 2025",
                dateDebut: new Date('2025-09-15T12:00:00.000Z'),
                dateFin: new Date('2025-09-19T12:00:00.000Z'),
                file: recentFiles[1] || recentFiles[0]
            },
            {
                semaine: "Menu du 8 au 12 Septembre 2025",
                dateDebut: new Date('2025-09-08T12:00:00.000Z'),
                dateFin: new Date('2025-09-12T12:00:00.000Z'),
                file: recentFiles[2] || recentFiles[0]
            }
        ];

        for (const menu of menuData) {
            if (menu.file) {
                const pdfUrl = `/assets/documents/menus/${menu.file}`;

                const newMenu = await prisma.menu.create({
                    data: {
                        semaine: menu.semaine,
                        dateDebut: menu.dateDebut,
                        dateFin: menu.dateFin,
                        pdfUrl: pdfUrl,
                        pdfFilename: menu.file,
                        auteurId: 1, // ID admin par défaut
                        statut: "ACTIF",
                        actif: true
                    }
                });

                console.log(`   ✅ Menu créé: ${menu.semaine}`);
                console.log(`      Fichier: ${pdfUrl}`);
                console.log(`      ID: ${newMenu.id}`);
            }
        }

        // 4. Vérifier le résultat
        console.log('\n🔍 Vérification des nouveaux menus...');
        const newMenus = await prisma.menu.findMany({
            orderBy: { dateDebut: 'desc' }
        });

        console.log(`   Total menus en base: ${newMenus.length}`);

        newMenus.forEach(menu => {
            console.log(`   📄 ${menu.semaine} (ID: ${menu.id})`);
            console.log(`      Fichier: ${menu.pdfUrl}`);

            // Vérifier l'existence du fichier
            if (menu.pdfUrl) {
                const fullPath = path.join(__dirname, 'public', menu.pdfUrl);
                const exists = fs.existsSync(fullPath);
                console.log(`      Existe: ${exists ? '✅' : '❌'}`);
            } else {
                console.log(`      ❌ Pas de fichier défini`);
            }
        });

        return {
            deletedCorrupted: deletedMenus.count,
            createdNew: menuData.length,
            totalMenus: newMenus.length,
            success: true
        };

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    }
}

fixMenusData()
    .then(result => {
        console.log(`\n✅ Réparation terminée:`);
        console.log(`   - ${result.deletedCorrupted} menus corrompus supprimés`);
        console.log(`   - ${result.createdNew} nouveaux menus créés`);
        console.log(`   - ${result.totalMenus} menus total en base`);
        console.log('\n🎯 Les menus devraient maintenant s\'afficher correctement !');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Réparation échouée:', error);
        process.exit(1);
    });
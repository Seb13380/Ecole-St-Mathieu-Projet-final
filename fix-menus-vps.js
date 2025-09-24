const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixMenusVPS() {
    console.log('🔧 Correction des menus sur le VPS...');

    try {
        // 1. Vérifier les menus actuels
        const menus = await prisma.menu.findMany();
        console.log(`📊 ${menus.length} menus trouvés`);

        for (const menu of menus) {
            console.log(`📄 Menu ${menu.id}: ${menu.titre}`);
            console.log(`   pdfUrl: ${menu.pdfUrl}`);

            if (menu.pdfUrl) {
                // Vérifier si le fichier existe
                const fullPath = path.join('/var/www/project/ecole_st_mathieu/public', menu.pdfUrl);
                const exists = fs.existsSync(fullPath);
                console.log(`   Fichier existe: ${exists ? '✅' : '❌'} ${fullPath}`);

                if (!exists) {
                    // Chercher des fichiers similaires dans le dossier menus
                    const menusDir = path.join('/var/www/project/ecole_st_mathieu/public/assets/documents/menus');
                    if (fs.existsSync(menusDir)) {
                        const files = fs.readdirSync(menusDir);
                        console.log(`   📁 Fichiers disponibles: ${files.join(', ')}`);
                    }
                }
            }
        }

        // 2. Lister les fichiers PDF disponibles
        const menusDir = path.join('/var/www/project/ecole_st_mathieu/public/assets/documents/menus');
        console.log(`\n📁 Contenu du dossier menus:`);

        if (fs.existsSync(menusDir)) {
            const files = fs.readdirSync(menusDir);
            files.forEach(file => {
                const fullPath = path.join(menusDir, file);
                const stats = fs.statSync(fullPath);
                console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
            });

            // 3. Si on trouve des PDF, recréer les menus automatiquement
            const pdfFiles = files.filter(f => f.endsWith('.pdf'));
            if (pdfFiles.length > 0) {
                console.log(`\n🔄 Recréation automatique des ${pdfFiles.length} menus...`);

                // Supprimer les anciens menus
                await prisma.menu.deleteMany({});
                console.log('🗑️ Anciens menus supprimés');

                // Créer les nouveaux menus
                for (let i = 0; i < pdfFiles.length; i++) {
                    const file = pdfFiles[i];
                    const semaine = i + 1;

                    await prisma.menu.create({
                        data: {
                            titre: `Menu de la semaine ${semaine}`,
                            pdfUrl: `/assets/documents/menus/${file}`,
                            semaine: semaine
                        }
                    });

                    console.log(`✅ Menu créé: Semaine ${semaine} -> ${file}`);
                }

                console.log('🎉 Menus recréés avec succès !');
            }

        } else {
            console.log('❌ Dossier menus n\'existe pas !');
            // Créer le dossier
            fs.mkdirSync(menusDir, { recursive: true });
            console.log('✅ Dossier menus créé');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixMenusVPS();
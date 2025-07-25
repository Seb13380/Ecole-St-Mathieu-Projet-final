// Vérifier les fichiers PDF et les données des menus
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkMenuFiles() {
    console.log('Verification des fichiers PDF et donnees des menus...\n');

    try {
        // Vérifier le dossier des menus
        const menuDir = path.join(__dirname, 'public', 'assets', 'documents', 'menus');
        console.log(`Dossier des menus: ${menuDir}`);

        if (fs.existsSync(menuDir)) {
            const files = fs.readdirSync(menuDir);
            console.log(`Fichiers PDF disponibles: ${files.length}`);
            files.forEach(file => {
                console.log(`   - ${file}`);
            });
        } else {
            console.log('Dossier des menus n\'existe pas!');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Vérifier les données en base
        const menus = await prisma.menu.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        console.log(`Menus en base de donnees: ${menus.length}`);

        menus.forEach((menu, index) => {
            console.log(`\n${index + 1}. Menu ID: ${menu.id}`);
            console.log(`   Semaine: ${menu.semaine}`);
            console.log(`   pdfFilename: ${menu.pdfFilename || 'MANQUANT'}`);
            console.log(`   pdfUrl: ${menu.pdfUrl || 'MANQUANT'}`);
            console.log(`   Statut: ${menu.statut}`);
            console.log(`   Actif: ${menu.actif}`);
            console.log(`   Auteur: ${menu.auteur?.firstName} ${menu.auteur?.lastName}`);

            // Vérifier si le fichier existe
            if (menu.pdfFilename) {
                const filePath = path.join(menuDir, menu.pdfFilename);
                const exists = fs.existsSync(filePath);
                console.log(`   Fichier existe: ${exists ? 'OUI' : 'NON'}`);
            }
        });

        console.log('\nAction recommandee:');
        if (menus.some(m => !m.pdfFilename)) {
            console.log('- Certains menus n\'ont pas de fichier PDF associe');
            console.log('- Utilisez /admin/menus-pdf pour uploader de nouveaux menus');
        } else {
            console.log('- Tous les menus semblent avoir des fichiers PDF');
            console.log('- Testez la route: http://localhost:3007/restauration/menus');
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkMenuFiles();

// Diagnostic des menus cantine sur VPS
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function diagnosticMenusVPS() {
    console.log('🍽️ DIAGNOSTIC MENUS CANTINE VPS');
    console.log('=' .repeat(50));

    try {
        // 1. Vérifier la base de données
        console.log('\n📊 VÉRIFICATION BASE DE DONNÉES:');
        
        const allMenus = await prisma.menu.findMany({
            include: {
                auteur: { select: { firstName: true, lastName: true, email: true } }
            },
            orderBy: { dateDebut: 'desc' }
        });

        console.log(`📝 Total menus en base: ${allMenus.length}`);
        
        if (allMenus.length === 0) {
            console.log('⚠️  AUCUN MENU TROUVÉ EN BASE !');
            return;
        }

        // 2. Analyser les menus
        console.log('\n📋 ANALYSE DES MENUS:');
        allMenus.forEach((menu, index) => {
            console.log(`\n   ${index + 1}. ${menu.semaine}`);
            console.log(`      ID: ${menu.id}`);
            console.log(`      Dates: ${menu.dateDebut.toLocaleDateString()} → ${menu.dateFin.toLocaleDateString()}`);
            console.log(`      Actif: ${menu.actif ? '✅ OUI' : '❌ NON'}`);
            console.log(`      Statut: ${menu.statut}`);
            console.log(`      PDF: ${menu.pdfUrl}`);
            console.log(`      Auteur: ${menu.auteur?.firstName} ${menu.auteur?.lastName}`);
        });

        // 3. Vérifier les fichiers PDF
        console.log('\n📁 VÉRIFICATION FICHIERS PDF:');
        
        for (const menu of allMenus) {
            if (menu.pdfUrl) {
                const fullPath = path.join(process.cwd(), 'public', menu.pdfUrl);
                const exists = fs.existsSync(fullPath);
                
                console.log(`   ${menu.semaine}:`);
                console.log(`      URL: ${menu.pdfUrl}`);
                console.log(`      Path: ${fullPath}`);
                console.log(`      Existe: ${exists ? '✅ OUI' : '❌ NON'}`);
                
                if (exists) {
                    const stats = fs.statSync(fullPath);
                    console.log(`      Taille: ${Math.round(stats.size / 1024)} KB`);
                    console.log(`      Modifié: ${stats.mtime.toLocaleDateString()}`);
                }
            }
        }

        // 4. Vérifier les dossiers
        console.log('\n📂 VÉRIFICATION DOSSIERS:');
        
        const menuDir = path.join(process.cwd(), 'public/assets/documents/menus');
        const imageDir = path.join(process.cwd(), 'public/assets/images/menus');
        
        console.log(`   Dossier PDF: ${menuDir}`);
        console.log(`   Existe: ${fs.existsSync(menuDir) ? '✅ OUI' : '❌ NON'}`);
        
        if (fs.existsSync(menuDir)) {
            const files = fs.readdirSync(menuDir);
            console.log(`   Fichiers: ${files.length}`);
            files.forEach(file => console.log(`      - ${file}`));
        }
        
        console.log(`\n   Dossier Images: ${imageDir}`);
        console.log(`   Existe: ${fs.existsSync(imageDir) ? '✅ OUI' : '❌ NON'}`);

        // 5. Menus actifs
        console.log('\n🟢 MENUS ACTIFS:');
        const menusActifs = allMenus.filter(m => m.actif);
        
        if (menusActifs.length === 0) {
            console.log('   ⚠️  AUCUN MENU ACTIF !');
        } else {
            menusActifs.forEach(menu => {
                console.log(`   ✅ ${menu.semaine} (${menu.dateDebut.toLocaleDateString()} → ${menu.dateFin.toLocaleDateString()})`);
            });
        }

        // 6. Test de la route publique
        console.log('\n🌐 TEST ROUTE PUBLIQUE:');
        console.log('   Pour tester: curl -I http://votre-domaine/menus');
        console.log('   Ou visitez: http://votre-domaine/menus');

        // 7. Recommandations
        console.log('\n💡 RECOMMANDATIONS:');
        
        if (allMenus.length === 0) {
            console.log('   ❌ Créer au moins un menu via l\'interface admin');
        }
        
        if (menusActifs.length === 0) {
            console.log('   ❌ Activer au moins un menu');
        }
        
        const menusAvecFichierManquant = allMenus.filter(m => 
            m.pdfUrl && !fs.existsSync(path.join(process.cwd(), 'public', m.pdfUrl))
        );
        
        if (menusAvecFichierManquant.length > 0) {
            console.log('   ❌ Fichiers PDF manquants à re-uploader:');
            menusAvecFichierManquant.forEach(m => {
                console.log(`      - ${m.semaine}`);
            });
        }
        
        if (menusActifs.length > 0 && menusAvecFichierManquant.length === 0) {
            console.log('   ✅ Configuration semble correcte');
        }

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosticMenusVPS();
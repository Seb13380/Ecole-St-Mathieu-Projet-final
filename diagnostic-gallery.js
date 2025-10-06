// Diagnostic galerie - vérification des thèmes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnosticGallery() {
    console.log('🖼️ DIAGNOSTIC GALERIE');
    console.log('=' .repeat(40));

    try {
        // Récupérer tous les thèmes
        const themes = await prisma.galleryTheme.findMany({
            include: {
                medias: {
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: [
                { ordre: "asc" },
                { name: "asc" }
            ]
        });

        console.log(`📋 Total thèmes: ${themes.length}`);

        if (themes.length === 0) {
            console.log('⚠️  Aucun thème trouvé !');
            console.log('💡 Créez un thème via /gallery/admin');
            return;
        }

        themes.forEach((theme, index) => {
            console.log(`\n${index + 1}. Thème: "${theme.name}"`);
            console.log(`   ID: ${theme.id}`);
            console.log(`   Description: "${theme.description || 'Aucune'}"`);
            console.log(`   Ordre: ${theme.ordre || 'Non défini'}`);
            console.log(`   Médias: ${theme.medias.length}`);
            
            if (theme.medias.length > 0) {
                console.log('   📷 Médias:');
                theme.medias.forEach((media, idx) => {
                    console.log(`      ${idx + 1}. ${media.titre} (${media.type})`);
                    console.log(`         Fichier: ${media.filename}`);
                    console.log(`         Description: "${media.description || 'Aucune'}"`);
                });
            }
        });

        // Vérifier les fichiers physiques
        console.log('\n📁 VÉRIFICATION FICHIERS:');
        const fs = require('fs');
        const path = require('path');
        
        const uploadDir = path.join(process.cwd(), 'uploads/gallery');
        console.log(`   Dossier: ${uploadDir}`);
        
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            console.log(`   Fichiers physiques: ${files.length}`);
            
            // Vérifier si tous les médias ont leurs fichiers
            let fichiersManquants = 0;
            for (const theme of themes) {
                for (const media of theme.medias) {
                    const filePath = path.join(uploadDir, media.filename);
                    if (!fs.existsSync(filePath)) {
                        console.log(`   ❌ Fichier manquant: ${media.filename}`);
                        fichiersManquants++;
                    }
                }
            }
            
            if (fichiersManquants === 0) {
                console.log('   ✅ Tous les fichiers sont présents');
            }
        } else {
            console.log('   ❌ Dossier uploads/gallery n\'existe pas !');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosticGallery();
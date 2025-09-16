const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugActualitesPubliques() {
    console.log('🔍 DIAGNOSTIC DES ACTUALITÉS PUBLIQUES\n');

    try {
        // 1. Vérifier toutes les actualités
        const allActualites = await prisma.actualite.findMany({
            select: {
                id: true,
                titre: true,
                visible: true,
                public: true,
                datePublication: true
            },
            orderBy: { datePublication: 'desc' }
        });

        console.log('📊 TOUTES LES ACTUALITÉS :');
        console.table(allActualites.map(a => ({
            ID: a.id,
            Titre: a.titre.substring(0, 30) + '...',
            Visible: a.visible ? '✅' : '❌',
            Public: a.public ? '✅' : '❌',
            Date: a.datePublication.toLocaleDateString('fr-FR')
        })));

        // 2. Vérifier les actualités visibles et publiques
        const publicActualites = await prisma.actualite.findMany({
            where: {
                visible: true,
                public: true
            },
            select: {
                id: true,
                titre: true,
                visible: true,
                public: true
            }
        });

        console.log(`\n📋 ACTUALITÉS PUBLIQUES ET VISIBLES : ${publicActualites.length}`);
        if (publicActualites.length > 0) {
            console.table(publicActualites.map(a => ({
                ID: a.id,
                Titre: a.titre.substring(0, 30) + '...',
                Visible: a.visible,
                Public: a.public
            })));
        } else {
            console.log('❌ Aucune actualité publique et visible trouvée !');
        }

        // 3. Vérifier les types de données
        console.log('\n🔍 VÉRIFICATION DES TYPES :');
        if (allActualites.length > 0) {
            const sample = allActualites[0];
            console.log('Types des champs:', {
                visible: typeof sample.visible,
                public: typeof sample.public,
                visibleValue: sample.visible,
                publicValue: sample.public
            });
        }

        // 4. Corriger les actualités avec public = null
        console.log('\n🔧 CORRECTION DES ACTUALITÉS :');

        const actualitesACorreger = await prisma.actualite.findMany({
            where: {
                public: null
            }
        });

        if (actualitesACorreger.length > 0) {
            console.log(`⚠️ ${actualitesACorreger.length} actualité(s) avec public = null trouvée(s)`);

            // Les corriger en les rendant publiques par défaut
            const correctionResult = await prisma.actualite.updateMany({
                where: {
                    public: null
                },
                data: {
                    public: true
                }
            });

            console.log(`✅ ${correctionResult.count} actualité(s) corrigée(s) (rendues publiques)`);
        } else {
            console.log('✅ Toutes les actualités ont une valeur public définie');
        }

        // 5. Test final
        console.log('\n🧪 TEST FINAL APRÈS CORRECTIONS :');
        const finalPublicActualites = await prisma.actualite.findMany({
            where: {
                visible: true,
                public: true
            },
            select: {
                id: true,
                titre: true
            }
        });

        console.log(`📊 ${finalPublicActualites.length} actualité(s) publique(s) et visible(s) maintenant disponible(s)`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugActualitesPubliques();
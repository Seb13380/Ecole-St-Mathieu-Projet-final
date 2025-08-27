const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDocumentSystem() {
    try {
        console.log('🔍 Test du système de gestion des documents');

        // 1. Vérifier que le modèle Document existe et fonctionne
        console.log('\n1. Test de la base de données...');
        const documentCount = await prisma.document.count();
        console.log(`✅ Modèle Document fonctionnel - ${documentCount} documents trouvés`);

        // 2. Tester la création d'un document test
        console.log('\n2. Test de création d\'un document...');

        // Trouver Frank (GESTIONNAIRE_SITE)
        const frank = await prisma.user.findFirst({
            where: {
                role: 'GESTIONNAIRE_SITE'
            }
        });

        if (!frank) {
            console.log('❌ Utilisateur Frank (GESTIONNAIRE_SITE) non trouvé');
            return;
        }

        console.log(`✅ Frank trouvé: ${frank.firstName} ${frank.lastName} (ID: ${frank.id})`);

        // Créer un document test
        const testDocument = await prisma.document.create({
            data: {
                type: 'PROJET_EDUCATIF',
                titre: 'Projet Éducatif Test - École Saint-Mathieu',
                description: 'Document test pour vérifier le fonctionnement du système',
                contenu: '<h1>Projet Éducatif</h1><p>Ce document présente notre vision éducative.</p>',
                active: true,
                auteurId: frank.id
            }
        });

        console.log(`✅ Document test créé avec succès:`);
        console.log(`   - ID: ${testDocument.id}`);
        console.log(`   - Type: ${testDocument.type}`);
        console.log(`   - Titre: ${testDocument.titre}`);
        console.log(`   - Actif: ${testDocument.active}`);

        // 3. Test de récupération avec relations
        console.log('\n3. Test de récupération avec auteur...');
        const documentWithAuthor = await prisma.document.findUnique({
            where: { id: testDocument.id },
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            }
        });

        console.log(`✅ Document récupéré avec auteur:`);
        console.log(`   - Auteur: ${documentWithAuthor.auteur.firstName} ${documentWithAuthor.auteur.lastName}`);
        console.log(`   - Rôle: ${documentWithAuthor.auteur.role}`);

        // 4. Test de groupement par type
        console.log('\n4. Test de groupement par type...');
        const allDocuments = await prisma.document.findMany({
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: [
                { type: 'asc' },
                { updatedAt: 'desc' }
            ]
        });

        // Grouper par type
        const documentsByType = {};
        allDocuments.forEach(doc => {
            if (!documentsByType[doc.type]) {
                documentsByType[doc.type] = [];
            }
            documentsByType[doc.type].push(doc);
        });

        console.log(`✅ Documents groupés par type:`);
        Object.keys(documentsByType).forEach(type => {
            console.log(`   - ${type}: ${documentsByType[type].length} document(s)`);
        });

        // 5. Nettoyer le document test
        console.log('\n5. Nettoyage du document test...');
        await prisma.document.delete({
            where: { id: testDocument.id }
        });
        console.log(`✅ Document test supprimé`);

        console.log('\n🎉 Système de documents entièrement fonctionnel !');
        console.log('\n📋 Résumé des fonctionnalités testées:');
        console.log('   ✅ Modèle Document avec relations');
        console.log('   ✅ Création de documents');
        console.log('   ✅ Types de documents (enum)');
        console.log('   ✅ Relations avec utilisateurs');
        console.log('   ✅ Groupement par type');
        console.log('   ✅ Suppression de documents');

        console.log('\n🔗 Points d\'accès disponibles:');
        console.log('   📖 Affichage public: /documents/:type');
        console.log('   🔧 Gestion admin: /documents/admin');
        console.log('   📊 Dashboard Lionel: /directeur/dashboard');
        console.log('   📊 Dashboard Frank: /frank/dashboard');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
testDocumentSystem();

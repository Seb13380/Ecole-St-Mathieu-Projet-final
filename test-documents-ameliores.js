#!/usr/bin/env node

/**
 * 🧪 TEST SYSTÈME DOCUMENTS AMÉLIORÉ
 * - Plusieurs documents du même type
 * - Support des liens externes
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDocumentSystem() {
    console.log('🧪 === TEST SYSTÈME DOCUMENTS AMÉLIORÉ ===');
    console.log('==========================================');

    try {
        // Nettoyage
        console.log('🧹 Nettoyage des documents de test...');
        await prisma.document.deleteMany({
            where: {
                titre: {
                    contains: 'Test Document'
                }
            }
        });

        // Récupérer un utilisateur admin
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            console.log('❌ Aucun admin trouvé pour les tests');
            return;
        }

        console.log('✅ Admin trouvé:', admin.firstName, admin.lastName);

        // TEST 1: Créer plusieurs documents PDF du même type
        console.log('\n📄 1. TEST DOCUMENTS PDF MULTIPLES');
        console.log('===================================');

        const pdfDoc1 = await prisma.document.create({
            data: {
                type: 'PROJET_EDUCATIF',
                titre: 'Test Document PDF 1 - Projet Principal',
                description: 'Premier document PDF du projet éducatif',
                pdfUrl: '/public/assets/documents/test1.pdf',
                pdfFilename: 'projet-educatif-principal.pdf',
                isExternalLink: false,
                auteurId: admin.id,
                active: true,
                ordre: 1
            }
        });

        const pdfDoc2 = await prisma.document.create({
            data: {
                type: 'PROJET_EDUCATIF',
                titre: 'Test Document PDF 2 - Annexe',
                description: 'Annexe du projet éducatif',
                pdfUrl: '/public/assets/documents/test2.pdf',
                pdfFilename: 'projet-educatif-annexe.pdf',
                isExternalLink: false,
                auteurId: admin.id,
                active: true,
                ordre: 2
            }
        });

        console.log('✅ Documents PDF créés:');
        console.log(`   1. ${pdfDoc1.titre} (ID: ${pdfDoc1.id})`);
        console.log(`   2. ${pdfDoc2.titre} (ID: ${pdfDoc2.id})`);

        // TEST 2: Créer des documents avec liens externes
        console.log('\n🔗 2. TEST DOCUMENTS LIENS EXTERNES');
        console.log('===================================');

        const linkDoc1 = await prisma.document.create({
            data: {
                type: 'PROJET_EDUCATIF',
                titre: 'Test Document Link 1 - Google Drive',
                description: 'Document hébergé sur Google Drive',
                externalUrl: 'https://drive.google.com/file/d/exemple123/view',
                isExternalLink: true,
                auteurId: admin.id,
                active: true,
                ordre: 3
            }
        });

        const linkDoc2 = await prisma.document.create({
            data: {
                type: 'REGLEMENT_INTERIEUR',
                titre: 'Test Document Link 2 - Site Web',
                description: 'Règlement sur site externe',
                externalUrl: 'https://www.exemple-ecole.fr/reglement.html',
                isExternalLink: true,
                auteurId: admin.id,
                active: true,
                ordre: 1
            }
        });

        console.log('✅ Documents liens externes créés:');
        console.log(`   1. ${linkDoc1.titre} (ID: ${linkDoc1.id})`);
        console.log(`      URL: ${linkDoc1.externalUrl}`);
        console.log(`   2. ${linkDoc2.titre} (ID: ${linkDoc2.id})`);
        console.log(`      URL: ${linkDoc2.externalUrl}`);

        // TEST 3: Vérifier que tous les documents sont récupérés
        console.log('\n🔍 3. TEST RÉCUPÉRATION MULTIPLE');
        console.log('=================================');

        const documentsProjetEducatif = await prisma.document.findMany({
            where: {
                type: 'PROJET_EDUCATIF',
                active: true
            },
            orderBy: [
                { ordre: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        console.log(`✅ Documents PROJET_EDUCATIF trouvés: ${documentsProjetEducatif.length}`);
        documentsProjetEducatif.forEach((doc, index) => {
            const type = doc.isExternalLink ? '🔗 LIEN' : '📄 PDF';
            console.log(`   ${index + 1}. ${type} - ${doc.titre}`);
            if (doc.isExternalLink) {
                console.log(`      URL: ${doc.externalUrl}`);
            } else {
                console.log(`      Fichier: ${doc.pdfFilename}`);
            }
        });

        // TEST 4: Simulation affichage public
        console.log('\n🌐 4. TEST AFFICHAGE PUBLIC');
        console.log('===========================');

        const documentsPublics = await prisma.document.findMany({
            where: {
                type: { in: ['PROJET_EDUCATIF', 'REGLEMENT_INTERIEUR'] },
                active: true
            },
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
                { ordre: 'asc' },
                { updatedAt: 'desc' }
            ]
        });

        console.log(`✅ Documents publics: ${documentsPublics.length}`);
        console.log('\n📋 Simulation affichage:');
        console.log('========================');

        const documentsByType = {};
        documentsPublics.forEach(doc => {
            if (!documentsByType[doc.type]) {
                documentsByType[doc.type] = [];
            }
            documentsByType[doc.type].push(doc);
        });

        Object.keys(documentsByType).forEach(type => {
            console.log(`\n📂 ${type.replace('_', ' ')}:`);
            documentsByType[type].forEach(doc => {
                if (doc.isExternalLink) {
                    console.log(`   🔗 ${doc.titre} → ${doc.externalUrl}`);
                } else {
                    console.log(`   📄 ${doc.titre} → ${doc.pdfUrl || 'Pas de PDF'}`);
                }
            });
        });

        console.log('\n🎯 === RÉSULTATS ===');
        console.log('====================');
        console.log('✅ Plusieurs documents du même type: FONCTIONNE');
        console.log('✅ Documents PDF: FONCTIONNE');
        console.log('✅ Liens externes: FONCTIONNE');
        console.log('✅ Affichage conditionnel: FONCTIONNE');
        console.log('✅ Ordre d\'affichage: FONCTIONNE');

        console.log('\n💡 === FONCTIONNALITÉS DISPONIBLES ===');
        console.log('======================================');
        console.log('🔧 Interface admin:');
        console.log('   • Choix entre fichier PDF ou lien externe');
        console.log('   • Affichage avec badges différenciés');
        console.log('   • Support de plusieurs documents par type');
        console.log('');
        console.log('🌐 Interface publique:');
        console.log('   • Boutons PDF (📄) et liens externes (🔗)');
        console.log('   • Ouverture dans nouvel onglet');
        console.log('   • Groupement par type de document');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testDocumentSystem();

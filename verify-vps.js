const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyVPS() {
    try {
        console.log('🔍 VÉRIFICATION VPS - École Saint-Mathieu\n');
        
        console.log('📄 1. DOCUMENTS:');
        const documents = await prisma.document.findMany({
            orderBy: { type: 'asc' }
        });
        
        console.log('   - Total documents:', documents.length);
        console.log('   - Documents actifs:', documents.filter(d => d.active).length);
        console.log('');
        
        if (documents.length === 0) {
            console.log('   ❌ PROBLÈME: Aucun document trouvé !');
            console.log('   🔧 SOLUTION: Exécuter le script restore-documents-vps.sql');
        } else {
            console.log('   📋 Liste des documents:');
            documents.forEach(doc => {
                const status = doc.active ? '✅' : '❌';
                console.log('      ' + status + ' ' + doc.type + ': "' + doc.titre + '"');
                if (doc.pdfUrl) console.log('         📎 PDF: ' + doc.pdfUrl);
            });
        }
        
        console.log('\n🌐 2. TEST DE ROUTE:');
        console.log('   Testez maintenant: https://votre-domaine.com/documents/ecole');
        
        console.log('\n📁 3. FICHIERS PDF À VÉRIFIER:');
        const documentsWithPDF = documents.filter(d => d.pdfUrl);
        documentsWithPDF.forEach(doc => {
            console.log('   - ' + doc.pdfUrl);
        });
        
        console.log('\n✅ Vérifiez que ces fichiers existent sur le serveur !');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyVPS();
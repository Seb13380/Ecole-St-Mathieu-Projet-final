const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportDocuments() {
    try {
        console.log('📤 Export des documents pour transfert VPS...\n');

        // Récupérer tous les documents
        const documents = await prisma.document.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true, email: true }
                }
            },
            orderBy: { type: 'asc' }
        });

        console.log(`📄 ${documents.length} documents trouvés\n`);

        // Créer le script SQL d'insertion
        let sqlScript = `-- Script de restauration des documents pour VPS
-- Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

-- Supprimer les documents existants (optionnel)
-- DELETE FROM Document;

-- Insérer les documents
`;

        documents.forEach(doc => {
            // Échapper les chaînes pour SQL
            const titre = doc.titre.replace(/'/g, "''");
            const description = doc.description ? doc.description.replace(/'/g, "''") : '';
            const contenu = doc.contenu ? doc.contenu.replace(/'/g, "''") : '';
            const pdfUrl = doc.pdfUrl || '';
            const pdfFilename = doc.pdfFilename || '';

            sqlScript += `
INSERT INTO Document (type, titre, description, contenu, pdfUrl, pdfFilename, active, ordre, auteurId, createdAt, updatedAt) VALUES 
('${doc.type}', '${titre}', ${description ? `'${description}'` : 'NULL'}, ${contenu ? `'${contenu}'` : 'NULL'}, ${pdfUrl ? `'${pdfUrl}'` : 'NULL'}, ${pdfFilename ? `'${pdfFilename}'` : 'NULL'}, ${doc.active}, ${doc.ordre}, ${doc.auteurId}, '${doc.createdAt.toISOString()}', '${doc.updatedAt.toISOString()}');
`;
        });

        // Sauvegarder le script
        const scriptPath = path.join(__dirname, 'restore-documents-vps.sql');
        fs.writeFileSync(scriptPath, sqlScript);

        console.log(`✅ Script SQL créé: ${scriptPath}`);

        // Créer aussi un export JSON pour backup
        const jsonExport = {
            exportDate: new Date().toISOString(),
            documentsCount: documents.length,
            documents: documents.map(doc => ({
                ...doc,
                auteur: doc.auteur
            }))
        };

        const jsonPath = path.join(__dirname, 'documents-backup.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonExport, null, 2));

        console.log(`✅ Backup JSON créé: ${jsonPath}`);

        // Afficher un résumé
        console.log('\n📊 Résumé des documents à transférer:');
        const typeCounts = {};
        documents.forEach(doc => {
            typeCounts[doc.type] = (typeCounts[doc.type] || 0) + 1;
        });

        Object.entries(typeCounts).forEach(([type, count]) => {
            console.log(`   - ${type}: ${count} document(s)`);
        });

        console.log('\n🚀 Instructions pour le VPS:');
        console.log('1. Transférer les fichiers PDF du dossier /uploads/documents/ vers le VPS');
        console.log('2. Exécuter le script SQL sur la base de données VPS');
        console.log('3. Vérifier que les fichiers PDF sont accessibles');
        console.log('4. Tester la page /documents/ecole sur le VPS');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportDocuments();

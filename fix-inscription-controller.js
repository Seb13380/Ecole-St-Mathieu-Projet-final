const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'inscriptionController.js');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Remplacements
content = content.replace(/prisma\.inscriptionRequest/g, 'prisma.preInscriptionRequest');
content = content.replace(/reviewer/g, 'processor');
content = content.replace(/reviewedAt/g, 'processedAt');
content = content.replace(/reviewedBy/g, 'processedBy');
content = content.replace(/reviewComment/g, 'adminNotes');
content = content.replace(/submittedAt/g, 'submittedAt');
content = content.replace(/createdAt/g, 'submittedAt');
content = content.replace(/status: 'APPROVED'/g, "status: 'ACCEPTED'");

// Sauvegarder
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fichier inscriptionController.js corrigé avec succès !');

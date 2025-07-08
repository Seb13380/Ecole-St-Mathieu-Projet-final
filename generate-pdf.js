const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');

// Lire le fichier HTML
const htmlPath = path.join(__dirname, 'public', 'assets', 'documents', 'reglement-interieur-2025-2026.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Options pour le PDF
const options = {
    format: 'A4',
    margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
    },
    dpi: 300,
    quality: '75'
};

// Générer le PDF
const outputPath = path.join(__dirname, 'public', 'assets', 'documents', 'reglement-interieur-2025-2026.pdf');

pdf.create(html, options).toFile(outputPath, function (err, res) {
    if (err) {
        console.error('Erreur lors de la génération du PDF:', err);
        return;
    }
    console.log('PDF généré avec succès:', res.filename);
});

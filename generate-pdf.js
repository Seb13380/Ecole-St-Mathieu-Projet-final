const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');

// Lire le fichier HTML
const htmlPath = path.join(__dirname, 'public', 'assets', 'documents', 'reglement-interieur-2025-2026.html');

console.log('Lecture du fichier HTML depuis:', htmlPath);

if (!fs.existsSync(htmlPath)) {
    console.error('Le fichier HTML n\'existe pas:', htmlPath);
    process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

if (!html || html.trim().length === 0) {
    console.error('Le fichier HTML est vide ou non lisible');
    process.exit(1);
}

console.log('Fichier HTML lu avec succès, taille:', html.length, 'caractères');

// Options pour le PDF
const options = {
    format: 'A4',
    margin: {
        top: '15mm',
        right: '10mm',
        bottom: '15mm',
        left: '10mm'
    },
    dpi: 300,
    quality: '75',
    zoomFactor: 1
};

// Générer le PDF
const outputPath = path.join(__dirname, 'public', 'assets', 'documents', 'reglement-interieur-2025-2026.pdf');

console.log('Génération du PDF vers:', outputPath);

pdf.create(html, options).toFile(outputPath, function (err, res) {
    if (err) {
        console.error('Erreur lors de la génération du PDF:', err);
        return;
    }
    console.log('PDF généré avec succès:', res.filename);
});

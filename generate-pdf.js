const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

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

// Fonction pour générer le PDF avec Puppeteer
async function generatePDF() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Charger le contenu HTML
    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });
    
    // Générer le PDF
    const outputPath = path.join(__dirname, 'public', 'assets', 'documents', 'reglement-interieur-2025-2026.pdf');
    
    console.log('Génération du PDF vers:', outputPath);
    
    await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
            top: '15mm',
            right: '10mm',
            bottom: '15mm',
            left: '10mm'
        },
        printBackground: true
    });
    
    await browser.close();
    console.log('PDF généré avec succès:', outputPath);
}

// Exécuter la génération
generatePDF().catch(console.error);

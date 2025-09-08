#!/usr/bin/env node

/**
 * ðŸ”§ SCRIPT DE MISE Ã€ JOUR DOCUMENTS
 * Met Ã  jour l'affichage pour supporter les liens externes
 */

const fs = require('fs');
const path = require('path');

function updateDocumentDisplay() {
    console.log('ðŸ”§ === MISE Ã€ JOUR AFFICHAGE DOCUMENTS ===');
    console.log('======');

    const categoryFile = 'c:\\Documents\\RI7\\Ecole St Mathieu Projet final\\src\\views\\pages\\documents\\category.twig';

    try {
        // Lire le fichier
        let content = fs.readFileSync(categoryFile, 'utf8');
        console.log('ðŸ“„ Fichier category.twig lu');

        // Remplacer tous les patterns d'affichage PDF
        console.log('ðŸ”„ Remplacement des patterns d\'affichage...');

        // Pattern 1: Dans les cartes (btn-xs)
        const pattern1 = /{% if doc\.pdfUrl %}\s*<a href="{{ doc\.pdfUrl }}" target="_blank" class="btn btn-xs btn-secondary">\s*ðŸ“„\s*<\/a>\s*{% endif %}/g;
        const replacement1 = `{% if doc.isExternalLink and doc.externalUrl %}
													<a href="{{ doc.externalUrl }}" target="_blank" class="btn btn-xs btn-accent">
														ðŸ”—
													</a>
												{% elseif doc.pdfUrl %}
													<a href="{{ doc.pdfUrl }}" target="_blank" class="btn btn-xs btn-secondary">
														ðŸ“„
													</a>
												{% endif %}`;

        content = content.replace(pattern1, replacement1);

        // Pattern 2: Dans les sections principales (btn-sm)
        const pattern2 = /{% if document\.pdfUrl %}\s*<a href="{{ document\.pdfUrl }}" target="_blank" class="btn btn-secondary btn-sm">\s*ðŸ“„ PDF\s*<\/a>\s*{% endif %}/g;
        const replacement2 = `{% if document.isExternalLink and document.externalUrl %}
										<a href="{{ document.externalUrl }}" target="_blank" class="btn btn-accent btn-sm">
											ðŸ”— Lien externe
										</a>
									{% elseif document.pdfUrl %}
										<a href="{{ document.pdfUrl }}" target="_blank" class="btn btn-secondary btn-sm">
											ðŸ“„ PDF
										</a>
									{% endif %}`;

        content = content.replace(pattern2, replacement2);

        // Ã‰crire le fichier modifiÃ©
        fs.writeFileSync(categoryFile, content, 'utf8');
        console.log('âœ… Fichier category.twig mis Ã  jour');

        console.log('\nðŸŽ¯ === RÃ‰SUMÃ‰ DES MODIFICATIONS ===');
        console.log('======');
        console.log('âœ… Support des liens externes ajoutÃ©');
        console.log('âœ… Affichage conditionnel PDF vs Lien');
        console.log('âœ… Boutons avec icÃ´nes appropriÃ©es');
        console.log('âœ… Ouverture dans nouvel onglet');

    } catch (error) {
        console.error('âŒ Erreur:', error.message);
    }
}

updateDocumentDisplay();


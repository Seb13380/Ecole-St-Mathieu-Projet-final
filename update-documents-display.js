#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE MISE À JOUR DOCUMENTS
 * Met à jour l'affichage pour supporter les liens externes
 */

const fs = require('fs');
const path = require('path');

function updateDocumentDisplay() {
    console.log('🔧 === MISE À JOUR AFFICHAGE DOCUMENTS ===');
    console.log('=========================================');

    const categoryFile = 'c:\\Documents\\RI7\\Ecole St Mathieu Projet final\\src\\views\\pages\\documents\\category.twig';

    try {
        // Lire le fichier
        let content = fs.readFileSync(categoryFile, 'utf8');
        console.log('📄 Fichier category.twig lu');

        // Remplacer tous les patterns d'affichage PDF
        console.log('🔄 Remplacement des patterns d\'affichage...');

        // Pattern 1: Dans les cartes (btn-xs)
        const pattern1 = /{% if doc\.pdfUrl %}\s*<a href="{{ doc\.pdfUrl }}" target="_blank" class="btn btn-xs btn-secondary">\s*📄\s*<\/a>\s*{% endif %}/g;
        const replacement1 = `{% if doc.isExternalLink and doc.externalUrl %}
													<a href="{{ doc.externalUrl }}" target="_blank" class="btn btn-xs btn-accent">
														🔗
													</a>
												{% elseif doc.pdfUrl %}
													<a href="{{ doc.pdfUrl }}" target="_blank" class="btn btn-xs btn-secondary">
														📄
													</a>
												{% endif %}`;

        content = content.replace(pattern1, replacement1);

        // Pattern 2: Dans les sections principales (btn-sm)
        const pattern2 = /{% if document\.pdfUrl %}\s*<a href="{{ document\.pdfUrl }}" target="_blank" class="btn btn-secondary btn-sm">\s*📄 PDF\s*<\/a>\s*{% endif %}/g;
        const replacement2 = `{% if document.isExternalLink and document.externalUrl %}
										<a href="{{ document.externalUrl }}" target="_blank" class="btn btn-accent btn-sm">
											🔗 Lien externe
										</a>
									{% elseif document.pdfUrl %}
										<a href="{{ document.pdfUrl }}" target="_blank" class="btn btn-secondary btn-sm">
											📄 PDF
										</a>
									{% endif %}`;

        content = content.replace(pattern2, replacement2);

        // Écrire le fichier modifié
        fs.writeFileSync(categoryFile, content, 'utf8');
        console.log('✅ Fichier category.twig mis à jour');

        console.log('\n🎯 === RÉSUMÉ DES MODIFICATIONS ===');
        console.log('==================================');
        console.log('✅ Support des liens externes ajouté');
        console.log('✅ Affichage conditionnel PDF vs Lien');
        console.log('✅ Boutons avec icônes appropriées');
        console.log('✅ Ouverture dans nouvel onglet');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

updateDocumentDisplay();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRelations() {
    console.log('🔧 CORRECTION DES RELATIONS PARENTS-ENFANTS\n');
    console.log('='.repeat(80));

    try {
        // 1. Trouver les parents sans enfants et les élèves sans parents du même nom
        console.log('\n🔍 Recherche des correspondances par nom de famille...\n');

        const parentsSansEnfants = await prisma.user.findMany({
            where: { role: 'PARENT' },
            include: {
                parentsEleves: true
            }
        });

        const elevesSansParents = await prisma.eleve.findMany({
            include: {
                parentsEleves: true
            }
        });

        let correctionsEffectuees = 0;
        const suggestions = [];

        // Filtrer pour avoir uniquement ceux sans relations
        const parentsSansEnfantsFiltre = parentsSansEnfants.filter(p => p.parentsEleves.length === 0);
        const elevesSansParentsFiltre = elevesSansParents.filter(e => e.parentsEleves.length === 0);

        console.log(`📊 Trouvé ${parentsSansEnfantsFiltre.length} parents sans enfants`);
        console.log(`📊 Trouvé ${elevesSansParentsFiltre.length} élèves sans parents\n`);

        // Pour chaque parent sans enfant, chercher des élèves avec le même nom
        for (const parent of parentsSansEnfantsFiltre) {
            const nomParent = parent.lastName.toUpperCase().trim();

            const elevesCorrespondants = elevesSansParentsFiltre.filter(eleve =>
                eleve.nom.toUpperCase().trim() === nomParent
            );

            if (elevesCorrespondants.length > 0) {
                suggestions.push({
                    parent,
                    eleves: elevesCorrespondants
                });
            }
        }

        if (suggestions.length === 0) {
            console.log('ℹ️  Aucune correspondance automatique trouvée.');
            console.log('   Les relations doivent être créées manuellement via l\'interface.\n');
        } else {
            console.log('✅ SUGGESTIONS DE CORRECTIONS:\n');
            console.log('⚠️  MODE SUGGESTION UNIQUEMENT - Aucune modification effectuée\n');

            suggestions.forEach((suggestion, index) => {
                console.log(`${index + 1}. Parent: ${suggestion.parent.firstName} ${suggestion.parent.lastName} (ID: ${suggestion.parent.id})`);
                console.log(`   Email: ${suggestion.parent.email}`);
                console.log(`   Élèves potentiels à associer:`);
                suggestion.eleves.forEach(eleve => {
                    console.log(`   → ${eleve.prenom} ${eleve.nom} (ID: ${eleve.id}) - Classe: ${eleve.classeId || 'N/A'}`);
                });
                console.log('');
            });

            console.log('\n💡 COMMENT APPLIQUER CES CORRECTIONS:');
            console.log('   Option 1 (Recommandée): Via l\'interface web');
            console.log('   - Aller dans Gestion des Parents');
            console.log('   - Éditer chaque parent');
            console.log('   - Associer les enfants correspondants');
            console.log('');
            console.log('   Option 2: Script SQL direct (ATTENTION - À utiliser avec précaution)');
            console.log('   - Voir le fichier fix-relations-sql.txt généré');
        }

        // Générer un fichier SQL pour corrections manuelles
        let sqlCommands = '-- Commandes SQL pour corriger les relations\n';
        sqlCommands += '-- À EXÉCUTER MANUELLEMENT après vérification\n\n';

        suggestions.forEach((suggestion, index) => {
            sqlCommands += `-- Correction ${index + 1}: ${suggestion.parent.firstName} ${suggestion.parent.lastName}\n`;
            suggestion.eleves.forEach(eleve => {
                sqlCommands += `INSERT INTO "ParentEleve" ("parentId", "eleveId") VALUES (${suggestion.parent.id}, ${eleve.id});\n`;
            });
            sqlCommands += '\n';
        });

        const fs = require('fs');
        fs.writeFileSync('fix-relations-sql.txt', sqlCommands);
        console.log('\n📄 Fichier SQL généré: fix-relations-sql.txt');

        // 2. Vérifier les élèves qui ont un seul parent alors qu'il devrait y en avoir deux
        console.log('\n' + '='.repeat(80));
        console.log('\n🔍 Vérification des élèves avec un seul parent...\n');

        const elevesAvecUnParent = elevesSansParents.filter(e => e.parentsEleves.length === 1);

        if (elevesAvecUnParent.length > 0) {
            console.log(`⚠️  ${elevesAvecUnParent.length} élèves ont un seul parent associé:\n`);

            for (const eleve of elevesAvecUnParent) {
                const parent = await prisma.user.findUnique({
                    where: { id: eleve.parentsEleves[0].parentId }
                });

                console.log(`Élève: ${eleve.prenom} ${eleve.nom} (ID: ${eleve.id})`);
                console.log(`Parent actuel: ${parent.firstName} ${parent.lastName}`);

                // Chercher d'autres parents avec le même nom
                const autresParents = await prisma.user.findMany({
                    where: {
                        role: 'PARENT',
                        lastName: {
                            equals: eleve.nom,
                            mode: 'insensitive'
                        },
                        id: {
                            not: parent.id
                        }
                    }
                });

                if (autresParents.length > 0) {
                    console.log(`Autres parents potentiels:`);
                    autresParents.forEach(ap => {
                        console.log(`  → ${ap.firstName} ${ap.lastName} (ID: ${ap.id}) - ${ap.email}`);
                    });
                } else {
                    console.log(`  ℹ️  Aucun autre parent trouvé avec le nom ${eleve.nom}`);
                }
                console.log('');
            }
        } else {
            console.log('✅ Tous les élèves avec parents ont les deux parents associés');
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n📋 RÉSUMÉ:');
        console.log(`   ${suggestions.length} suggestions de corrections trouvées`);
        console.log(`   ${elevesAvecUnParent.length} élèves pourraient avoir un deuxième parent`);
        console.log('\n⚠️  IMPORTANT: Vérifiez manuellement avant d\'appliquer les corrections');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixRelations();

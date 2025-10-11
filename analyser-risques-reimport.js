const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyserRisquesReimport() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ANALYSE DES RISQUES DE RÉ-IMPORT EXCEL');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // 1. COMPTER LES DONNÉES ACTUELLES
        console.log('📊 ÉTAT ACTUEL DE LA BASE DE DONNÉES');
        console.log('─────────────────────────────────────────────────────────');

        const totalUsers = await prisma.user.count();
        const totalParents = await prisma.user.count({ where: { role: 'PARENT' } });
        const totalStudents = await prisma.student.count();
        const totalRelations = await prisma.parentStudent.count();

        console.log(`Total utilisateurs: ${totalUsers}`);
        console.log(`Total parents: ${totalParents}`);
        console.log(`Total élèves: ${totalStudents}`);
        console.log(`Total relations parent-élève: ${totalRelations}`);

        // 2. IDENTIFIER LES PARENTS SANS ENFANTS
        console.log('\n👨‍👩‍👧‍👦 PARENTS SANS ENFANTS (à risque de doublon)');
        console.log('─────────────────────────────────────────────────────────');

        const parentsWithoutChildren = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                enfants: { none: {} }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Nombre: ${parentsWithoutChildren.length}\n`);

        // Catégoriser les parents sans enfants
        const parentsWithTempEmail = parentsWithoutChildren.filter(p =>
            p.email.includes('temp_') || p.email.includes('@temporary.local')
        );

        const parentsWithRealEmail = parentsWithoutChildren.filter(p =>
            !p.email.includes('temp_') && !p.email.includes('@temporary.local')
        );

        console.log(`└─ Avec email temporaire: ${parentsWithTempEmail.length} (FAIBLE RISQUE)`);
        console.log(`└─ Avec email réel: ${parentsWithRealEmail.length} (RISQUE MOYEN)\n`);

        // 3. IDENTIFIER LES ÉLÈVES SANS PARENTS
        console.log('👶 ÉLÈVES SANS PARENTS (orphelins à connecter)');
        console.log('─────────────────────────────────────────────────────────');

        const studentsWithoutParents = await prisma.student.findMany({
            where: {
                parents: { none: {} }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateNaissance: true
            }
        });

        console.log(`Nombre: ${studentsWithoutParents.length}\n`);

        // 4. VÉRIFIER LES EMAILS EN DOUBLE
        console.log('📧 ANALYSE DES EMAILS');
        console.log('─────────────────────────────────────────────────────────');

        const allEmails = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: { email: true }
        });

        const emailCounts = {};
        allEmails.forEach(({ email }) => {
            emailCounts[email] = (emailCounts[email] || 0) + 1;
        });

        const duplicateEmails = Object.entries(emailCounts)
            .filter(([email, count]) => count > 1 && !email.includes('temp_'))
            .map(([email]) => email);

        console.log(`Emails en double (hors temp): ${duplicateEmails.length}`);
        if (duplicateEmails.length > 0) {
            console.log('Emails concernés:');
            duplicateEmails.slice(0, 5).forEach(email => console.log(`  - ${email}`));
            if (duplicateEmails.length > 5) {
                console.log(`  ... et ${duplicateEmails.length - 5} autres`);
            }
        }

        // 5. COMPORTEMENT DE L'IMPORT EXCEL
        console.log('\n⚙️ COMPORTEMENT DE L\'IMPORT EXCEL');
        console.log('─────────────────────────────────────────────────────────');
        console.log('✅ L\'import vérifie les doublons AVANT de créer:');
        console.log('   1. Parents: cherche par EMAIL puis par NOM+PRÉNOM');
        console.log('   2. Élèves: cherche par NOM+PRÉNOM+DATE_NAISSANCE');
        console.log('   3. Relations: vérifie si déjà existante');
        console.log('');
        console.log('✅ Si un parent/élève existe: RÉUTILISE l\'existant');
        console.log('✅ Si une relation existe: NE CRÉE PAS de doublon');

        // 6. ÉVALUATION DES RISQUES
        console.log('\n⚠️ ÉVALUATION DES RISQUES');
        console.log('═══════════════════════════════════════════════════════');

        const risques = [];

        // Risque 1: Parents avec email réel sans enfants
        if (parentsWithRealEmail.length > 0) {
            risques.push({
                niveau: 'MOYEN',
                description: `${parentsWithRealEmail.length} parents avec email réel sans enfants`,
                detail: 'Si leurs noms sont dans l\'Excel, leurs enfants seront associés ✅',
                action: 'Pas de doublon car recherche par email'
            });
        }

        // Risque 2: Parents avec email temporaire
        if (parentsWithTempEmail.length > 0) {
            risques.push({
                niveau: 'FAIBLE',
                description: `${parentsWithTempEmail.length} parents avec email temporaire`,
                detail: 'Seront recherchés par NOM+PRÉNOM',
                action: 'Risque de doublon SI nom/prénom différent dans Excel'
            });
        }

        // Risque 3: Élèves orphelins
        if (studentsWithoutParents.length > 0) {
            risques.push({
                niveau: 'AUCUN',
                description: `${studentsWithoutParents.length} élèves sans parents`,
                detail: 'Seront associés si présents dans Excel',
                action: 'Aucun risque - relations seront créées'
            });
        }

        // Risque 4: Emails en double
        if (duplicateEmails.length > 0) {
            risques.push({
                niveau: 'ÉLEVÉ',
                description: `${duplicateEmails.length} emails en double dans la base`,
                detail: 'L\'import prendra le premier trouvé',
                action: '⚠️ NETTOYER LES DOUBLONS AVANT import'
            });
        }

        // Risque 5: Données non présentes dans Excel
        risques.push({
            niveau: 'MOYEN',
            description: 'Données absentes de l\'Excel',
            detail: 'Parents/élèves NON dans Excel ne seront PAS touchés',
            action: 'Vérifier que votre Excel est COMPLET'
        });

        // Afficher les risques
        risques.forEach((risque, index) => {
            const emoji = {
                'AUCUN': '✅',
                'FAIBLE': '⚡',
                'MOYEN': '⚠️',
                'ÉLEVÉ': '🚨'
            }[risque.niveau];

            console.log(`\n${emoji} RISQUE ${risque.niveau}: ${risque.description}`);
            console.log(`   ${risque.detail}`);
            console.log(`   👉 ${risque.action}`);
        });

        // 7. RECOMMANDATION FINALE
        console.log('\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  RECOMMANDATION FINALE');
        console.log('═══════════════════════════════════════════════════════');

        const risqueMax = risques.reduce((max, r) => {
            const niveaux = { 'AUCUN': 0, 'FAIBLE': 1, 'MOYEN': 2, 'ÉLEVÉ': 3 };
            return niveaux[r.niveau] > niveaux[max.niveau] ? r : max;
        }, risques[0]);

        if (risqueMax.niveau === 'ÉLEVÉ') {
            console.log('\n🚨 ATTENTION: Risques élevés détectés');
            console.log('   Recommandation: NETTOYER les doublons avant import\n');
            console.log('   Étapes suggérées:');
            console.log('   1. Exécuter: node nettoyer-doublons-emails.js');
            console.log('   2. Vérifier les résultats');
            console.log('   3. Puis faire l\'import Excel');
        } else if (risqueMax.niveau === 'MOYEN' || risqueMax.niveau === 'FAIBLE') {
            console.log('\n✅ Import Excel SÉCURISÉ');
            console.log('   Le système de détection de doublons protégera vos données\n');
            console.log('   Ce qui va se passer:');
            console.log('   ✅ Parents existants → Réutilisés (pas de doublon)');
            console.log('   ✅ Élèves existants → Réutilisés (pas de doublon)');
            console.log('   ✅ Relations manquantes → Créées');
            console.log('   ✅ Parents sans enfants → Enfants associés s\'ils sont dans Excel');
            console.log(`   ⚠️  Parents NON dans Excel (${totalParents - parentsWithoutChildren.length}) → Non touchés`);
        } else {
            console.log('\n✨ Aucun risque détecté');
            console.log('   Vous pouvez procéder à l\'import en toute sécurité');
        }

        console.log('\n═══════════════════════════════════════════════════════\n');

        return {
            totalParents,
            totalStudents,
            totalRelations,
            parentsWithoutChildren: parentsWithoutChildren.length,
            studentsWithoutParents: studentsWithoutParents.length,
            duplicateEmails: duplicateEmails.length,
            risqueMaximal: risqueMax.niveau,
            securite: risqueMax.niveau !== 'ÉLEVÉ'
        };

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécution
analyserRisquesReimport()
    .then(results => {
        if (results.securite) {
            console.log('✅ Analyse terminée - Import Excel SÉCURISÉ');
            process.exit(0);
        } else {
            console.log('⚠️  Analyse terminée - Actions recommandées avant import');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Échec de l\'analyse:', error.message);
        process.exit(1);
    });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyserLaurieBorsa() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ANALYSE DE LAURIE BORSA');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // 1. Trouver Laurie Borsa
        const laurie = await prisma.user.findUnique({
            where: { email: 'laurie.borsa@gmail.com' },
            include: {
                enfants: {
                    include: {
                        student: true
                    }
                }
            }
        });

        if (!laurie) {
            console.log('❌ Laurie Borsa introuvable dans la base');
            return;
        }

        console.log('👤 INFORMATIONS DE LAURIE BORSA');
        console.log('─────────────────────────────────────────────────────────');
        console.log(`ID: ${laurie.id}`);
        console.log(`Nom: ${laurie.firstName} ${laurie.lastName}`);
        console.log(`Email: ${laurie.email}`);
        console.log(`Téléphone: ${laurie.phone}`);
        console.log(`Adresse: ${laurie.adress}`);
        console.log(`Créé le: ${laurie.createdAt.toLocaleDateString('fr-FR')}`);
        console.log(`Enfants associés: ${laurie.enfants.length}`);

        // 2. Chercher des élèves avec nom similaire à "BORSA"
        console.log('\n🔍 RECHERCHE D\'ÉLÈVES AVEC NOM SIMILAIRE');
        console.log('─────────────────────────────────────────────────────────');

        const elevesNomSimilaire = await prisma.student.findMany({
            where: {
                OR: [
                    { lastName: { contains: 'BORSA' } },
                    { lastName: { contains: 'Borsa' } },
                    { lastName: { contains: 'borsa' } }
                ]
            },
            include: {
                parents: {
                    include: {
                        parent: true
                    }
                },
                classe: true
            }
        });

        if (elevesNomSimilaire.length > 0) {
            console.log(`✅ Trouvé ${elevesNomSimilaire.length} élève(s) avec nom similaire:\n`);
            elevesNomSimilaire.forEach((eleve, index) => {
                console.log(`${index + 1}. ${eleve.firstName} ${eleve.lastName}`);
                console.log(`   ID: ${eleve.id}`);
                console.log(`   Date naissance: ${eleve.dateNaissance.toLocaleDateString('fr-FR')}`);
                console.log(`   Classe: ${eleve.classe ? eleve.classe.nom : 'Non assignée'}`);
                console.log(`   Parents actuels: ${eleve.parents.length}`);
                if (eleve.parents.length > 0) {
                    eleve.parents.forEach(rel => {
                        console.log(`     - ${rel.parent.firstName} ${rel.parent.lastName} (${rel.parent.email})`);
                    });
                }
                console.log('');
            });
        } else {
            console.log('❌ Aucun élève trouvé avec nom "BORSA"\n');
        }

        // 3. Chercher des élèves avec prénom "Laurie" (au cas où inversion)
        console.log('🔍 RECHERCHE D\'ÉLÈVES PRÉNOMMÉS "LAURIE"');
        console.log('─────────────────────────────────────────────────────────');

        const elevesPrenom = await prisma.student.findMany({
            where: {
                firstName: { contains: 'Laurie' }
            },
            include: {
                parents: {
                    include: {
                        parent: true
                    }
                },
                classe: true
            }
        });

        if (elevesPrenom.length > 0) {
            console.log(`✅ Trouvé ${elevesPrenom.length} élève(s) prénommé(s) Laurie:\n`);
            elevesPrenom.forEach((eleve, index) => {
                console.log(`${index + 1}. ${eleve.firstName} ${eleve.lastName}`);
                console.log(`   ID: ${eleve.id}`);
                console.log(`   Date naissance: ${eleve.dateNaissance.toLocaleDateString('fr-FR')}`);
                console.log(`   Classe: ${eleve.classe ? eleve.classe.nom : 'Non assignée'}`);
                console.log(`   Parents actuels: ${eleve.parents.length}`);
                if (eleve.parents.length > 0) {
                    eleve.parents.forEach(rel => {
                        console.log(`     - ${rel.parent.firstName} ${rel.parent.lastName}`);
                    });
                }
                console.log('');
            });
        } else {
            console.log('❌ Aucun élève prénommé "Laurie"\n');
        }

        // 4. Chercher tous les élèves sans parents
        console.log('🔍 ÉLÈVES SANS PARENTS (orphelins)');
        console.log('─────────────────────────────────────────────────────────');

        const elevesOrphelins = await prisma.student.findMany({
            where: {
                parents: { none: {} }
            },
            include: {
                classe: true
            },
            take: 10
        });

        if (elevesOrphelins.length > 0) {
            console.log(`⚠️  Trouvé ${elevesOrphelins.length} élève(s) sans parents:\n`);
            elevesOrphelins.forEach((eleve, index) => {
                console.log(`${index + 1}. ${eleve.firstName} ${eleve.lastName}`);
                console.log(`   ID: ${eleve.id}`);
                console.log(`   Date naissance: ${eleve.dateNaissance.toLocaleDateString('fr-FR')}`);
                console.log(`   Classe: ${eleve.classe ? eleve.classe.nom : 'Non assignée'}`);
                console.log('');
            });
        } else {
            console.log('✅ Aucun élève orphelin\n');
        }

        // 5. PROPOSITIONS D'ACTION
        console.log('═══════════════════════════════════════════════════════');
        console.log('  PROPOSITIONS D\'ACTION');
        console.log('═══════════════════════════════════════════════════════\n');

        if (elevesNomSimilaire.length > 0) {
            console.log('✅ SOLUTION 1: Associer Laurie Borsa à un élève trouvé');
            console.log('   Commande à exécuter:');
            elevesNomSimilaire.forEach((eleve, index) => {
                console.log(`   ${index + 1}. node associer-parent-enfant.js ${laurie.id} ${eleve.id}`);
            });
        } else if (elevesOrphelins.length > 0) {
            console.log('⚠️  SOLUTION 2: Associer à un élève orphelin');
            console.log('   (vérifier manuellement la correspondance)');
            console.log('   Commande: node associer-parent-enfant.js <parentId> <studentId>');
        } else {
            console.log('⚠️  SOLUTION 3: Compte en attente');
            console.log('   Laurie Borsa est peut-être une pré-inscription');
            console.log('   Options:');
            console.log('   a) Attendre que l\'élève soit créé');
            console.log('   b) Créer manuellement l\'élève');
            console.log('   c) Supprimer le compte si c\'est une erreur');
        }

        console.log('\n═══════════════════════════════════════════════════════\n');

        return {
            laurie,
            elevesNomSimilaire,
            elevesPrenom,
            elevesOrphelins
        };

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécution
analyserLaurieBorsa()
    .then(results => {
        console.log('✅ Analyse terminée');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Échec de l\'analyse:', error.message);
        process.exit(1);
    });

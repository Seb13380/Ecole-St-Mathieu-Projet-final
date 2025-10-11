const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticRelations() {
    console.log('🔍 DIAGNOSTIC DES RELATIONS PARENTS-ENFANTS SUR VPS\n');
    console.log('='.repeat(80));

    try {
        // 1. Statistiques globales
        console.log('\n📊 STATISTIQUES GLOBALES:');
        const totalParents = await prisma.user.count({
            where: { role: 'PARENT' }
        });
        const totalEleves = await prisma.eleve.count();
        const totalRelations = await prisma.parentEleve.count();

        console.log(`   👨‍👩‍👧‍👦 Total Parents: ${totalParents}`);
        console.log(`   👶 Total Élèves: ${totalEleves}`);
        console.log(`   🔗 Total Relations ParentEleve: ${totalRelations}`);

        // 2. Parents sans enfants
        console.log('\n⚠️  PARENTS SANS ENFANTS:');
        const parentsSansEnfants = await prisma.user.findMany({
            where: {
                role: 'PARENT'
            },
            include: {
                parentsEleves: {
                    include: {
                        eleve: true
                    }
                }
            }
        });

        const parentsSansEnfantsFiltre = parentsSansEnfants.filter(
            parent => parent.parentsEleves.length === 0
        );

        console.log(`   ❌ Nombre: ${parentsSansEnfantsFiltre.length}`);
        if (parentsSansEnfantsFiltre.length > 0) {
            console.log('\n   Liste des parents sans enfants:');
            parentsSansEnfantsFiltre.forEach(parent => {
                console.log(`   - ID: ${parent.id} | ${parent.firstName} ${parent.lastName} | ${parent.email}`);
            });
        }

        // 3. Élèves sans parents
        console.log('\n⚠️  ÉLÈVES SANS PARENTS:');
        const elevesSansParents = await prisma.eleve.findMany({
            include: {
                parentsEleves: {
                    include: {
                        parent: true
                    }
                }
            }
        });

        const elevesSansParentsFiltre = elevesSansParents.filter(
            eleve => eleve.parentsEleves.length === 0
        );

        console.log(`   ❌ Nombre: ${elevesSansParentsFiltre.length}`);
        if (elevesSansParentsFiltre.length > 0) {
            console.log('\n   Liste des élèves sans parents:');
            elevesSansParentsFiltre.forEach(eleve => {
                console.log(`   - ID: ${eleve.id} | ${eleve.nom} ${eleve.prenom} | Classe: ${eleve.classeId || 'N/A'}`);
            });
        }

        // 4. Élèves avec un seul parent
        console.log('\n⚠️  ÉLÈVES AVEC UN SEUL PARENT:');
        const elevesAvecUnSeulParent = elevesSansParents.filter(
            eleve => eleve.parentsEleves.length === 1
        );

        console.log(`   ⚠️  Nombre: ${elevesAvecUnSeulParent.length}`);
        if (elevesAvecUnSeulParent.length > 0) {
            console.log('\n   Liste des élèves avec un seul parent:');
            elevesAvecUnSeulParent.forEach(eleve => {
                const parent = eleve.parentsEleves[0].parent;
                console.log(`   - Élève: ${eleve.nom} ${eleve.prenom} | Parent: ${parent.firstName} ${parent.lastName}`);
            });
        }

        // 5. Vérification des doublons dans les noms
        console.log('\n🔍 RECHERCHE DE PARENTS POTENTIELLEMENT LIÉS:');
        const tousLesParents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            include: {
                parentsEleves: {
                    include: {
                        eleve: true
                    }
                }
            }
        });

        // Grouper par nom de famille
        const parentsParNom = {};
        tousLesParents.forEach(parent => {
            const nom = parent.lastName.toUpperCase();
            if (!parentsParNom[nom]) {
                parentsParNom[nom] = [];
            }
            parentsParNom[nom].push(parent);
        });

        console.log('\n   Familles avec plusieurs comptes parents:');
        let famillesMultiples = 0;
        for (const [nom, parents] of Object.entries(parentsParNom)) {
            if (parents.length > 1) {
                famillesMultiples++;
                console.log(`\n   📋 Famille ${nom} (${parents.length} comptes):`);
                parents.forEach(parent => {
                    const nbEnfants = parent.parentsEleves.length;
                    console.log(`      - ${parent.firstName} ${parent.lastName} (ID: ${parent.id})`);
                    console.log(`        Email: ${parent.email}`);
                    console.log(`        Enfants: ${nbEnfants}`);
                    if (nbEnfants > 0) {
                        parent.parentsEleves.forEach(pe => {
                            console.log(`          • ${pe.eleve.prenom} ${pe.eleve.nom}`);
                        });
                    } else {
                        console.log(`        ⚠️  AUCUN ENFANT ASSOCIÉ`);
                    }
                });
            }
        }

        if (famillesMultiples === 0) {
            console.log('   ✅ Aucune famille avec plusieurs comptes détectée');
        }

        // 6. Résumé et recommandations
        console.log('\n' + '='.repeat(80));
        console.log('📋 RÉSUMÉ ET RECOMMANDATIONS:\n');

        if (parentsSansEnfantsFiltre.length > 0) {
            console.log(`⚠️  ${parentsSansEnfantsFiltre.length} parent(s) n'ont aucun enfant associé`);
            console.log('   → Ces parents ne recevront PAS les emails des actualités');
            console.log('   → Action recommandée: Associer ces parents à leurs enfants');
        }

        if (elevesSansParentsFiltre.length > 0) {
            console.log(`\n⚠️  ${elevesSansParentsFiltre.length} élève(s) n'ont aucun parent associé`);
            console.log('   → Les parents de ces élèves ne recevront PAS les emails');
            console.log('   → Action recommandée: Associer des parents à ces élèves');
        }

        if (elevesAvecUnSeulParent.length > 0) {
            console.log(`\n⚠️  ${elevesAvecUnSeulParent.length} élève(s) n'ont qu'un seul parent associé`);
            console.log('   → Vérifier si le deuxième parent existe dans la base');
            console.log('   → Action recommandée: Associer le deuxième parent si nécessaire');
        }

        if (famillesMultiples > 0) {
            console.log(`\n⚠️  ${famillesMultiples} famille(s) ont plusieurs comptes parents`);
            console.log('   → Vérifier si certains comptes sont des doublons');
            console.log('   → Action recommandée: Fusionner les doublons ou associer les enfants manquants');
        }

        console.log('\n✅ Pour les actualités:');
        const parentsAvecEnfants = totalParents - parentsSansEnfantsFiltre.length;
        console.log(`   ${parentsAvecEnfants} parents sur ${totalParents} recevront les emails`);
        console.log(`   ${parentsSansEnfantsFiltre.length} parents NE recevront PAS les emails (pas d'enfants)`);

        console.log('\n' + '='.repeat(80));

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécution
diagnosticRelations();

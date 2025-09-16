const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseRequestedClass() {
    console.log('🔍 Diagnostic des classes demandées dans les pré-inscriptions...\n');

    try {
        // 1. Récupérer toutes les pré-inscriptions en attente
        const pendingRequests = await prisma.preInscriptionRequest.findMany({
            where: {
                status: 'PENDING'
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        console.log(`📊 ${pendingRequests.length} pré-inscriptions en attente trouvées\n`);

        // 2. Analyser chaque pré-inscription
        for (const request of pendingRequests) {
            console.log(`\n📋 Pré-inscription ID: ${request.id}`);
            console.log(`   Parent: ${request.parentFirstName} ${request.parentLastName}`);
            console.log(`   Email: ${request.parentEmail}`);
            console.log(`   Date: ${request.submittedAt.toLocaleDateString('fr-FR')}`);

            // Analyser les données children
            if (request.children) {
                try {
                    const childrenData = JSON.parse(request.children);
                    console.log(`   👶 ${Object.keys(childrenData).length} enfant(s):`);

                    Object.keys(childrenData).forEach((key, index) => {
                        const child = childrenData[key];
                        console.log(`      ${index + 1}. ${child.firstName || 'N/A'} ${child.lastName || 'N/A'}`);
                        console.log(`         requestedClass: "${child.requestedClass || 'NON DÉFINIE'}"`);
                        console.log(`         currentClass: "${child.currentClass || 'N/A'}"`);
                        console.log(`         schoolLevel: "${child.schoolLevel || 'N/A'}"`);

                        if (!child.requestedClass) {
                            console.log(`         ⚠️ PROBLÈME: requestedClass manquante!`);
                        }
                    });
                } catch (error) {
                    console.log(`   ❌ Erreur parsing children: ${error.message}`);
                }
            } else {
                console.log(`   ❌ Aucune donnée children trouvée`);
            }
        }

        // 3. Statistiques globales
        console.log(`\n📈 STATISTIQUES:`);
        let totalChildren = 0;
        let childrenWithClass = 0;
        let childrenWithoutClass = 0;

        for (const request of pendingRequests) {
            if (request.children) {
                try {
                    const childrenData = JSON.parse(request.children);
                    Object.keys(childrenData).forEach(key => {
                        const child = childrenData[key];
                        totalChildren++;
                        if (child.requestedClass) {
                            childrenWithClass++;
                        } else {
                            childrenWithoutClass++;
                        }
                    });
                } catch (error) {
                    // Ignorer les erreurs de parsing
                }
            }
        }

        console.log(`   👶 Total enfants: ${totalChildren}`);
        console.log(`   ✅ Avec requestedClass: ${childrenWithClass} (${((childrenWithClass / totalChildren) * 100).toFixed(1)}%)`);
        console.log(`   ❌ Sans requestedClass: ${childrenWithoutClass} (${((childrenWithoutClass / totalChildren) * 100).toFixed(1)}%)`);

        // 4. Lister les classes disponibles
        console.log(`\n📚 CLASSES DISPONIBLES:`);
        const classes = await prisma.classe.findMany({
            orderBy: { nom: 'asc' }
        });

        classes.forEach(classe => {
            console.log(`   - ${classe.nom} (ID: ${classe.id})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le diagnostic
diagnoseRequestedClass();
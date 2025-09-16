const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseClassConstraint() {
    console.log('🔍 DIAGNOSTIC CONTRAINTE CLASSID\n');

    try {
        // 1. Vérifier le schéma de la table Student
        console.log('📊 Vérification du schéma de la table Student...');
        const studentSchema = await prisma.$queryRaw`
            SELECT 
                column_name, 
                is_nullable, 
                column_default,
                data_type
            FROM information_schema.columns 
            WHERE table_name = 'Student' 
            AND column_name IN ('classeId', 'classId')
        `;

        console.log('📋 Schéma des colonnes classe :');
        console.table(studentSchema);

        // 2. Vérifier s'il y a des classes
        const classCount = await prisma.classe.count();
        console.log(`\n📚 Nombre de classes dans la base : ${classCount}`);

        if (classCount === 0) {
            console.log('⚠️  ATTENTION : Aucune classe dans la base !');
            console.log('💡 Il faut créer des classes avant de pouvoir créer des étudiants');
        } else {
            // Lister les classes disponibles
            const classes = await prisma.classe.findMany({
                select: {
                    id: true,
                    nom: true,
                    niveau: true,
                    anneeScolaire: true
                },
                orderBy: { id: 'asc' }
            });

            console.log('\n📋 Classes disponibles :');
            console.table(classes);
        }

        // 3. Vérifier les contraintes de clé étrangère
        console.log('\n🔒 Vérification des contraintes de clé étrangère...');
        const constraints = await prisma.$queryRaw`
            SELECT 
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                kcu.referenced_table_name,
                kcu.referenced_column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'Student' 
            AND kcu.column_name IN ('classeId', 'classId')
        `;

        console.log('🔗 Contraintes sur la colonne classe :');
        console.table(constraints);

        // 4. Vérifier une demande récente pour voir les données
        console.log('\n📋 Vérification d\'une demande récente...');
        const recentRequest = await prisma.preInscriptionRequest.findFirst({
            where: { status: 'PENDING' },
            orderBy: { submittedAt: 'desc' }
        });

        if (recentRequest) {
            console.log(`✅ Demande trouvée (ID: ${recentRequest.id})`);
            if (recentRequest.children) {
                try {
                    const children = JSON.parse(recentRequest.children);
                    console.log('👶 Enfants dans la demande :');
                    children.forEach((child, index) => {
                        console.log(`   ${index + 1}. ${child.firstName} ${child.lastName} - Classe demandée: ${child.requestedClass}`);
                    });
                } catch (e) {
                    console.log('❌ Erreur parsing enfants:', e.message);
                }
            }
        } else {
            console.log('ℹ️  Aucune demande en attente trouvée');
        }

        // 5. Test de création d'étudiant (simulation)
        console.log('\n🧪 SIMULATION de création d\'étudiant...');
        try {
            // Trouver une classe existante
            const firstClass = await prisma.classe.findFirst();

            if (!firstClass) {
                console.log('❌ Impossible de faire le test : aucune classe disponible');
                console.log('💡 Créez au moins une classe avec: node create-basic-classes.js');
            } else {
                console.log(`✅ Utilisation de la classe : ${firstClass.nom} (ID: ${firstClass.id})`);

                // Simulation sans création réelle
                console.log('📝 Les données qui seraient utilisées :');
                console.log(`   - firstName: "Test"`);
                console.log(`   - lastName: "Student"`);
                console.log(`   - dateNaissance: new Date('2015-01-01')`);
                console.log(`   - classeId: ${firstClass.id}`);
                console.log(`   - parentId: [ID d'un parent existant]`);

                // Vérifier si un parent existe
                const parentCount = await prisma.user.count({
                    where: { role: 'PARENT' }
                });
                console.log(`📊 Nombre de parents dans la base : ${parentCount}`);

                if (parentCount === 0) {
                    console.log('⚠️  ATTENTION : Aucun parent dans la base !');
                    console.log('💡 Il faut créer des comptes parents avant de pouvoir créer des étudiants');
                }
            }

        } catch (error) {
            console.log('❌ Erreur lors de la simulation :', error.message);
        }

        // 6. Résumé et recommandations
        console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC :');
        console.log('='.repeat(50));

        if (classCount === 0) {
            console.log('🚨 PROBLÈME MAJEUR : Aucune classe dans la base de données');
            console.log('💡 SOLUTION : Exécuter "node create-basic-classes.js"');
        } else {
            console.log('✅ Classes disponibles dans la base');
        }

        const parentCount = await prisma.user.count({ where: { role: 'PARENT' } });
        if (parentCount === 0) {
            console.log('⚠️  ATTENTION : Aucun parent dans la base');
        } else {
            console.log(`✅ ${parentCount} parent(s) disponible(s)`);
        }

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic :', error);

        // Analyser le type d'erreur
        if (error.message.includes('does not exist')) {
            console.log('💡 La table semble ne pas exister. Vérifiez les migrations Prisma.');
        } else if (error.message.includes('foreign key constraint')) {
            console.log('💡 Problème de contrainte de clé étrangère détecté.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le diagnostic
if (require.main === module) {
    diagnoseClassConstraint().catch(console.error);
}

module.exports = { diagnoseClassConstraint };
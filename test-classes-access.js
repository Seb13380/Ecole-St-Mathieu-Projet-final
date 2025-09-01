const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testClassesAccess() {
    try {
        console.log('🔍 Test d\'accès aux classes...\n');

        // 1. Vérifier que les classes existent dans la base
        console.log('📋 Vérification des classes en base...');
        const classesInDB = await prisma.classe.findMany({
            include: {
                eleves: true,
                _count: {
                    select: {
                        eleves: true
                    }
                }
            },
            orderBy: { nom: 'asc' }
        });

        console.log(`✅ ${classesInDB.length} classes trouvées:`);
        classesInDB.forEach(classe => {
            console.log(`   - ${classe.nom} (${classe.niveau}) - ${classe._count.eleves} élèves`);
        });

        // 2. Vérifier que Lionel existe et peut se connecter
        console.log('\n👤 Vérification du compte Lionel...');
        const lionel = await prisma.user.findUnique({
            where: { email: 'l.camboulives@stmathieu.org' }
        });

        if (lionel) {
            console.log(`✅ Lionel trouvé: ${lionel.firstName} ${lionel.lastName} (${lionel.role})`);

            // Vérifier son mot de passe
            const passwordMatch = await bcrypt.compare('Lionel123!', lionel.password);
            console.log(`🔑 Mot de passe valide: ${passwordMatch ? '✅ Oui' : '❌ Non'}`);

            if (passwordMatch) {
                // 3. Simuler le contrôleur directement
                console.log('\n🎯 Simulation du contrôleur getClassesManagement...');

                // Simuler une session utilisateur
                const mockSession = {
                    user: {
                        id: lionel.id,
                        firstName: lionel.firstName,
                        lastName: lionel.lastName,
                        email: lionel.email,
                        role: lionel.role
                    }
                };

                // Vérifier les permissions
                const hasAccess = ['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'].includes(mockSession.user.role);
                console.log(`🔐 Permissions d'accès: ${hasAccess ? '✅ Autorisé' : '❌ Refusé'}`);

                if (hasAccess) {
                    console.log('📊 Données qui seraient passées au template:');
                    console.log(`   - Nombre de classes: ${classesInDB.length}`);
                    console.log(`   - Titre: "Gestion des classes"`);
                    console.log(`   - Utilisateur: ${mockSession.user.firstName} ${mockSession.user.lastName}`);

                    // Simuler le rendu du template
                    if (classesInDB.length > 0) {
                        console.log('\n🎨 Le template devrait afficher:');
                        console.log('   ✅ Les statistiques en haut');
                        console.log('   ✅ La liste des classes');
                        console.log('   ✅ Les boutons d\'action');
                    } else {
                        console.log('\n🎨 Le template devrait afficher:');
                        console.log('   ⚠️  Message "Aucune classe créée"');
                        console.log('   ⚠️  Bouton "Créer ma première classe"');
                    }
                }
            }
        } else {
            console.log('❌ Lionel non trouvé en base de données');
        }

        // 4. Test de la route spécifique
        console.log('\n🌐 Pour tester la route complète:');
        console.log('1. Démarrez le serveur: npm start');
        console.log('2. Ouvrez: http://localhost:3007/auth/login');
        console.log('3. Connectez-vous avec: l.camboulives@stmathieu.org / Lionel123!');
        console.log('4. Accédez à: http://localhost:3007/directeur/classes');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testClassesAccess();

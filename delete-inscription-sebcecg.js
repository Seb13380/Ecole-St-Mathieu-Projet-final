const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findAndDeleteInscription() {
    try {
        console.log('🔍 RECHERCHE ET SUPPRESSION INSCRIPTION');
        console.log('======================================\n');

        const targetEmail = 'sebcecg@gmail.com';
        console.log('📧 Email recherché:', targetEmail);

        // 1. Chercher dans les demandes d'inscription
        console.log('\n1️⃣ Recherche dans les demandes d\'inscription...');
        const inscriptionRequest = await prisma.inscriptionRequest.findUnique({
            where: { parentEmail: targetEmail }
        });

        if (inscriptionRequest) {
            console.log('✅ Demande d\'inscription trouvée:');
            console.log('   ID:', inscriptionRequest.id);
            console.log('   Parent:', inscriptionRequest.parentFirstName, inscriptionRequest.parentLastName);
            console.log('   Statut:', inscriptionRequest.status);
            console.log('   Créée le:', inscriptionRequest.createdAt);

            // Afficher les enfants
            let children = [];
            try {
                if (typeof inscriptionRequest.children === 'string') {
                    children = JSON.parse(inscriptionRequest.children);
                } else {
                    children = inscriptionRequest.children || [];
                }
                console.log('   Enfants:', children.map(c => `${c.firstName} ${c.lastName}`).join(', '));
            } catch (e) {
                console.log('   Enfants: Erreur parsing');
            }

            console.log('\n🗑️ Suppression de la demande d\'inscription...');
            await prisma.inscriptionRequest.delete({
                where: { id: inscriptionRequest.id }
            });
            console.log('✅ Demande d\'inscription supprimée');
        } else {
            console.log('❌ Aucune demande d\'inscription trouvée');
        }

        // 2. Chercher dans les utilisateurs
        console.log('\n2️⃣ Recherche dans les comptes utilisateur...');
        const user = await prisma.user.findUnique({
            where: { email: targetEmail }
        });

        if (user) {
            console.log('✅ Compte utilisateur trouvé:');
            console.log('   ID:', user.id);
            console.log('   Nom:', user.firstName, user.lastName);
            console.log('   Rôle:', user.role);
            console.log('   Créé le:', user.createdAt);

            // Chercher les étudiants liés à ce parent
            const students = await prisma.student.findMany({
                where: { parentId: user.id },
                include: {
                    classe: true
                }
            });

            if (students && students.length > 0) {
                console.log('   Enfants liés:');
                students.forEach((student, index) => {
                    console.log(`     ${index + 1}. ${student.firstName} ${student.lastName} (Classe: ${student.classe?.nom || 'Non assigné'})`);
                });

                console.log('\n🗑️ Suppression des étudiants liés...');
                for (const student of students) {
                    await prisma.student.delete({
                        where: { id: student.id }
                    });
                    console.log(`   ✅ Étudiant supprimé: ${student.firstName} ${student.lastName}`);
                }
            }

            console.log('\n🗑️ Suppression du compte utilisateur...');
            await prisma.user.delete({
                where: { id: user.id }
            });
            console.log('✅ Compte utilisateur supprimé');
        } else {
            console.log('❌ Aucun compte utilisateur trouvé');
        }

        console.log('\n✅ NETTOYAGE TERMINÉ !');
        console.log('Vous pouvez maintenant refaire une inscription avec sebcecg@gmail.com');

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error(error);
        process.exit(1);
    }
}

findAndDeleteInscription();

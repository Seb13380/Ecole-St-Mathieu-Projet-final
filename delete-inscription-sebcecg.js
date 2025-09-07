﻿const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findAndDeleteInscription() {
    try {
        console.log('ðŸ” RECHERCHE ET SUPPRESSION INSCRIPTION');
        console.log('===\n');

        const targetEmail = 'sebcecg@gmail.com';
        console.log('ðŸ“§ Email recherchÃ©:', targetEmail);

        // 1. Chercher dans les demandes d'inscription
        console.log('\n1ï¸âƒ£ Recherche dans les demandes d\'inscription...');
        const inscriptionRequest = await prisma.inscriptionRequest.findUnique({
            where: { parentEmail: targetEmail }
        });

        if (inscriptionRequest) {
            console.log('âœ… Demande d\'inscription trouvÃ©e:');
            console.log('   ID:', inscriptionRequest.id);
            console.log('   Parent:', inscriptionRequest.parentFirstName, inscriptionRequest.parentLastName);
            console.log('   Statut:', inscriptionRequest.status);
            console.log('   CrÃ©Ã©e le:', inscriptionRequest.createdAt);

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

            console.log('\nðŸ—‘ï¸ Suppression de la demande d\'inscription...');
            await prisma.inscriptionRequest.delete({
                where: { id: inscriptionRequest.id }
            });
            console.log('âœ… Demande d\'inscription supprimÃ©e');
        } else {
            console.log('âŒ Aucune demande d\'inscription trouvÃ©e');
        }

        // 2. Chercher dans les utilisateurs
        console.log('\n2ï¸âƒ£ Recherche dans les comptes utilisateur...');
        const user = await prisma.user.findUnique({
            where: { email: targetEmail }
        });

        if (user) {
            console.log('âœ… Compte utilisateur trouvÃ©:');
            console.log('   ID:', user.id);
            console.log('   Nom:', user.firstName, user.lastName);
            console.log('   RÃ´le:', user.role);
            console.log('   CrÃ©Ã© le:', user.createdAt);

            // Chercher les Ã©tudiants liÃ©s Ã  ce parent
            const students = await prisma.student.findMany({
                where: { parentId: user.id },
                include: {
                    classe: true
                }
            });

            if (students && students.length > 0) {
                console.log('   Enfants liÃ©s:');
                students.forEach((student, index) => {
                    console.log(`     ${index + 1}. ${student.firstName} ${student.lastName} (Classe: ${student.classe?.nom || 'Non assignÃ©'})`);
                });

                console.log('\nðŸ—‘ï¸ Suppression des Ã©tudiants liÃ©s...');
                for (const student of students) {
                    await prisma.student.delete({
                        where: { id: student.id }
                    });
                    console.log(`   âœ… Ã‰tudiant supprimÃ©: ${student.firstName} ${student.lastName}`);
                }
            }

            console.log('\nðŸ—‘ï¸ Suppression du compte utilisateur...');
            await prisma.user.delete({
                where: { id: user.id }
            });
            console.log('âœ… Compte utilisateur supprimÃ©');
        } else {
            console.log('âŒ Aucun compte utilisateur trouvÃ©');
        }

        console.log('\nâœ… NETTOYAGE TERMINÃ‰ !');
        console.log('Vous pouvez maintenant refaire une inscription avec sebcecg@gmail.com');

        await prisma.$disconnect();

    } catch (error) {
        console.error('âŒ Erreur:', error.message);
        console.error(error);
        process.exit(1);
    }
}

findAndDeleteInscription();


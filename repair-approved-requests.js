const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function repairApprovedRequests() {
    try {
        console.log('ðŸ”§ RÃ‰PARATION DES DEMANDES APPROUVÃ‰ES');
        console.log('=\n');

        // RÃ©cupÃ©rer les demandes approuvÃ©es sans compte parent crÃ©Ã©
        const approvedRequests = await prisma.inscriptionRequest.findMany({
            where: { status: 'APPROVED' }
        });

        console.log(`ðŸ“ ${approvedRequests.length} demandes approuvÃ©es trouvÃ©es\n`);

        for (const request of approvedRequests) {
            console.log(`ðŸ”„ Traitement: ${request.parentFirstName} ${request.parentLastName}`);

            // VÃ©rifier si le compte parent existe dÃ©jÃ 
            const existingUser = await prisma.user.findUnique({
                where: { email: request.parentEmail }
            });

            if (existingUser) {
                console.log('   âœ… Compte parent existe dÃ©jÃ ');

                // VÃ©rifier si les enfants existent
                const existingStudents = await prisma.student.findMany({
                    where: { parentId: existingUser.id }
                });

                if (existingStudents.length > 0) {
                    console.log(`   âœ… ${existingStudents.length} enfant(s) existe(nt) dÃ©jÃ `);
                    continue;
                } else {
                    console.log('   âš ï¸  Compte parent existe mais pas d\'enfants - crÃ©ation des enfants...');

                    // CrÃ©er les enfants manquants
                    await createMissingChildren(request, existingUser.id);
                }
            } else {
                console.log('   âŒ Aucun compte parent - crÃ©ation complÃ¨te...');

                // CrÃ©er le compte parent et les enfants
                await createCompleteAccount(request);
            }

            console.log('');
        }

        console.log('âœ… RÃ©paration terminÃ©e !');
        await prisma.$disconnect();

    } catch (error) {
        console.error('âŒ Erreur:', error);
        process.exit(1);
    }
}

async function createMissingChildren(request, parentId) {
    try {
        // VÃ©rifier classe par dÃ©faut
        let defaultClasse = await prisma.classe.findFirst({
            where: { nom: 'Non assignÃ©' }
        });

        if (!defaultClasse) {
            defaultClasse = await prisma.classe.create({
                data: {
                    nom: 'Non assignÃ©',
                    niveau: 'En attente',
                    anneeScolaire: new Date().getFullYear().toString()
                }
            });
        }

        // Parser les enfants
        let childrenData = request.children;
        if (typeof request.children === 'string') {
            childrenData = JSON.parse(request.children);
        }

        for (const child of childrenData) {
            const student = await prisma.student.create({
                data: {
                    firstName: child.firstName,
                    lastName: child.lastName,
                    dateNaissance: new Date(child.birthDate),
                    parentId: parentId,
                    classeId: defaultClasse.id
                }
            });
            console.log(`     âœ… Enfant crÃ©Ã©: ${student.firstName} ${student.lastName}`);
        }
    } catch (error) {
        console.error('     âŒ Erreur crÃ©ation enfants:', error.message);
    }
}

async function createCompleteAccount(request) {
    try {
        // GÃ©nÃ©rer mot de passe
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // CrÃ©er le parent
        const parentUser = await prisma.user.create({
            data: {
                firstName: request.parentFirstName,
                lastName: request.parentLastName,
                email: request.parentEmail,
                phone: request.parentPhone,
                adress: request.parentAddress,
                password: hashedPassword,
                role: 'PARENT'
            }
        });

        console.log(`     âœ… Parent crÃ©Ã©: ${parentUser.email} (mot de passe: ${tempPassword})`);

        // CrÃ©er les enfants
        await createMissingChildren(request, parentUser.id);

    } catch (error) {
        console.error('     âŒ Erreur crÃ©ation compte:', error.message);
    }
}

repairApprovedRequests();


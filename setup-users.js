const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupUsers() {
    try {
        console.log('ðŸ”§ Configuration des utilisateurs principaux...\n');

        // 1. Mettre Ã  jour le rÃ´le de Lionel : ADMIN â†’ DIRECTEUR
        console.log('ðŸ‘¨â€ðŸ’¼ Mise Ã  jour du rÃ´le de Lionel Camboulives...');
        const lionel = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (lionel) {
            await prisma.user.update({
                where: { email: 'l.camboulives@orange.fr' },
                data: { role: 'DIRECTEUR' }
            });
            console.log('âœ… Lionel Camboulives mis Ã  jour : ADMIN â†’ DIRECTEUR');
        } else {
            console.log('âŒ Compte de Lionel non trouvÃ©');
        }

        // 2. CrÃ©er votre compte SUPER_ADMIN
        console.log('\nðŸ› ï¸ CrÃ©ation du compte SUPER_ADMIN...');
        const superAdminEmail = 'admin@st-mathieu.fr'; // Changez par votre email
        const superAdminPassword = 'SuperAdmin2025!'; // Changez par votre mot de passe

        const existingSuperAdmin = await prisma.user.findUnique({
            where: { email: superAdminEmail }
        });

        if (!existingSuperAdmin) {
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

            await prisma.user.create({
                data: {
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: superAdminEmail,
                    password: hashedPassword,
                    phone: '00.00.00.00.00',
                    adress: 'Ã‰cole Saint-Mathieu',
                    role: 'SUPER_ADMIN'
                }
            });
            console.log('âœ… Compte SUPER_ADMIN crÃ©Ã©');
        } else {
            console.log('âš ï¸ Compte SUPER_ADMIN existe dÃ©jÃ ');
        }

        // 3. CrÃ©er un compte ASSISTANT_DIRECTION (optionnel)
        console.log('\nðŸ‘©â€ðŸ’¼ CrÃ©ation du compte ASSISTANT_DIRECTION...');
        const assistantEmail = 'assistant@st-mathieu.fr'; // Changez par l'email de l'assistante
        const assistantPassword = 'Assistant2025!';

        const existingAssistant = await prisma.user.findUnique({
            where: { email: assistantEmail }
        });

        if (!existingAssistant) {
            const hashedPassword = await bcrypt.hash(assistantPassword, 10);

            await prisma.user.create({
                data: {
                    firstName: 'Assistant',
                    lastName: 'Direction',
                    email: assistantEmail,
                    password: hashedPassword,
                    phone: '00.00.00.00.00',
                    adress: 'Ã‰cole Saint-Mathieu',
                    role: 'ASSISTANT_DIRECTION'
                }
            });
            console.log('âœ… Compte ASSISTANT_DIRECTION crÃ©Ã©');
        } else {
            console.log('âš ï¸ Compte ASSISTANT_DIRECTION existe dÃ©jÃ ');
        }

        // 4. CrÃ©er un compte APEL (optionnel)
        console.log('\nðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦ CrÃ©ation du compte APEL...');
        const apelEmail = 'apel@st-mathieu.fr'; // Changez par l'email de l'APEL
        const apelPassword = 'Apel2025!';

        const existingApel = await prisma.user.findUnique({
            where: { email: apelEmail }
        });

        if (!existingApel) {
            const hashedPassword = await bcrypt.hash(apelPassword, 10);

            await prisma.user.create({
                data: {
                    firstName: 'Responsable',
                    lastName: 'APEL',
                    email: apelEmail,
                    password: hashedPassword,
                    phone: '00.00.00.00.00',
                    adress: 'Ã‰cole Saint-Mathieu',
                    role: 'APEL'
                }
            });
            console.log('âœ… Compte APEL crÃ©Ã©');
        } else {
            console.log('âš ï¸ Compte APEL existe dÃ©jÃ ');
        }

        // Affichage des comptes crÃ©Ã©s
        console.log('\nðŸ“‹ RÃ‰CAPITULATIF DES COMPTES :');
        console.log('==');

        const users = await prisma.user.findMany({
            where: {
                role: {
                    in: ['SUPER_ADMIN', 'DIRECTEUR', 'ASSISTANT_DIRECTION', 'APEL']
                }
            },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
            },
            orderBy: {
                role: 'asc'
            }
        });

        users.forEach(user => {
            console.log(`ðŸ“§ ${user.role}: ${user.firstName} ${user.lastName} (${user.email})`);
        });

        console.log('\nðŸ”‘ MOTS DE PASSE :');
        console.log('==');
        console.log('ðŸŽ¯ DIRECTEUR (Lionel): StMathieu2025!');
        console.log('ðŸ› ï¸ SUPER_ADMIN: SuperAdmin2025!');
        console.log('ðŸ‘©â€ðŸ’¼ ASSISTANT_DIRECTION: Assistant2025!');
        console.log('ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦ APEL: Apel2025!');

        console.log('\nâš ï¸ IMPORTANT: Changez ces mots de passe aprÃ¨s la premiÃ¨re connexion !');
        console.log('âœ… Configuration terminÃ©e avec succÃ¨s !');

    } catch (error) {
        console.error('âŒ Erreur lors de la configuration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupUsers();


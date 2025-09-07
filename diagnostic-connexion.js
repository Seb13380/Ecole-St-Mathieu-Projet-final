const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fullDiagnostic() {
    try {
        console.log('ðŸ” DIAGNOSTIC COMPLET DE CONNEXION');
        console.log('==');

        // 1. VÃ©rifier la base de donnÃ©es
        console.log('\n1ï¸âƒ£ Test de connexion Ã  la base de donnÃ©es...');
        const dbTest = await prisma.user.count();
        console.log('âœ… Base de donnÃ©es accessible -', dbTest, 'utilisateurs trouvÃ©s');

        // 2. VÃ©rifier l'utilisateur admin
        console.log('\n2ï¸âƒ£ Recherche de l\'utilisateur admin...');
        const adminUser = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (!adminUser) {
            console.log('âŒ PROBLÃˆME: Utilisateur admin non trouvÃ© !');

            // CrÃ©er un nouvel admin
            console.log('ðŸ”§ CrÃ©ation d\'un nouvel administrateur...');
            const hashedPassword = await bcrypt.hash('AdminStMathieu2025!', 10);

            const newAdmin = await prisma.user.create({
                data: {
                    firstName: 'Admin',
                    lastName: 'StMathieu',
                    email: 'admin.stmathieu@gmail.com',
                    password: hashedPassword,
                    phone: '01.23.45.67.89',
                    adress: 'Ã‰cole Saint-Mathieu',
                    role: 'ADMIN'
                }
            });

            console.log('âœ… Nouvel admin crÃ©Ã© !');
            console.log('ðŸ“§ Email: admin.stmathieu@gmail.com');
            console.log('ðŸ”‘ Mot de passe: AdminStMathieu2025!');
            return;
        }

        console.log('âœ… Utilisateur admin trouvÃ©:', {
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role
        });

        // 3. Test des mots de passe
        console.log('\n3ï¸âƒ£ Test des mots de passe...');
        const passwords = ['StMathieu2025!', 'AdminStMathieu2024!', 'admin123'];

        for (const pwd of passwords) {
            const isValid = await bcrypt.compare(pwd, adminUser.password);
            console.log(`ðŸ”‘ "${pwd}": ${isValid ? 'âœ… VALIDE' : 'âŒ Invalide'}`);

            if (isValid) {
                console.log('\nðŸŽ‰ MOT DE PASSE TROUVÃ‰ !');
                console.log('ðŸ“§ Email:', adminUser.email);
                console.log('ðŸ”‘ Mot de passe:', pwd);
                return;
            }
        }

        // 4. RÃ©initialiser le mot de passe
        console.log('\n4ï¸âƒ£ Aucun mot de passe ne fonctionne - RÃ©initialisation...');
        const newPassword = 'AdminStMathieu2025!';
        const newHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: adminUser.email },
            data: { password: newHash }
        });

        console.log('âœ… Mot de passe rÃ©initialisÃ© !');
        console.log('\nðŸ” NOUVEAUX IDENTIFIANTS :');
        console.log('ðŸ“§ Email:', adminUser.email);
        console.log('ðŸ”‘ Mot de passe:', newPassword);

        // 5. Lister tous les admins
        console.log('\n5ï¸âƒ£ Tous les administrateurs disponibles :');
        const allAdmins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true, firstName: true, lastName: true }
        });

        allAdmins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
        });

    } catch (error) {
        console.error('âŒ ERREUR CRITIQUE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fullDiagnostic();


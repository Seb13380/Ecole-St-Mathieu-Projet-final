const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifierEmailDirecteur() {
    console.log('ðŸ” VÃ‰RIFICATION EMAIL DIRECTEUR');
    console.log('===');

    try {
        // Chercher le directeur
        const directeur = await prisma.user.findFirst({
            where: { role: 'DIRECTEUR' }
        });

        if (directeur) {
            console.log('âœ… Directeur trouvÃ©:');
            console.log('   ðŸ‘¤ Nom:', directeur.firstName, directeur.lastName);
            console.log('   ðŸ“§ Email:', directeur.email);
            console.log('   ðŸ”‘ RÃ´le:', directeur.role);
            console.log('   âœ… Actif:', directeur.isActive);
            console.log('   ðŸ†” ID:', directeur.id);

            if (directeur.email === 'sgdigitalweb13@gmail.com') {
                console.log('\nðŸŽ‰ âœ… EMAIL DIRECTEUR CORRECT !');
                console.log('   Les notifications d\'inscription iront Ã  la bonne adresse');
            } else {
                console.log('\nâš ï¸ âŒ EMAIL DIRECTEUR INCORRECT !');
                console.log('   Actuel:', directeur.email);
                console.log('   Attendu: sgdigitalweb13@gmail.com');
                console.log('\nðŸ”§ CORRECTION NÃ‰CESSAIRE...');

                // Corriger l'email
                await prisma.user.update({
                    where: { id: directeur.id },
                    data: { email: 'sgdigitalweb13@gmail.com' }
                });

                console.log('âœ… Email directeur corrigÃ© vers sgdigitalweb13@gmail.com');
            }
        } else {
            console.log('âŒ Aucun directeur trouvÃ© dans la base');

            // Chercher tous les utilisateurs avec rÃ´le admin
            const admins = await prisma.user.findMany({
                where: {
                    OR: [
                        { role: 'ADMIN' },
                        { role: 'DIRECTEUR' },
                        { email: 'sgdigitalweb13@gmail.com' }
                    ]
                }
            });

            console.log('\nðŸ“‹ Utilisateurs admin/directeur trouvÃ©s:', admins.length);
            admins.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log('      ðŸ“§ Email:', user.email);
                console.log('      ðŸ”‘ RÃ´le:', user.role);
                console.log('      âœ… Actif:', user.isActive);
            });

            if (admins.length > 0) {
                console.log('\nðŸ”§ Mise Ã  jour vers DIRECTEUR...');
                const admin = admins.find(u => u.email === 'sgdigitalweb13@gmail.com');
                if (admin) {
                    await prisma.user.update({
                        where: { id: admin.id },
                        data: { role: 'DIRECTEUR' }
                    });
                    console.log(`âœ… ${admin.firstName} ${admin.lastName} est maintenant DIRECTEUR`);
                }
            }
        }

        // VÃ©rification finale
        console.log('\nðŸ” VÃ‰RIFICATION FINALE...');
        const directeurFinal = await prisma.user.findFirst({
            where: {
                AND: [
                    { role: 'DIRECTEUR' },
                    { email: 'sgdigitalweb13@gmail.com' }
                ]
            }
        });

        if (directeurFinal) {
            console.log('ðŸŽ‰ âœ… CONFIGURATION PARFAITE !');
            console.log(`   ðŸ‘¤ Directeur: ${directeurFinal.firstName} ${directeurFinal.lastName}`);
            console.log(`   ðŸ“§ Email: ${directeurFinal.email}`);
            console.log('   ðŸ“¬ Les notifications d\'inscription arriveront correctement');
        } else {
            console.log('âŒ Configuration encore incorrecte');
        }

    } catch (error) {
        console.error('âŒ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifierEmailDirecteur();


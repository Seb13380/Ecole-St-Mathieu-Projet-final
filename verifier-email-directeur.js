const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifierEmailDirecteur() {
    console.log('🔍 VÉRIFICATION EMAIL DIRECTEUR');
    console.log('===============================');

    try {
        // Chercher le directeur
        const directeur = await prisma.user.findFirst({
            where: { role: 'DIRECTEUR' }
        });

        if (directeur) {
            console.log('✅ Directeur trouvé:');
            console.log('   👤 Nom:', directeur.firstName, directeur.lastName);
            console.log('   📧 Email:', directeur.email);
            console.log('   🔑 Rôle:', directeur.role);
            console.log('   ✅ Actif:', directeur.isActive);
            console.log('   🆔 ID:', directeur.id);

            if (directeur.email === 'sgdigitalweb13@gmail.com') {
                console.log('\n🎉 ✅ EMAIL DIRECTEUR CORRECT !');
                console.log('   Les notifications d\'inscription iront à la bonne adresse');
            } else {
                console.log('\n⚠️ ❌ EMAIL DIRECTEUR INCORRECT !');
                console.log('   Actuel:', directeur.email);
                console.log('   Attendu: sgdigitalweb13@gmail.com');
                console.log('\n🔧 CORRECTION NÉCESSAIRE...');

                // Corriger l'email
                await prisma.user.update({
                    where: { id: directeur.id },
                    data: { email: 'sgdigitalweb13@gmail.com' }
                });

                console.log('✅ Email directeur corrigé vers sgdigitalweb13@gmail.com');
            }
        } else {
            console.log('❌ Aucun directeur trouvé dans la base');

            // Chercher tous les utilisateurs avec rôle admin
            const admins = await prisma.user.findMany({
                where: {
                    OR: [
                        { role: 'ADMIN' },
                        { role: 'DIRECTEUR' },
                        { email: 'sgdigitalweb13@gmail.com' }
                    ]
                }
            });

            console.log('\n📋 Utilisateurs admin/directeur trouvés:', admins.length);
            admins.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log('      📧 Email:', user.email);
                console.log('      🔑 Rôle:', user.role);
                console.log('      ✅ Actif:', user.isActive);
            });

            if (admins.length > 0) {
                console.log('\n🔧 Mise à jour vers DIRECTEUR...');
                const admin = admins.find(u => u.email === 'sgdigitalweb13@gmail.com');
                if (admin) {
                    await prisma.user.update({
                        where: { id: admin.id },
                        data: { role: 'DIRECTEUR' }
                    });
                    console.log(`✅ ${admin.firstName} ${admin.lastName} est maintenant DIRECTEUR`);
                }
            }
        }

        // Vérification finale
        console.log('\n🔍 VÉRIFICATION FINALE...');
        const directeurFinal = await prisma.user.findFirst({
            where: {
                AND: [
                    { role: 'DIRECTEUR' },
                    { email: 'sgdigitalweb13@gmail.com' }
                ]
            }
        });

        if (directeurFinal) {
            console.log('🎉 ✅ CONFIGURATION PARFAITE !');
            console.log(`   👤 Directeur: ${directeurFinal.firstName} ${directeurFinal.lastName}`);
            console.log(`   📧 Email: ${directeurFinal.email}`);
            console.log('   📬 Les notifications d\'inscription arriveront correctement');
        } else {
            console.log('❌ Configuration encore incorrecte');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifierEmailDirecteur();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔐 Création de l\'administrateur principal...');

        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (existingAdmin) {
            console.log('✅ Un administrateur existe déjà:', existingAdmin.email);
            console.log('📧 Email:', existingAdmin.email);
            return;
        }

        const adminPassword = await bcrypt.hash('AdminStMathieu2024!', 10);

        const admin = await prisma.user.create({
            data: {
                firstName: 'Super',
                lastName: 'Administrateur',
                email: 'admin@stmathieu.fr',
                password: adminPassword,
                phone: '01.23.45.67.89',
                adress: 'École Saint-Mathieu',
                role: 'ADMIN'
            }
        });

        console.log('🎉 Administrateur créé avec succès !');
        console.log('📧 Email: admin@stmathieu.fr');
        console.log('🔑 Mot de passe: AdminStMathieu2024!');
        console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !');

        console.log('📝 Création de codes d\'invitation par défaut...');

        const codes = [
            { code: 'DIR2024STM', role: 'DIRECTION' },
            { code: 'ENS2024STM', role: 'ENSEIGNANT' },
            { code: 'APEL2024STM', role: 'APEL' }
        ];

        for (const codeData of codes) {
            await prisma.invitationCode.create({
                data: {
                    code: codeData.code,
                    role: codeData.role,
                    createdBy: admin.id,
                    valideJusqu: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
                }
            });
            console.log(`✨ Code créé: ${codeData.code} (${codeData.role})`);
        }

        console.log('\n🔒 Codes d\'invitation créés (valides 30 jours):');
        console.log('• DIRECTION: DIR2024STM');
        console.log('• ENSEIGNANT: ENS2024STM');
        console.log('• APEL: APEL2024STM');

    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();

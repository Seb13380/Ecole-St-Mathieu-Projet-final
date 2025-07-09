const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fullDiagnostic() {
    try {
        console.log('🔍 DIAGNOSTIC COMPLET DE CONNEXION');
        console.log('=====================================');

        // 1. Vérifier la base de données
        console.log('\n1️⃣ Test de connexion à la base de données...');
        const dbTest = await prisma.user.count();
        console.log('✅ Base de données accessible -', dbTest, 'utilisateurs trouvés');

        // 2. Vérifier l'utilisateur admin
        console.log('\n2️⃣ Recherche de l\'utilisateur admin...');
        const adminUser = await prisma.user.findUnique({
            where: { email: 'l.camboulives@orange.fr' }
        });

        if (!adminUser) {
            console.log('❌ PROBLÈME: Utilisateur admin non trouvé !');

            // Créer un nouvel admin
            console.log('🔧 Création d\'un nouvel administrateur...');
            const hashedPassword = await bcrypt.hash('AdminStMathieu2025!', 10);

            const newAdmin = await prisma.user.create({
                data: {
                    firstName: 'Admin',
                    lastName: 'StMathieu',
                    email: 'admin.stmathieu@gmail.com',
                    password: hashedPassword,
                    phone: '01.23.45.67.89',
                    adress: 'École Saint-Mathieu',
                    role: 'ADMIN'
                }
            });

            console.log('✅ Nouvel admin créé !');
            console.log('📧 Email: admin.stmathieu@gmail.com');
            console.log('🔑 Mot de passe: AdminStMathieu2025!');
            return;
        }

        console.log('✅ Utilisateur admin trouvé:', {
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role
        });

        // 3. Test des mots de passe
        console.log('\n3️⃣ Test des mots de passe...');
        const passwords = ['StMathieu2025!', 'AdminStMathieu2024!', 'admin123'];

        for (const pwd of passwords) {
            const isValid = await bcrypt.compare(pwd, adminUser.password);
            console.log(`🔑 "${pwd}": ${isValid ? '✅ VALIDE' : '❌ Invalide'}`);

            if (isValid) {
                console.log('\n🎉 MOT DE PASSE TROUVÉ !');
                console.log('📧 Email:', adminUser.email);
                console.log('🔑 Mot de passe:', pwd);
                return;
            }
        }

        // 4. Réinitialiser le mot de passe
        console.log('\n4️⃣ Aucun mot de passe ne fonctionne - Réinitialisation...');
        const newPassword = 'AdminStMathieu2025!';
        const newHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: adminUser.email },
            data: { password: newHash }
        });

        console.log('✅ Mot de passe réinitialisé !');
        console.log('\n🔐 NOUVEAUX IDENTIFIANTS :');
        console.log('📧 Email:', adminUser.email);
        console.log('🔑 Mot de passe:', newPassword);

        // 5. Lister tous les admins
        console.log('\n5️⃣ Tous les administrateurs disponibles :');
        const allAdmins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true, firstName: true, lastName: true }
        });

        allAdmins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
        });

    } catch (error) {
        console.error('❌ ERREUR CRITIQUE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fullDiagnostic();

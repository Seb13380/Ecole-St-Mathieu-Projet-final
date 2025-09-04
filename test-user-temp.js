const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTempUser() {
    try {
        // Créer un utilisateur temporaire pour test
        const hashedPassword = await bcrypt.hash('test123', 10);

        const user = await prisma.user.upsert({
            where: { email: 'test@test.com' },
            update: {},
            create: {
                email: 'test@test.com',
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'User',
                role: 'PARENT',
                adress: 'Test Address',
                phone: '0123456789'
            }
        });

        console.log('✅ Utilisateur temporaire créé:', user.email);
        console.log('📧 Email: test@test.com');
        console.log('🔑 Mot de passe: test123');

    } catch (error) {
        console.error('❌ Erreur création utilisateur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTempUser();

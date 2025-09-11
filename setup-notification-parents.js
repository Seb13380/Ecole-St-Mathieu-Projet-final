require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupParentsForNotifications() {
    try {
        console.log('=== SETUP PARENTS POUR NOTIFICATIONS EMAIL ===');
        
        // Vérifier les parents existants
        const existingParents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: { id: true, email: true, firstName: true, lastName: true }
        });
        
        console.log(`📊 Parents existants: ${existingParents.length}`);
        existingParents.forEach(p => console.log(`  - ${p.firstName} ${p.lastName} (${p.email})`));
        
        // Créer un parent test avec votre email si pas déjà présent
        const yourEmail = 'sebcecg@gmail.com';
        const existingYourEmail = await prisma.user.findUnique({
            where: { email: yourEmail }
        });
        
        if (existingYourEmail) {
            if (existingYourEmail.role !== 'PARENT') {
                // Mettre à jour le rôle vers PARENT
                const updated = await prisma.user.update({
                    where: { email: yourEmail },
                    data: { role: 'PARENT' }
                });
                console.log(`✅ ${yourEmail} mis à jour vers rôle PARENT`);
            } else {
                console.log(`✅ ${yourEmail} est déjà PARENT`);
            }
        } else {
            // Créer un nouveau parent avec votre email
            const hashedPassword = await bcrypt.hash('notifications123', 12);
            
            const newParent = await prisma.user.create({
                data: {
                    firstName: 'Seb',
                    lastName: 'Parent Notifications',
                    email: yourEmail,
                    password: hashedPassword,
                    phone: '06.00.11.22.33',
                    adress: 'Email notifications test',
                    role: 'PARENT'
                }
            });
            console.log(`✅ Nouveau parent créé: ${newParent.email}`);
        }
        
        // Créer quelques parents de test additionnels si nécessaire
        const testParents = [
            {
                firstName: 'Parent',
                lastName: 'Test 1',
                email: 'parent1@test.local',
                phone: '06.01.02.03.04'
            },
            {
                firstName: 'Parent',
                lastName: 'Test 2', 
                email: 'parent2@test.local',
                phone: '06.05.06.07.08'
            }
        ];
        
        for (const parentData of testParents) {
            const existing = await prisma.user.findUnique({
                where: { email: parentData.email }
            });
            
            if (!existing) {
                const hashedPassword = await bcrypt.hash('parent123', 12);
                
                const parent = await prisma.user.create({
                    data: {
                        firstName: parentData.firstName,
                        lastName: parentData.lastName,
                        email: parentData.email,
                        password: hashedPassword,
                        phone: parentData.phone,
                        adress: 'Test notifications',
                        role: 'PARENT'
                    }
                });
                console.log(`✅ Parent test créé: ${parent.email}`);
            } else {
                console.log(`⚠️ ${parentData.email} existe déjà`);
            }
        }
        
        // Vérification finale
        const finalParentCount = await prisma.user.count({ where: { role: 'PARENT' } });
        console.log(`\n🎯 RÉSULTAT FINAL: ${finalParentCount} parent(s) pour les notifications`);
        
        console.log('\n📧 POUR TESTER LES NOTIFICATIONS:');
        console.log('1. Créez une nouvelle actualité');
        console.log('2. Cochez "Visible sur le site"');
        console.log('3. Vérifiez la réception sur sebcecg@gmail.com');
        
    } catch (error) {
        console.error('❌ Erreur setup parents:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupParentsForNotifications();

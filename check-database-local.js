const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('=== VÉRIFICATION BASE DE DONNÉES LOCALE ===');
        
        // Vérifier les classes
        const classes = await prisma.classe.findMany();
        console.log('\n📚 CLASSES EXISTANTES:', classes.length);
        classes.forEach(c => console.log(`- ${c.nom} (${c.niveau}) - ID: ${c.id}`));
        
        // Vérifier les parents
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: { id: true, firstName: true, lastName: true, email: true }
        });
        console.log('\n👨‍👩‍👧‍👦 PARENTS EXISTANTS:', parents.length);
        parents.forEach(p => console.log(`- ${p.firstName} ${p.lastName} (${p.email}) - ID: ${p.id}`));
        
        // Vérifier les étudiants
        const students = await prisma.student.findMany({
            include: { classe: true, parent: true }
        });
        console.log('\n👶 ÉTUDIANTS EXISTANTS:', students.length);
        students.forEach(s => console.log(`- ${s.firstName} ${s.lastName} - Classe: ${s.classe?.nom || 'Non assigné'} - Parent: ${s.parent?.firstName} ${s.parent?.lastName}`));
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();

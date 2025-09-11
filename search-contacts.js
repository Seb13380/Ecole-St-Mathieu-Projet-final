const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchContactsAndLogs() {
    try {
        console.log('🔍 Recherche dans les contacts et messages...');

        // Chercher dans les logs de contact si ils existent
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'ecole_st_mathieu'
            AND table_name LIKE '%contact%' OR table_name LIKE '%message%' OR table_name LIKE '%log%'
        `;

        console.log('📋 Tables trouvées:', tables);

        // Chercher aussi les demandes d'inscription
        const inscriptions = await prisma.inscriptionRequest.findMany({
            select: {
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                parentPhone: true,
                submittedAt: true
            },
            orderBy: { submittedAt: 'desc' }
        });

        console.log('\n📝 Demandes d\'inscription récentes:');
        inscriptions.slice(0, 10).forEach(req => {
            console.log(`- ${req.parentFirstName} ${req.parentLastName}: ${req.parentEmail} (${req.parentPhone || 'Pas de tél'})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

searchContactsAndLogs();

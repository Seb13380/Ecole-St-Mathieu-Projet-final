const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportInscriptions() {
    try {
        // Exporter les preInscriptions qui fonctionnent en local
        const preInscriptions = await prisma.preInscriptionRequest.findMany({
            select: {
                id: true,
                children: true,
                message: true,
                parentFirstName: true,
                parentLastName: true,
                status: true
            }
        });

        // Sauvegarder dans un fichier
        fs.writeFileSync('inscriptions-local.json', JSON.stringify(preInscriptions, null, 2));

        console.log(`✅ Exporté ${preInscriptions.length} pré-inscriptions depuis le local`);
        console.log('Fichier créé: inscriptions-local.json');

        // Afficher quelques exemples
        preInscriptions.slice(0, 3).forEach(inscription => {
            console.log(`\nID ${inscription.id}:`);
            console.log('  Children:', inscription.children);
            console.log('  Message:', inscription.message);
        });

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportInscriptions();
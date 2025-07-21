// Script pour créer l'utilisateur Frank avec tous les droits nécessaires
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createFrank() {
    try {
        console.log('🔧 Création de l\'utilisateur Frank...');

        // Vérifier si Frank existe déjà
        const existingFrank = await prisma.user.findUnique({
            where: { email: 'frank@st-mathieu.fr' }
        });

        if (existingFrank) {
            console.log('✅ Frank existe déjà, mise à jour de ses droits...');

            // Mettre à jour ses droits si nécessaire
            const updatedFrank = await prisma.user.update({
                where: { email: 'frank@st-mathieu.fr' },
                data: {
                    role: 'MAINTENANCE_SITE', // Nouveau rôle pour Frank
                    firstName: 'Frank',
                    lastName: 'Gestionnaire'
                }
            });

            console.log('✅ Droits de Frank mis à jour:', updatedFrank.role);
            return updatedFrank;
        }

        // Créer Frank s'il n'existe pas
        const hashedPassword = await bcrypt.hash('Frank2025!', 10);

        const frank = await prisma.user.create({
            data: {
                firstName: 'Frank',
                lastName: 'Gestionnaire',
                email: 'frank@st-mathieu.fr',
                password: hashedPassword,
                phone: '06.12.34.56.79',
                adress: 'École Saint-Mathieu',
                role: 'MAINTENANCE_SITE' // Nouveau rôle pour la maintenance du site
            }
        });

        console.log('✅ Frank créé avec succès:', frank.email);
        console.log('🔑 Mot de passe temporaire: Frank2025!');
        console.log('🎯 Rôle: MAINTENANCE_SITE');

        return frank;

    } catch (error) {
        console.error('❌ Erreur lors de la création de Franck:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
createFrank()
    .then(() => {
        console.log('✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });

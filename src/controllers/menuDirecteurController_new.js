const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const menuDirecteurController = {
    // Afficher la liste des menus pour le directeur
    async gestionMenus(req, res) {
        try {
            const menus = await prisma.menu.findMany({
                include: {
                    auteur: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: {
                    dateDebut: 'desc'
                }
            });

            res.render('pages/directeur/menus', {
                title: 'Gestion des menus - Direction',
                menus: menus,
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des menus:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des menus'
            });
        }
    }
};

module.exports = { menuDirecteurController };

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Affichage public des menus pour les utilisateurs
exports.getMenus = async (req, res) => {
    try {
        const menus = await prisma.menu.findMany({
            orderBy: {
                semaine: 'desc'
            }
        });

        res.render('pages/restauration/menus', {
            title: 'Menus de la semaine',
            user: req.user,
            menus: menus,
            userRole: req.user ? req.user.role : null
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des menus:', error);
        res.status(500).render('error', {
            message: 'Erreur lors du chargement des menus'
        });
    }
};

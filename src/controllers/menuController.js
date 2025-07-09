const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const menuController = {
    // Afficher les menus de la semaine (page publique)
    getMenus: async (req, res) => {
        try {
            const menusActifs = await prisma.menu.findMany({
                where: { actif: true },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.render('pages/restauration/menus', {
                title: 'École Saint-Mathieu - Menus de la semaine',
                menus: menusActifs // Maintenant on passe tous les menus actifs
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des menus:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des menus'
            });
        }
    },

    // Admin: Liste tous les menus
    getAdminMenus: async (req, res) => {
        try {
            console.log('🍽️ Accès à la page admin des menus');
            console.log('👤 Utilisateur:', req.session.user?.email);

            // Récupérer tous les menus de la base de données
            const menus = await prisma.menu.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            console.log('📝 Menus trouvés:', menus.length);

            res.render('pages/admin/menus', {
                title: 'Gestion des menus',
                menus: menus
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des menus:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des menus'
            });
        }
    },

    // Admin: Afficher le formulaire de création
    getCreateMenu: (req, res) => {
        res.render('pages/admin/create-menu', {
            title: 'Créer un nouveau menu'
        });
    },

    // Admin: Créer un nouveau menu
    postCreateMenu: async (req, res) => {
        try {
            console.log('🍽️ Tentative de création de menu');
            console.log('📝 Données reçues:', req.body);
            console.log('👤 Utilisateur:', req.session.user);

            const { semaine, lundi, mardi, mercredi, jeudi, vendredi, desactiverAnciens } = req.body;

            if (!semaine || semaine.trim() === '') {
                console.log('❌ Semaine manquante');
                return res.redirect('/admin/menus?error=La semaine est obligatoire');
            }

            if (!req.session.user || !req.session.user.id) {
                console.log('❌ Utilisateur non connecté');
                return res.redirect('/login');
            }

            // Si l'option est cochée, désactiver les anciens menus
            if (desactiverAnciens === 'on') {
                console.log('🔄 Désactivation des anciens menus...');
                await prisma.menu.updateMany({
                    where: { actif: true },
                    data: { actif: false }
                });
            }

            console.log('✅ Création du nouveau menu...');
            // Créer le nouveau menu (sans désactiver les anciens automatiquement)
            const nouveauMenu = await prisma.menu.create({
                data: {
                    semaine: semaine.trim(),
                    lundi: lundi?.trim() || null,
                    mardi: mardi?.trim() || null,
                    mercredi: mercredi?.trim() || null,
                    jeudi: jeudi?.trim() || null,
                    vendredi: vendredi?.trim() || null,
                    auteurId: req.session.user.id,
                    actif: true
                }
            });

            console.log('🎉 Menu créé avec succès:', nouveauMenu.id);
            res.redirect('/admin/menus?success=Menu créé avec succès');
        } catch (error) {
            console.error('❌ Erreur complète lors de la création du menu:', error);
            console.error('Stack trace:', error.stack);
            res.redirect('/admin/menus?error=Erreur lors de la création du menu: ' + error.message);
        }
    },

    // Admin: Afficher le formulaire d'édition
    getEditMenu: async (req, res) => {
        try {
            const { id } = req.params;
            const menu = await prisma.menu.findUnique({
                where: { id: parseInt(id) }
            });

            if (!menu) {
                return res.status(404).render('pages/error', {
                    message: 'Menu non trouvé'
                });
            }

            res.render('pages/admin/edit-menu', {
                title: 'Modifier le menu',
                menu: menu
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du menu:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération du menu'
            });
        }
    },

    // Admin: Modifier un menu
    postEditMenu: async (req, res) => {
        try {
            const { id } = req.params;
            const { semaine, lundi, mardi, mercredi, jeudi, vendredi, actif } = req.body;

            await prisma.menu.update({
                where: { id: parseInt(id) },
                data: {
                    semaine,
                    lundi: lundi || null,
                    mardi: mardi || null,
                    mercredi: mercredi || null,
                    jeudi: jeudi || null,
                    vendredi: vendredi || null,
                    actif: actif === 'on'
                }
            });

            res.redirect('/admin/menus?success=Menu modifié avec succès');
        } catch (error) {
            console.error('Erreur lors de la modification du menu:', error);
            res.redirect('/admin/menus?error=Erreur lors de la modification du menu');
        }
    },

    // Admin: Supprimer un menu
    deleteMenu: async (req, res) => {
        try {
            const { id } = req.params;

            await prisma.menu.delete({
                where: { id: parseInt(id) }
            });

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Erreur lors de la suppression du menu:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Admin: Désactiver tous les menus
    deactivateAllMenus: async (req, res) => {
        try {
            const result = await prisma.menu.updateMany({
                where: { actif: true },
                data: { actif: false }
            });

            console.log(`✅ ${result.count} menus désactivés`);
            res.status(200).json({ success: true, count: result.count });
        } catch (error) {
            console.error('Erreur lors de la désactivation des menus:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = menuController;

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const menuController = {
    // Afficher les menus de la semaine (page publique) - OPTIMISÉ
    getMenus: async (req, res) => {
        try {
            console.log('🍽️ Récupération des menus restaurant');
            const startTime = Date.now();

            // Récupération optimisée - récupérer TOUS les menus actifs
            const menusActifs = await prisma.menu.findMany({
                where: {
                    actif: true
                    // Suppression du filtre date strict qui bloquait l'affichage
                },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { dateDebut: 'asc' },
                take: 10 // Limiter à 10 menus max pour performance
            });

            console.log(`📋 ${menusActifs.length} menus actifs trouvés`);

            // Validation et nettoyage des données
            const menusValides = menusActifs.filter(menu => {
                const isValid = menu.titre && (menu.mediaUrl || menu.semaine);
                if (!isValid) {
                    console.warn(`⚠️ Menu invalide ignoré (ID: ${menu.id}):`, {
                        titre: menu.titre,
                        mediaUrl: menu.mediaUrl,
                        semaine: menu.semaine
                    });
                }
                return isValid;
            });

            // Tri chronologique optimisé
            let menusOrdonnes = menusValides.sort((a, b) => {
                if (!a.dateDebut && !b.dateDebut) return 0;
                if (!a.dateDebut) return 1;
                if (!b.dateDebut) return -1;
                return new Date(a.dateDebut) - new Date(b.dateDebut);
            });

            // Optimisation des URLs pour WebP si disponible
            menusOrdonnes = menusOrdonnes.map(menu => ({
                ...menu,
                mediaUrl: menu.mediaUrl ? menu.mediaUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp') : null,
                fallbackUrl: menu.mediaUrl, // Fallback si WebP indisponible
                dateDebutFormatted: menu.dateDebut ? new Date(menu.dateDebut).toLocaleDateString('fr-FR') : 'Non définie',
                dateFinFormatted: menu.dateFin ? new Date(menu.dateFin).toLocaleDateString('fr-FR') : 'Non définie'
            }));

            const processingTime = Date.now() - startTime;
            console.log(`✅ ${menusOrdonnes.length} menus valides traités en ${processingTime}ms`);
            
            // 🔍 DEBUG CRUCIAL pour diagnostic
            console.log('🎯 ENVOI AU TEMPLATE:');
            console.log(`   - Nombre de menus: ${menusOrdonnes.length}`);
            console.log(`   - Premier menu: ${menusOrdonnes.length > 0 ? menusOrdonnes[0].semaine : 'AUCUN'}`);
            console.log(`   - Variable menus sera: `, menusOrdonnes.map(m => ({ id: m.id, semaine: m.semaine })));

            res.render('pages/restauration/menus', {
                title: 'École Saint-Mathieu - Menus de la semaine',
                menus: menusOrdonnes,
                user: req.session.user,
                currentDate: new Date().toISOString().split('T')[0],
                processingTime
            });

        } catch (error) {
            console.error('❌ Erreur lors de la récupération des menus:', error);
            console.error('Stack trace:', error.stack);

            // Rendu avec gestion d'erreur gracieuse
            res.render('pages/restauration/menus', {
                title: 'École Saint-Mathieu - Menus de la semaine',
                menus: [],
                error: 'Impossible de charger les menus actuellement. Veuillez réessayer plus tard.',
                user: req.session.user,
                currentDate: new Date().toISOString().split('T')[0]
            });
        }
    },

    // Admin: Liste tous les menus
    getAdminMenus: async (req, res) => {
        try {

            // Récupérer tous les menus de la base de données
            const menus = await prisma.menu.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });


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

            const { semaine, lundi, mardi, mercredi, jeudi, vendredi, desactiverAnciens } = req.body;

            if (!semaine || semaine.trim() === '') {
                return res.redirect('/admin/menus?error=La semaine est obligatoire');
            }

            if (!req.session.user || !req.session.user.id) {
                return res.redirect('/auth/login');
            }

            // Si l'option est cochée, désactiver les anciens menus
            if (desactiverAnciens === 'on') {
                await prisma.menu.updateMany({
                    where: { actif: true },
                    data: { actif: false }
                });
            }

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

            res.status(200).json({ success: true, count: result.count });
        } catch (error) {
            console.error('Erreur lors de la désactivation des menus:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = menuController;

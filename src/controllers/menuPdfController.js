const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-poppler');

const prisma = new PrismaClient();

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/assets/documents/menus');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const uniqueName = `menu-${timestamp}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Filtre pour n'accepter que les PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});

const menuPdfController = {
    uploadMiddleware: upload.single('menuPdf'),

    getMenusManagement: async (req, res) => {
        try {
            console.log('🍽️ DEBUT - Accès à la gestion des menus PDF');
            console.log('👤 Utilisateur:', req.session.user?.email, 'Rôle:', req.session.user?.role);
            console.log('📍 Tentative de rendu du template...');

            // Récupérer tous les menus
            const menus = await prisma.menu.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                },
                orderBy: { dateDebut: 'desc' }
            });

            console.log('📝 Menus trouvés:', menus.length);
            console.log('🎭 Template path: pages/menus/pdf-management-simple');

            res.render('pages/menus/pdf-management-simple', {
                title: 'Gestion des Menus PDF',
                menus: menus,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });

            console.log('✅ Template rendu avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des menus:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des menus'
            });
        }
    },

    // Créer un nouveau menu avec PDF
    createMenu: async (req, res) => {
        try {
            console.log('🍽️ Création d\'un nouveau menu PDF');
            console.log('📝 Données reçues:', req.body);
            console.log('📁 Fichier reçu:', req.file);

            const { actif } = req.body;

            // Vérifications
            if (!req.file) {
                return res.redirect('/admin/menus-pdf?error=Le fichier PDF est obligatoire');
            }

            if (!req.session.user || !req.session.user.id) {
                return res.redirect('/login');
            }

            // Si ce menu est actif, désactiver les autres
            if (actif === 'on') {
                console.log('🔄 Désactivation des anciens menus actifs...');
                await prisma.menu.updateMany({
                    where: { actif: true },
                    data: { actif: false, statut: 'ARCHIVE' }
                });
            }

            // Générer des dates automatiques (semaine courante)
            const today = new Date();
            const monday = new Date(today);
            monday.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4); // Vendredi de cette semaine

            // Générer un nom automatique basé sur le nom du fichier
            const nomMenu = req.file.originalname.replace('.pdf', '');

            // Convertir le PDF en images
            console.log('🖼️ Conversion du PDF en images...');
            const pdfPath = path.join(__dirname, '../../public/assets/documents/menus', req.file.filename);
            const imageDir = path.join(__dirname, '../../public/assets/images/menus');

            // Créer le dossier d'images s'il n'existe pas
            if (!fs.existsSync(imageDir)) {
                fs.mkdirSync(imageDir, { recursive: true });
            }

            const options = {
                format: 'jpeg',
                out_dir: imageDir,
                out_prefix: path.parse(req.file.filename).name,
                page: null // toutes les pages
            };

            let imageUrls = [];
            try {
                const pages = await pdf.convert(pdfPath, options);
                console.log('📸 Pages converties:', pages);

                // Générer les URLs des images
                pages.forEach((page, index) => {
                    const imageName = `${path.parse(req.file.filename).name}-${index + 1}.jpg`;
                    imageUrls.push(`/assets/images/menus/${imageName}`);
                });
            } catch (conversionError) {
                console.warn('⚠️ Échec de la conversion PDF en images:', conversionError);
                // On continue sans les images si la conversion échoue
            }

            // Créer le nouveau menu
            const nouveauMenu = await prisma.menu.create({
                data: {
                    semaine: nomMenu,
                    dateDebut: monday,
                    dateFin: friday,
                    pdfUrl: `/assets/documents/menus/${req.file.filename}`,
                    pdfFilename: req.file.originalname,
                    imageUrls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
                    actif: actif === 'on',
                    statut: actif === 'on' ? 'ACTIF' : 'BROUILLON',
                    auteurId: req.session.user.id
                }
            });

            console.log('🎉 Menu PDF créé avec succès:', nouveauMenu.id);
            res.redirect('/admin/menus-pdf?success=Menu créé avec succès');

        } catch (error) {
            console.error('❌ Erreur lors de la création du menu:', error);

            // Supprimer le fichier uploadé en cas d'erreur
            if (req.file) {
                const filePath = path.join(__dirname, '../../public/assets/documents/menus', req.file.filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Erreur lors de la suppression du fichier:', err);
                });
            }

            res.redirect('/admin/menus-pdf?error=Erreur lors de la création du menu');
        }
    },

    // Basculer l'état actif/inactif d'un menu
    toggleMenu: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`🔄 Basculer l'état du menu ${id}`);

            // Récupérer le menu actuel
            const menu = await prisma.menu.findUnique({
                where: { id: parseInt(id) }
            });

            if (!menu) {
                return res.redirect('/admin/menus-pdf?error=Menu non trouvé');
            }

            // Si on active ce menu, désactiver les autres
            if (!menu.actif) {
                await prisma.menu.updateMany({
                    where: {
                        id: { not: parseInt(id) },
                        actif: true
                    },
                    data: { actif: false, statut: 'PLANIFIE' }
                });
            }

            // Basculer l'état du menu
            await prisma.menu.update({
                where: { id: parseInt(id) },
                data: {
                    actif: !menu.actif,
                    statut: !menu.actif ? 'ACTIF' : 'PLANIFIE'
                }
            });

            const message = !menu.actif ? 'Menu activé avec succès' : 'Menu désactivé avec succès';
            res.redirect(`/admin/menus-pdf?success=${encodeURIComponent(message)}`);

        } catch (error) {
            console.error('❌ Erreur lors du basculement:', error);
            res.redirect('/admin/menus-pdf?error=Erreur lors de la modification du menu');
        }
    },

    // Modifier le statut d'un menu
    updateMenuStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { statut, actif } = req.body;

            console.log(`🔄 Mise à jour du statut du menu ${id}:`, { statut, actif });

            // Si on active ce menu, désactiver les autres
            if (actif === 'true' || statut === 'ACTIF') {
                await prisma.menu.updateMany({
                    where: {
                        id: { not: parseInt(id) },
                        actif: true
                    },
                    data: { actif: false, statut: 'PLANIFIE' }
                });
            }

            const menuMisAJour = await prisma.menu.update({
                where: { id: parseInt(id) },
                data: {
                    statut: statut,
                    actif: statut === 'ACTIF'
                }
            });

            res.json({ success: true, menu: menuMisAJour });

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du statut:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Supprimer un menu
    deleteMenu: async (req, res) => {
        try {
            const { id } = req.params;

            // Récupérer le menu pour supprimer le fichier PDF
            const menu = await prisma.menu.findUnique({
                where: { id: parseInt(id) }
            });

            if (!menu) {
                return res.status(404).json({ success: false, error: 'Menu non trouvé' });
            }

            // Supprimer le fichier PDF
            if (menu.pdfUrl) {
                const filename = path.basename(menu.pdfUrl);
                const filePath = path.join(__dirname, '../../public/assets/documents/menus', filename);

                fs.unlink(filePath, (err) => {
                    if (err) console.error('Erreur lors de la suppression du fichier PDF:', err);
                    else console.log('📁 Fichier PDF supprimé:', filename);
                });
            }

            // Supprimer le menu de la base de données
            await prisma.menu.delete({
                where: { id: parseInt(id) }
            });

            console.log('🗑️ Menu supprimé avec succès:', id);
            res.json({ success: true });

        } catch (error) {
            console.error('❌ Erreur lors de la suppression du menu:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Afficher les menus actifs (page publique)
    getPublicMenus: async (req, res) => {
        try {
            const menuActif = await prisma.menu.findFirst({
                where: {
                    actif: true,
                    statut: 'ACTIF'
                },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { dateDebut: 'desc' }
            });

            res.render('pages/restauration/menus-pdf', {
                title: 'École Saint-Mathieu - Menu de la semaine',
                menu: menuActif
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du menu actif:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération du menu'
            });
        }
    },

    // Activer un menu (désactive automatiquement les autres)
    activateMenu: async (req, res) => {
        try {
            const { id } = req.params;

            // Désactiver tous les autres menus
            await prisma.menu.updateMany({
                where: {
                    id: { not: parseInt(id) }
                },
                data: {
                    actif: false,
                    statut: 'PLANIFIE'
                }
            });

            // Activer le menu sélectionné
            const menuActive = await prisma.menu.update({
                where: { id: parseInt(id) },
                data: {
                    actif: true,
                    statut: 'ACTIF'
                }
            });

            console.log('✅ Menu activé:', menuActive.semaine);
            res.json({ success: true, menu: menuActive });

        } catch (error) {
            console.error('❌ Erreur lors de l\'activation du menu:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = menuPdfController;

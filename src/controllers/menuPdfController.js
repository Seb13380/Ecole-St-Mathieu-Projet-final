const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fromPath } = require('pdf2pic');

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

            const menus = await prisma.menu.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                },
                orderBy: { dateDebut: 'desc' }
            });


            res.render('pages/menus/pdf-management-simple', {
                title: 'Gestion des Menus PDF',
                menus: menus,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });

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

            const { actif, dateDebut, dateFin, semaine } = req.body;

            // Vérifications
            if (!req.file) {
                return res.redirect('/admin/menus-pdf?error=Le fichier PDF est obligatoire');
            }

            if (!dateDebut || !dateFin) {
                return res.redirect('/admin/menus-pdf?error=Les dates de début et fin sont obligatoires');
            }

            if (!req.session.user || !req.session.user.id) {
                return res.redirect('/auth/login');
            }

            // Si ce menu est actif, désactiver les autres
            if (actif === 'on') {
                // Note: On permet maintenant plusieurs menus actifs simultanément
            }

            // Utiliser les dates saisies par l'utilisateur, en s'assurant qu'elles sont correctement formatées
            const monday = new Date(dateDebut + 'T12:00:00.000Z'); // Ajouter l'heure pour éviter les problèmes de fuseau horaire
            const friday = new Date(dateFin + 'T12:00:00.000Z');

            // Fonction pour formater une date YYYY-MM-DD en DD/MM/YYYY
            const formatDateToFrench = (dateStr) => {
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            };

            // Utiliser le titre saisi ou générer un nom automatique avec dates en format français
            const nomMenu = semaine || `Menu du ${formatDateToFrench(dateDebut)} au ${formatDateToFrench(dateFin)}`;

            // Convertir le PDF en images
            const pdfPath = path.join(__dirname, '../../public/assets/documents/menus', req.file.filename);
            const imageDir = path.join(__dirname, '../../public/assets/images/menus');

            // Créer le dossier d'images s'il n'existe pas
            if (!fs.existsSync(imageDir)) {
                fs.mkdirSync(imageDir, { recursive: true });
            }

            const baseFilename = path.parse(req.file.filename).name;

            let imageUrls = [];
            try {
                // Configuration pour pdf2pic
                const options = {
                    density: 100,           // Résolution de l'image
                    saveFilename: baseFilename,
                    savePath: imageDir,
                    format: "jpeg",         // Format de sortie
                    width: "100%",            // Largeur de l'image
                    height: "100%"            // Hauteur de l'image
                };

                // Convertir le PDF en images
                const convertedPages = await fromPath(pdfPath, options).bulk(-1, true);

                // Générer les URLs des images
                convertedPages.forEach((page, index) => {
                    const imageName = `${baseFilename}.${index + 1}.jpeg`;
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

            // Récupérer le menu actuel
            const menu = await prisma.menu.findUnique({
                where: { id: parseInt(id) }
            });

            if (!menu) {
                return res.redirect('/admin/menus-pdf?error=Menu non trouvé');
            }

            // Si on active ce menu, ne plus désactiver les autres
            // Note: Permet maintenant d'avoir plusieurs menus actifs simultanément
            if (!menu.actif) {
                // Les autres menus actifs restent actifs
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


            // Si on active ce menu, ne plus désactiver les autres automatiquement
            if (actif === 'true' || statut === 'ACTIF') {
                // Note: Permet maintenant d'avoir plusieurs menus actifs simultanément
            }

            const menuMisAJour = await prisma.menu.update({
                where: { id: parseInt(id) },
                data: {
                    statut: statut,
                    actif: statut === 'ACTIF'
                }
            });

            const message = statut === 'ACTIF' ? 'Menu activé avec succès' : 'Menu désactivé avec succès';
            res.redirect(`/admin/menus-pdf?success=${encodeURIComponent(message)}`);

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du statut:', error);
            res.redirect('/admin/menus-pdf?error=Erreur lors de la modification du menu');
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
                return res.redirect('/admin/menus-pdf?error=Menu non trouvé');
            }

            // Supprimer le fichier PDF
            if (menu.pdfUrl) {
                const filename = path.basename(menu.pdfUrl);
                const filePath = path.join(__dirname, '../../public/assets/documents/menus', filename);

                fs.unlink(filePath, (err) => {
                    if (err) console.error('Erreur lors de la suppression du fichier PDF:', err);
                });
            }

            // Supprimer le menu de la base de données
            await prisma.menu.delete({
                where: { id: parseInt(id) }
            });

            res.redirect('/admin/menus-pdf?success=Menu supprimé avec succès');

        } catch (error) {
            console.error('❌ Erreur lors de la suppression du menu:', error);
            res.redirect('/admin/menus-pdf?error=Erreur lors de la suppression du menu');
        }
    },

    // Afficher les menus actifs (page publique)
    getPublicMenus: async (req, res) => {
        try {
            // Récupérer tous les menus disponibles, triés par date
            const todosLesMenus = await prisma.menu.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { dateDebut: 'desc' }
            });

            // Récupérer la semaine demandée via paramètre de requête
            const semaineRequise = req.query.semaine;
            let menuSelectionne = null;

            if (semaineRequise) {
                // Chercher le menu pour la semaine spécifique
                menuSelectionne = todosLesMenus.find(menu => {
                    const dateDebut = new Date(menu.dateDebut);
                    const semaineFormat = dateDebut.toISOString().split('T')[0];
                    return semaineFormat === semaineRequise;
                });
            }

            // Si aucun menu spécifique demandé ou trouvé, prendre le menu actif ou le plus récent
            if (!menuSelectionne) {
                menuSelectionne = todosLesMenus.find(menu => menu.actif) || todosLesMenus[0];
            }

            // Préparer les données pour la navigation
            const today = new Date();
            const menusAvecNavigation = todosLesMenus.map(menu => {
                const dateDebut = new Date(menu.dateDebut);
                const dateFin = new Date(menu.dateFin);
                const semaineId = dateDebut.toISOString().split('T')[0];

                // Déterminer le statut temporel
                let statutTemporel = 'future';
                if (today >= dateDebut && today <= dateFin) {
                    statutTemporel = 'presente';
                } else if (today > dateFin) {
                    statutTemporel = 'passee';
                }

                return {
                    ...menu,
                    semaineId,
                    statutTemporel,
                    nomSemaine: `${dateDebut.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} au ${dateFin.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                };
            });

            // Trouver les menus précédent et suivant
            let menuPrecedent = null;
            let menuSuivant = null;

            if (menuSelectionne) {
                const indexActuel = menusAvecNavigation.findIndex(m => m.id === menuSelectionne.id);
                if (indexActuel > 0) {
                    menuSuivant = menusAvecNavigation[indexActuel - 1]; // Plus récent
                }
                if (indexActuel < menusAvecNavigation.length - 1) {
                    menuPrecedent = menusAvecNavigation[indexActuel + 1]; // Plus ancien
                }
            }

            res.render('pages/restauration/menus-pdf', {
                title: 'École Saint-Mathieu - Menu de la semaine',
                menu: menuSelectionne,
                todosLesMenus: menusAvecNavigation,
                menuPrecedent,
                menuSuivant,
                semaineActuelle: menuSelectionne ? menusAvecNavigation.find(m => m.id === menuSelectionne.id)?.semaineId : null
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération du menu actif:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération du menu'
            });
        }
    },

    // Activer un menu (permet maintenant plusieurs menus actifs)
    activateMenu: async (req, res) => {
        try {
            const { id } = req.params;

            // Note: On ne désactive plus automatiquement les autres menus
            // Cela permet d'avoir plusieurs menus actifs simultanément

            // Activer le menu sélectionné
            const menuActive = await prisma.menu.update({
                where: { id: parseInt(id) },
                data: {
                    actif: true,
                    statut: 'ACTIF'
                }
            });

            res.redirect('/admin/menus-pdf?success=Menu activé avec succès');

        } catch (error) {
            console.error('❌ Erreur lors de l\'activation du menu:', error);
            res.redirect('/admin/menus-pdf?error=Erreur lors de l\'activation du menu');
        }
    }
};

module.exports = menuPdfController;

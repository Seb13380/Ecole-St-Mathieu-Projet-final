const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const menuController = require('../controllers/menuController');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getUsersManagement);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/classes', adminController.getClassesManagement);
router.post('/classes', adminController.createClasse);

router.get('/students', adminController.getStudentsManagement);
router.post('/students', adminController.createStudent);

// Routes pour la gestion des menus
router.get('/menus', menuController.getAdminMenus);
router.get('/menus/create', menuController.getCreateMenu);
router.post('/menus/create', menuController.postCreateMenu);
router.get('/menus/:id/edit', menuController.getEditMenu);
router.post('/menus/:id/edit', menuController.postEditMenu);
router.delete('/menus/:id', menuController.deleteMenu);
router.post('/menus/deactivate-all', menuController.deactivateAllMenus);

module.exports = router;

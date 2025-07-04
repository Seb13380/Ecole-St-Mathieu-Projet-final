const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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

module.exports = router;

const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();

router.get('/', loginController.showLogin);

router.post('/', loginController.login);

router.post('/logout', loginController.logout);

router.get('/logout', loginController.logout);

module.exports = router;

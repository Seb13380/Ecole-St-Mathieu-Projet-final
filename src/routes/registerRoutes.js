const express = require('express');
const registerController = require('../controllers/registerController');

const router = express.Router();

router.get('/', registerController.showRegisterForm);

router.post('/', registerController.processRegister);

module.exports = router;

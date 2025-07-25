const express = require('express');
const router = express.Router();
const parentInvitationController = require('../controllers/parentInvitationController');
const { requireDirection } = require('../middleware/auth');

router.get('/manage', requireDirection, parentInvitationController.showInvitationManagement);
router.post('/create', requireDirection, parentInvitationController.createAndSendInvitation);
router.delete('/:id', requireDirection, parentInvitationController.deleteInvitation);
router.post('/:id/resend', requireDirection, parentInvitationController.resendInvitation);

module.exports = router;

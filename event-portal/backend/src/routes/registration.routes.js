const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const authMiddleware = require('../middleware/auth');
router.post('/:eventId/register', authMiddleware, registrationController.registerForEvent);
router.get('/my-registrations', authMiddleware, registrationController.getMyRegistrations);
router.get('/event/:eventId', authMiddleware, registrationController.getEventRegistrations);
router.get('/:qrToken', authMiddleware, registrationController.getRegistrationByToken);
module.exports = router;
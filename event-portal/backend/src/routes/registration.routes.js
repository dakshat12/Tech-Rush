const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  getRegistrationByToken,
} = require('../controllers/registration.controller');
const authMiddleware = require('../middleware/auth');

router.post('/events/:id/register', authMiddleware, registerForEvent);
router.get('/registrations/me', authMiddleware, getMyRegistrations);
router.get('/registrations/event/:eventId', authMiddleware, getEventRegistrations);
router.get('/registrations/:qrToken', authMiddleware, getRegistrationByToken);

module.exports = router;
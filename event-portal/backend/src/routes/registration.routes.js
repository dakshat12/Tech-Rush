const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations } = require('../controllers/registration.controller');
const authMiddleware = require('../middleware/auth');

router.post('/events/:id/register', authMiddleware, registerForEvent);
router.get('/registrations/me', authMiddleware, getMyRegistrations);

module.exports = router;

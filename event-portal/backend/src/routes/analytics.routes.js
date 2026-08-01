const express = require('express');
const router = express.Router();
const { getEventAnalytics } = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/events/:id/analytics', authMiddleware, roleCheck(['ORGANIZER']), getEventAnalytics);

module.exports = router;
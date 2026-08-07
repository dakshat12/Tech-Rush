const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, getEventAnalytics } = require('../controllers/analytics.controller');

router.get('/overview', getAnalyticsOverview);
router.get('/events/:id', getEventAnalytics);

module.exports = router;

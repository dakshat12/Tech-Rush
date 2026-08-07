const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement } = require('../controllers/announcement.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', getAnnouncements);
router.post('/', authMiddleware, createAnnouncement);

module.exports = router;

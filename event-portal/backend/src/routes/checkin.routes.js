const express = require('express');
const router = express.Router();
const { checkIn } = require('../controllers/checkin.controller');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', authMiddleware, roleCheck(['VOLUNTEER', 'ORGANIZER']), checkIn);

module.exports = router;

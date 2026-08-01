const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkin.controller');
const authMiddleware = require('../middleware/auth');

router.post('/checkin', authMiddleware, checkinController.checkIn);
router.post('/checkout', authMiddleware, checkinController.checkOut);

module.exports = router;
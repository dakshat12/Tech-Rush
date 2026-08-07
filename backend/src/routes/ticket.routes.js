const express = require('express');
const router = express.Router();
const { registerForEvent, getMyTickets, getTicketById } = require('../controllers/ticket.controller');
const authMiddleware = require('../middleware/auth');

router.post('/register/:eventId', authMiddleware, registerForEvent);
router.get('/my-tickets', authMiddleware, getMyTickets);
router.get('/:id', authMiddleware, getTicketById);

module.exports = router;

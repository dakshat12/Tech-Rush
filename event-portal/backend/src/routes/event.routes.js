const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');
const { getEventAnalytics } = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', authMiddleware, getEvents);
router.get('/:id', authMiddleware, getEventById);
router.get('/:id/analytics', authMiddleware, roleCheck(['ORGANIZER']), getEventAnalytics);

router.post('/', authMiddleware, roleCheck(['ORGANIZER']), createEvent);
router.put('/:id', authMiddleware, roleCheck(['ORGANIZER']), updateEvent);
router.delete('/:id', authMiddleware, roleCheck(['ORGANIZER']), deleteEvent);

module.exports = router;

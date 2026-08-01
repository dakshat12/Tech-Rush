const express = require('express');
const router = express.Router();
const { assignVolunteer, getMyTasks, getEventVolunteers, updateTaskStatus } = require('../controllers/volunteer.controller');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/events/:id/assign', authMiddleware, roleCheck(['ORGANIZER']), assignVolunteer);
router.get('/events/:id/volunteers', authMiddleware, roleCheck(['ORGANIZER']), getEventVolunteers);
router.get('/volunteers/me/tasks', authMiddleware, roleCheck(['VOLUNTEER']), getMyTasks);
router.put('/tasks/:id/status', authMiddleware, roleCheck(['VOLUNTEER']), updateTaskStatus);

module.exports = router;

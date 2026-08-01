const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.controller');
const authMiddleware = require('../middleware/auth');

router.post('/:eventId/assign', authMiddleware, volunteerController.assignVolunteer);
router.get('/my-tasks', authMiddleware, volunteerController.getMyTasks);
router.get('/event/:eventId', authMiddleware, volunteerController.getEventVolunteers);
router.patch('/:id/status', authMiddleware, volunteerController.updateTaskStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
} = require('../controllers/volunteer.controller');
const authMiddleware = require('../middleware/auth');

router.get('/volunteers/leaderboard', authMiddleware, getLeaderboard);
router.get('/tasks', authMiddleware, getTasks);
router.post('/tasks', authMiddleware, createTask);
router.put('/tasks/:id', authMiddleware, updateTask);
router.delete('/tasks/:id', authMiddleware, deleteTask);
router.get('/volunteers/me/tasks', authMiddleware, getMyTasks);

module.exports = router;

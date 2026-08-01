const prisma = require('../config/db');

// POST /api/events/:id/assign (organizer only)
// body: { volunteerId, taskDesc }
const assignVolunteer = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { volunteerId, taskDesc } = req.body;

    if (!volunteerId || !taskDesc) {
      return res.status(400).json({ error: 'volunteerId and taskDesc are required' });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only assign volunteers to events you created' });
    }

    const volunteer = await prisma.user.findUnique({ where: { id: volunteerId } });
    if (!volunteer || volunteer.role !== 'VOLUNTEER') {
      return res.status(400).json({ error: 'Specified user is not a valid volunteer' });
    }

    const assignment = await prisma.volunteerAssignment.create({
      data: {
        eventId,
        volunteerId,
        taskDesc,
      },
    });

    res.status(201).json({ message: 'Volunteer assigned successfully', assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign volunteer' });
  }
};

// GET /api/volunteers/me/tasks (volunteer's own tasks)
const getMyTasks = async (req, res) => {
  try {
    const tasks = await prisma.volunteerAssignment.findMany({
      where: { volunteerId: req.user.id },
      include: { event: true },
      orderBy: { assignedAt: 'desc' },
    });

    res.status(200).json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// PUT /api/tasks/:id/status (volunteer updates their own task)
// body: { status: "pending" | "in_progress" | "done" }
const updateTaskStatus = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'done'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'status must be one of: pending, in_progress, done' });
    }

    const task = await prisma.volunteerAssignment.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.volunteerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own tasks' });
    }

    const updatedTask = await prisma.volunteerAssignment.update({
      where: { id: taskId },
      data: { status },
    });

    res.status(200).json({ message: 'Task status updated', task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

module.exports = { assignVolunteer, getMyTasks, updateTaskStatus };

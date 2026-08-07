const prisma = require('../config/db');

// POST /api/events/:id/assign (organizer only, must own the event)
// body: { volunteerEmail, taskDesc }
const assignVolunteer = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { volunteerEmail, taskDesc } = req.body;

    if (!volunteerEmail || !taskDesc) {
      return res.status(400).json({ error: 'volunteerEmail and taskDesc are required' });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only assign volunteers to events you created' });
    }

    const volunteer = await prisma.user.findUnique({ where: { email: volunteerEmail } });
    if (!volunteer || volunteer.role !== 'VOLUNTEER') {
      return res.status(400).json({ error: 'No volunteer found with that email' });
    }

    // Prevent duplicate assignment of the same volunteer to the same event
    const existing = await prisma.volunteerAssignment.findFirst({
      where: { eventId, volunteerId: volunteer.id },
    });
    if (existing) {
      return res.status(409).json({ error: 'This volunteer is already assigned to this event' });
    }

    const assignment = await prisma.volunteerAssignment.create({
      data: { eventId, volunteerId: volunteer.id, taskDesc, status: 'pending' },
      include: { volunteer: { select: { id: true, name: true, email: true } } },
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

// GET /api/events/:id/volunteers (organizer only, must own the event)
const getEventVolunteers = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only view volunteers for events you created' });
    }
    const assignments = await prisma.volunteerAssignment.findMany({
      where: { eventId },
      include: { volunteer: { select: { id: true, name: true, email: true } } },
    });
    res.status(200).json({ assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event volunteers' });
  }
};

// PUT /api/tasks/:id/status (volunteer updates their own task only)
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

module.exports = { assignVolunteer, getMyTasks, getEventVolunteers, updateTaskStatus };

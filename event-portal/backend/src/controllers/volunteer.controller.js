const prisma = require('../config/db');

exports.assignVolunteer = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { volunteerId, taskDesc } = req.body;

    const assignment = await prisma.volunteerAssignment.create({
      data: { eventId, volunteerId, taskDesc, status: 'pending' }
    });

    res.status(201).json({ message: 'Volunteer assigned', assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const tasks = await prisma.volunteerAssignment.findMany({
      where: { volunteerId },
      include: { event: true }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventVolunteers = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const assignments = await prisma.volunteerAssignment.findMany({
      where: { eventId },
      include: { volunteer: true }
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const assignment = await prisma.volunteerAssignment.update({
      where: { id },
      data: { status }
    });
    res.json({ message: 'Task updated', assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
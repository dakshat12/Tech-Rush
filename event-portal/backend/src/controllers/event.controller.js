const prisma = require('../config/db');

// POST /api/events (organizer only)
const createEvent = async (req, res) => {
  try {
    const { title, description, venue, startTime, endTime } = req.body;

    if (!title || !description || !venue || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        venue,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        organizerId: req.user.id,
      },
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startTime: 'asc' },
      include: { organizer: { select: { id: true, name: true } } },
    });
    res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { organizer: { select: { id: true, name: true } } },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// PUT /api/events/:id (organizer only, must own the event)
const updateEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit events you created' });
    }

    const { title, description, venue, startTime, endTime, status } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(venue && { venue }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(status && { status }),
      },
    });

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// DELETE /api/events/:id (organizer only, must own the event)
const deleteEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete events you created' });
    }

    await prisma.event.delete({ where: { id: eventId } });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
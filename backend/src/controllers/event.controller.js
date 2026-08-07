const prisma = require('../config/db');

// POST /api/events (organizer only)
const createEvent = async (req, res) => {
  try {
    const {
      title, description, venue, location, category, imageUrl,
      capacity, price, trending, tags, color, startTime, endTime
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        venue: venue || location || 'Main Hall',
        location: location || venue || 'San Francisco, CA',
        category: category || 'Tech',
        imageUrl: imageUrl || 'photo-1540575467063-178a50c2df87',
        capacity: capacity ? parseInt(capacity) : 500,
        price: price || 'Free',
        trending: Boolean(trending),
        tags: Array.isArray(tags) ? tags : ['Event'],
        color: color || '#7c3aed',
        startTime: startTime ? new Date(startTime) : new Date(Date.now() + 86400000),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 172800000),
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
    const { category, search, trending } = req.query;

    const where = {};
    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (trending === 'true') {
      where.trending = true;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        _count: { select: { registrations: true } },
      },
    });

    // Format fields for frontend compatibility
    const formattedEvents = events.map(e => ({
      ...e,
      attendees: e._count.registrations,
      date: new Date(e.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: e.imageUrl || 'photo-1540575467063-178a50c2df87',
    }));

    res.status(200).json({ events: formattedEvents });
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
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        _count: { select: { registrations: true, assignments: true } },
        announcements: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const formattedEvent = {
      ...event,
      attendees: event._count.registrations,
      date: new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image: event.imageUrl || 'photo-1540575467063-178a50c2df87',
    };

    res.status(200).json({ event: formattedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// PUT /api/events/:id (organizer only)
const updateEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== req.user.id && req.user.role !== 'ORGANIZER') {
      return res.status(403).json({ error: 'You can only edit events you created' });
    }

    const {
      title, description, venue, location, category, imageUrl,
      capacity, price, trending, tags, color, status, startTime, endTime
    } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(venue && { venue }),
        ...(location && { location }),
        ...(category && { category }),
        ...(imageUrl && { imageUrl }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(price && { price }),
        ...(trending !== undefined && { trending: Boolean(trending) }),
        ...(tags && { tags }),
        ...(color && { color }),
        ...(status && { status }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
      },
    });

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== req.user.id && req.user.role !== 'ORGANIZER') {
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
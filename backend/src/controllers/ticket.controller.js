const prisma = require('../config/db');

// POST /api/tickets/register/:eventId
const registerForEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existing = await prisma.registration.findFirst({
      where: { eventId, userId },
    });

    if (existing) {
      return res.status(200).json({ message: 'Already registered for this event', ticket: existing });
    }

    const qrToken = `TICKET-${event.title.substring(0, 10).toUpperCase().replace(/\s+/g, '-')}-${userId}-${Date.now()}`;

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        qrToken,
        status: 'registered',
      },
      include: { event: true },
    });

    res.status(201).json({ message: 'Registration successful', ticket: registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// GET /api/tickets/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: { organizer: { select: { name: true, email: true } } },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    res.status(200).json({ tickets: registrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// GET /api/tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = await prisma.registration.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

module.exports = { registerForEvent, getMyTickets, getTicketById };

const crypto = require('crypto');
const QRCode = require('qrcode');
const prisma = require('../config/db');

// POST /api/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existing = await prisma.registration.findFirst({
      where: { eventId, userId },
    });
    if (existing) {
      return res.status(409).json({ error: 'You are already registered for this event' });
    }

    const qrToken = crypto.randomUUID();

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        qrToken,
      },
      include: {
        event: { select: { id: true, title: true, startTime: true, venue: true } },
      },
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrToken);

    res.status(201).json({
      message: 'Registered successfully',
      registration,
      qrCode: qrCodeDataUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

// GET /api/registrations/me
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: {
        event: { select: { id: true, title: true, startTime: true, endTime: true, venue: true, status: true } },
      },
      orderBy: { registeredAt: 'desc' },
    });

    res.status(200).json({ registrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.organizerId !== req.user.id && req.user.role !== 'ORGANIZER') {
      return res.status(403).json({ error: 'Not authorized to view event registrations' });
    }
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { registeredAt: 'asc' },
    });
    res.json({ registrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event registrations' });
  }
};

const getRegistrationByToken = async (req, res) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { qrToken: req.params.qrToken },
      include: {
        event: { select: { id: true, title: true, startTime: true, venue: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    res.json({ registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  getRegistrationByToken,
};
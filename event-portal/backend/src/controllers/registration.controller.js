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
      include: { event: true },
      orderBy: { registeredAt: 'desc' },
    });

    res.status(200).json({ registrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

module.exports = { registerForEvent, getMyRegistrations };

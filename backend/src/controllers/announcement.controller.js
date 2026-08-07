const prisma = require('../config/db');

// GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const formatted = announcements.map(a => ({
      id: a.id,
      title: a.title,
      body: a.body,
      time: a.time || 'Recently',
      urgent: a.urgent,
    }));

    res.status(200).json({ announcements: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, body, urgent, eventId } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        urgent: Boolean(urgent),
        time: 'Just now',
        eventId: eventId ? parseInt(eventId) : null,
      },
    });

    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

module.exports = { getAnnouncements, createAnnouncement };

const prisma = require('../config/db');

// GET /api/events/:id/analytics
const getEventAnalytics = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const totalRegistered = await prisma.registration.count({ where: { eventId } });
    const checkedIn = await prisma.registration.count({ where: { eventId, status: 'checked_in' } });
    const checkedOut = await prisma.registration.count({ where: { eventId, status: 'checked_out' } });
    const noShows = await prisma.registration.count({ where: { eventId, status: 'registered' } });

    res.status(200).json({
      eventId,
      eventTitle: event.title,
      totalRegistered,
      currentlyCheckedIn: checkedIn,
      checkedOut,
      noShows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = { getEventAnalytics };

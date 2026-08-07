const prisma = require('../config/db');

// GET /api/analytics/overview
const getAnalyticsOverview = async (req, res) => {
  try {
    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.registration.count();
    const totalVolunteers = await prisma.user.count({ where: { role: 'VOLUNTEER' } });
    const totalAttendees = await prisma.user.count({ where: { role: 'ATTENDEE' } });

    // Category breakdown
    const events = await prisma.event.findMany({ select: { category: true } });
    const categoryCounts = {};
    events.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const categoryColors = {
      Tech: '#7c3aed',
      Design: '#06b6d4',
      Social: '#10b981',
      Business: '#f59e0b',
      Volunteer: '#ef4444',
    };

    const categoryData = Object.keys(categoryCounts).map(name => ({
      name,
      value: categoryCounts[name],
      color: categoryColors[name] || '#8b5cf6',
    }));

    // Monthly trends (mocked/computed for smooth Recharts visualization)
    const analyticsData = [
      { month: 'Mar', registrations: 320, volunteers: 45, revenue: 12400 },
      { month: 'Apr', registrations: 480, volunteers: 62, revenue: 18200 },
      { month: 'May', registrations: 590, volunteers: 78, revenue: 22100 },
      { month: 'Jun', registrations: 720, volunteers: 95, revenue: 31500 },
      { month: 'Jul', registrations: 960, volunteers: 112, revenue: 41200 },
      { month: 'Aug', registrations: totalRegistrations > 0 ? 1240 + totalRegistrations : 1240, volunteers: 134 + totalVolunteers, revenue: 56800 },
    ];

    res.status(200).json({
      overview: {
        totalEvents,
        totalRegistrations,
        totalVolunteers,
        totalAttendees,
      },
      categoryData,
      analyticsData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
};

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
    res.status(500).json({ error: 'Failed to fetch event analytics' });
  }
};

module.exports = { getAnalyticsOverview, getEventAnalytics };

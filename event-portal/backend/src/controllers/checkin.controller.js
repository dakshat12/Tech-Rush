const prisma = require('../config/db');

// POST /api/checkin
// body: { qrToken, type: "check_in" | "check_out" }
const checkIn = async (req, res) => {
  try {
    const { qrToken, type } = req.body;

    if (!qrToken || !type) {
      return res.status(400).json({ error: 'qrToken and type are required' });
    }

    if (type !== 'check_in' && type !== 'check_out') {
      return res.status(400).json({ error: 'type must be "check_in" or "check_out"' });
    }

    const registration = await prisma.registration.findUnique({
      where: { qrToken },
      include: { event: true, user: true },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Invalid QR code — registration not found' });
    }

    if (type === 'check_in' && registration.status === 'checked_in') {
      return res.status(409).json({ error: 'This attendee is already checked in' });
    }
    if (type === 'check_out' && registration.status !== 'checked_in') {
      return res.status(409).json({ error: 'This attendee must be checked in before checking out' });
    }

    const checkInRecord = await prisma.checkIn.create({
      data: {
        registrationId: registration.id,
        scannedById: req.user.id,
        type,
      },
    });

    const newStatus = type === 'check_in' ? 'checked_in' : 'checked_out';
    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: { status: newStatus },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`event_${registration.eventId}`).emit('attendance_update', {
        registrationId: registration.id,
        userName: registration.user.name,
        type,
        status: newStatus,
        timestamp: checkInRecord.timestamp,
      });
    }

    res.status(200).json({
      message: `${type === 'check_in' ? 'Checked in' : 'Checked out'} successfully`,
      registration: updatedRegistration,
      attendeeName: registration.user.name,
      eventTitle: registration.event.title,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process check-in' });
  }
};

module.exports = { checkIn };

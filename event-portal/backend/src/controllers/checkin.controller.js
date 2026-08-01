const prisma = require('../config/db');

exports.checkIn = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const scannedById = req.user.id;

    const registration = await prisma.registration.findUnique({
      where: { qrToken },
      include: { checkIns: true }
    });
    if (!registration) return res.status(404).json({ error: 'Invalid QR code' });

    const alreadyIn = registration.checkIns.some(c => c.type === 'check_in')
      && !registration.checkIns.some(c => c.type === 'check_out');
    if (alreadyIn) return res.status(400).json({ error: 'Already checked in' });

    await prisma.checkIn.create({
      data: { registrationId: registration.id, scannedById, type: 'check_in' }
    });

    const updated = await prisma.registration.update({
      where: { qrToken },
      data: { status: 'checked-in' }
    });

    res.json({ message: 'Checked in successfully', registration: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const scannedById = req.user.id;

    const registration = await prisma.registration.findUnique({ where: { qrToken } });
    if (!registration) return res.status(404).json({ error: 'Invalid QR code' });
    if (registration.status !== 'checked-in') {
      return res.status(400).json({ error: 'Attendee has not checked in yet' });
    }

    await prisma.checkIn.create({
      data: { registrationId: registration.id, scannedById, type: 'check_out' }
    });

    const updated = await prisma.registration.update({
      where: { qrToken },
      data: { status: 'checked-out' }
    });

    res.json({ message: 'Checked out successfully', registration: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
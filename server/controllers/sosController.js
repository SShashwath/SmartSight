const SOS = require('../models/SOS');
const User = require('../models/User');

// POST /api/sos
const triggerSOS = async (req, res) => {
  try {
    const { location } = req.body;
    const user = await User.findById(req.user._id);

    const sosAlert = await SOS.create({
      userId: req.user._id,
      location: location || user.location,
      status: 'active',
      notifiedContacts: user.trustedContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
        notifiedAt: new Date(),
      })),
    });

    // In production: send SMS/email to trusted contacts here
    console.log(`🚨 SOS triggered by ${user.name}. Notifying ${user.trustedContacts.length} contacts.`);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('sos-alert', {
        userId: req.user._id,
        userName: user.name,
        location: sosAlert.location,
        timestamp: sosAlert.timestamp,
      });
    }

    res.status(201).json({
      success: true,
      message: `SOS alert sent! ${user.trustedContacts.length} trusted contact(s) notified.`,
      sosAlert,
      contactsNotified: user.trustedContacts.length,
    });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ success: false, message: 'Error sending SOS alert' });
  }
};

// GET /api/sos/history
const getSOSHistory = async (req, res) => {
  try {
    const history = await SOS.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching SOS history' });
  }
};

module.exports = { triggerSOS, getSOSHistory };

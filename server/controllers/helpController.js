const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// POST /api/help/request
const requestHelp = async (req, res) => {
  try {
    const { message, location } = req.body;

    const helpRequest = await HelpRequest.create({
      userId: req.user._id,
      message: message || 'Needs assistance',
      location: location || req.user.location,
      status: 'pending',
    });

    await helpRequest.populate('userId', 'name email location');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('new-help-request', {
        requestId: helpRequest._id,
        user: { name: req.user.name, location: location || req.user.location },
        message: helpRequest.message,
        timestamp: helpRequest.timestamp,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Help request created successfully',
      helpRequest,
    });
  } catch (error) {
    console.error('Request help error:', error);
    res.status(500).json({ success: false, message: 'Error creating help request' });
  }
};

// POST /api/help/accept
const acceptHelp = async (req, res) => {
  try {
    const { requestId } = req.body;

    const helpRequest = await HelpRequest.findById(requestId);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: 'Help request not found' });
    }

    if (helpRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request has already been accepted' });
    }

    helpRequest.volunteerId = req.user._id;
    helpRequest.status = 'accepted';
    await helpRequest.save();

    await helpRequest.populate(['userId', 'volunteerId']);

    res.json({
      success: true,
      message: 'Help request accepted successfully',
      helpRequest,
    });
  } catch (error) {
    console.error('Accept help error:', error);
    res.status(500).json({ success: false, message: 'Error accepting help request' });
  }
};

// GET /api/help/my-requests
const getMyRequests = async (req, res) => {
  try {
    const query = req.user.role === 'volunteer'
      ? { volunteerId: req.user._id }
      : { userId: req.user._id };

    const requests = await HelpRequest.find(query)
      .populate('userId', 'name email')
      .populate('volunteerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching requests' });
  }
};

module.exports = { requestHelp, acceptHelp, getMyRequests };

const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    message: {
      type: String,
      default: 'Needs assistance',
    },
    location: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
      address: { type: String, default: 'Bengaluru, Karnataka' },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HelpRequest', helpRequestSchema);

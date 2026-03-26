const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      lat: { type: Number, default: 12.9716 },
      lng: { type: Number, default: 77.5946 },
      address: { type: String, default: 'Bengaluru, Karnataka' },
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
    notifiedContacts: [
      {
        name: String,
        phone: String,
        email: String,
        notifiedAt: { type: Date, default: Date.now },
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SOS', sosSchema);

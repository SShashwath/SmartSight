const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'volunteer'],
      default: 'user',
    },
    location: {
      type: {
        lat: { type: Number, default: 12.9716 },
        lng: { type: Number, default: 77.5946 },
        address: { type: String, default: 'Bengaluru, Karnataka' },
      },
      default: () => ({}),
    },
    trustedContacts: [
      {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true, // for volunteers
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

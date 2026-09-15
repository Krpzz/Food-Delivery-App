const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    phone: { type: String, required: true },
    // Not in the original field list, but Section 18 requires filtering/sorting
    // by cuisine, so the model needs somewhere to store it.
    cuisines: { type: [String], default: [] },
    openingTime: { type: String, default: '10:00' },
    closingTime: { type: String, default: '21:00' },
    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', city: 'text', cuisines: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);

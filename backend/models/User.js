const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    // select: false -> password is never returned by default queries.
    // Controllers must explicitly .select('+password') when they need it (e.g. login).
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['CUSTOMER', 'RESTAURANT', 'ADMIN'],
      default: 'CUSTOMER',
    },
    profileImage: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Belt-and-suspenders: even if a query somewhere forgets to exclude it,
// password never leaks through JSON serialization.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);

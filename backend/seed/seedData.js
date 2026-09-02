// Phase 1 seed: creates the one ADMIN account, since there is intentionally
// no public "become an admin" API endpoint (Section 20 - never trust the
// frontend with role). Run with: npm run seed

require('dotenv').config();

const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);

const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log(`An admin account already exists: ${existingAdmin.email}`);
      process.exit(0);
    }

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@fooddelivery.com.np';
    const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

    const admin = await User.create({
      name: 'Platform Admin',
      email,
      phone: '9800000000',
      password,
      role: 'ADMIN',
    });

    console.log('Admin account created:');
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: ${password}`);
    console.log('Log in and change this password before going anywhere near production.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

run();
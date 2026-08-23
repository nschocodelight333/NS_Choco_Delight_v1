require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const PERMANENT_ADMIN_EMAIL = 'nschocodelight333@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminChoco2026!';
const USER_PASSWORD = 'UserChoco2026!';

const DEFAULT_ACCOUNTS = [
  {
    name: 'NS Choco Delight Admin',
    email: PERMANENT_ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    phone: '9999999999',
  },
  {
    name: 'Shafiulla Shakhadar',
    email: 'skshafiullashakhadar@gmail.com',
    password: USER_PASSWORD,
    role: 'customer',
    phone: '8185920511',
  },
  {
    name: 'Sample Customer',
    email: 'customer@chocodelight.com',
    password: USER_PASSWORD,
    role: 'customer',
    phone: '9876543210',
  },
];

async function seedAdminUser() {
  // 1. Ensure all other accounts in DB except nschocodelight333@gmail.com have role 'customer'
  await User.updateMany(
    { email: { $ne: PERMANENT_ADMIN_EMAIL } },
    { $set: { role: 'customer' } }
  );

  const seeded = [];
  for (const acc of DEFAULT_ACCOUNTS) {
    let user = await User.findOne({ email: acc.email }).select('+password');
    if (user) {
      user.name = acc.name;
      user.role = acc.role;
      const isMatch = await user.comparePassword(acc.password).catch(() => false);
      if (!isMatch) {
        user.password = acc.password;
      }
      await user.save();
    } else {
      user = await User.create({
        name: acc.name,
        email: acc.email,
        password: acc.password,
        phone: acc.phone,
        role: acc.role,
      });
    }
    console.log(`👤 User ready: ${user.email} (${user.role})`);
    seeded.push(user);
  }
  return seeded[0]; // Returns permanent admin user
}

async function seedAdmin() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/choco-delight';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    await seedAdminUser();
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin seed error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedAdmin();
}

module.exports = { seedAdminUser, PERMANENT_ADMIN_EMAIL };

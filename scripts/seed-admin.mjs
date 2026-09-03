import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: true },
    phone: String,
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    const adminEmail = 'admin@nschocodelight.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.password = 'AdminPassword123!';
      await existingAdmin.save();
      console.log('🛠️ Existing admin password & role updated successfully!');
    } else {
      await User.create({
        name: 'NS Choco Admin',
        email: adminEmail,
        password: 'AdminPassword123!',
        phone: '918185920511',
        role: 'admin',
      });
      console.log('🎉 Created new Admin account successfully!');
    }

    console.log('\n--- 🔑 ADMIN CREDENTIALS ---');
    console.log('Portal URL: /admin/login');
    console.log(`Email:    ${adminEmail}`);
    console.log('Password: AdminPassword123!');
    console.log('-----------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Admin Seeding error:', err);
    process.exit(1);
  }
}

seedAdmin();

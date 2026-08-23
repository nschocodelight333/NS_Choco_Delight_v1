require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const EMAIL = process.argv[2] || process.env.PROMOTE_EMAIL || 'grandhinagasai@gmail.com';

const promoteToAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: EMAIL.toLowerCase() });

    if (!user) {
      console.log(`❌ No user found with email: ${EMAIL}`);
      console.log('👉 Please register the account first, then run this script again.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️  ${EMAIL} is already an admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`🎉 Success! ${EMAIL} has been promoted to admin.`);
    console.log(`   Name : ${user.name}`);
    console.log(`   Role : ${user.role}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

promoteToAdmin();

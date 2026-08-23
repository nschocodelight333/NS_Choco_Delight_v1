require('dotenv').config();
const mongoose = require('mongoose');
const password = process.env.MONGO_PASSWORD || 'your_password_here';
const cluster = process.env.MONGO_CLUSTER || 'cluster0.xxxxx.mongodb.net';
const usernames = ['sksha', 'admin', 'root', 'chaco', 'delight', 'chaco-delight', 'ns_chaco_delight', 'user', 'test', 'sksharma'];

async function testAuth() {
  for (const user of usernames) {
    const uri = 'mongodb+srv://' + user + ':' + password + '@' + cluster + '/choco-delight?retryWrites=true&w=majority&appName=Cluster0';
    try {
      console.log('Testing:', user);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ SUCCESS WITH USERNAME:', user);
      process.exit(0);
    } catch (e) {
      console.log('❌ Failed:', user);
    }
  }
  console.log('All guesses failed.');
  process.exit(1);
}

testAuth();

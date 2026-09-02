const dotenv = require('dotenv');
const mongoose = require('mongoose');
const dns = require('dns');

dotenv.config();
dns.setServers(['1.1.1.1', '1.0.0.1']);

async function testConnection() {
  try {
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log("✅ MongoDB CONNECTED");
    console.log("Database:", conn.connection.name);
    console.log("Host:", conn.connection.host);
    console.log("Ready state:", conn.connection.readyState);

    await mongoose.connection.db.admin().ping();

    console.log("✅ MongoDB PING SUCCESS");

    await mongoose.disconnect();

    console.log("Disconnected.");
  } catch (error) {
    console.error("❌ MongoDB CONNECTION FAILED");
    console.error(error.message);
  }
}

testConnection();
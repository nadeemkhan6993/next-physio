import mongoose from 'mongoose';
import dns from 'dns';

// Fix for DNS SRV lookup issues - Force use of Google's DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env');
}

// Decode base64 encoded MongoDB URI
const MONGODB_URI = Buffer.from(process.env.MONGODB_URI, 'base64').toString('utf-8');

let cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      cached.mongoose.promise = null;
      console.error('❌ MongoDB connection error:', error.message);
      throw error;
    });
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null;
    throw e;
  }

  return cached.mongoose.conn;
}

export default connectDB;

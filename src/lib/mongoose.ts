import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/fifa_fc_platform';

if (!MONGODB_URI) {
  throw new Error('Не указана строка подключения к MongoDB (DATABASE_URL)');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
} 
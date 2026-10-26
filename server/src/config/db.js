import mongoose from 'mongoose';

// Shared by concurrent requests in each warm serverless instance.
let connectionPromise = null;

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    throw new Error('MONGO_URI is required. Set it in server/.env before starting the server.');
  }

  try {
    if (!connectionPromise) {
      connectionPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 5,
      }).then(() => {
        console.log('MongoDB connected successfully.');
        return mongoose.connection;
      }).finally(() => {
        // Failed attempts can be retried; established connections are reused above.
        connectionPromise = null;
      });
    }
    return await connectionPromise;
  } catch {
    // Do not expose the URI or driver errors, which can contain credentials.
    throw new Error('MongoDB connection failed. Check MONGO_URI, Atlas network access, and database user permissions.');
  }
}

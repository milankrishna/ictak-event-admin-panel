import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    throw new Error('MONGO_URI is required. Set it in server/.env before starting the server.');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected successfully.');
  } catch {
    // Do not expose the URI or driver errors, which can contain credentials.
    throw new Error('MongoDB connection failed. Check MONGO_URI, Atlas network access, and database user permissions.');
  }
}

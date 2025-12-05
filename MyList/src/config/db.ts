import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mylist';

export const connectDB = async (): Promise<typeof mongoose> => {
  mongoose.set('strictQuery', true);
  return mongoose.connect(MONGO_URI);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
};

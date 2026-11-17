import mongoose from "mongoose";

/** Connect to MongoDB using Mongoose. */
export async function connectDB(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("MongoDB connected successfully.");
}

/** Close the database connection when the server stops. */
export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
}

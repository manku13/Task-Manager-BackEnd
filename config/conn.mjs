import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "taskManagerDB", // Specify your database name here
    });
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;

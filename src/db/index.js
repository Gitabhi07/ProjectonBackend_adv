import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONOGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n Mongodb connected!!! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongodb Connecrion failed ", error);
    process.exit(1);
  }
};

// Gracefully handle shutdown signals to close the MongoDB connection.
// process.on('SIGTERM', async () => {
//   console.log('Gracefully shutting down...');
//   await mongoose.disconnect();
//   process.exit(0);
// });

export default connectDB;

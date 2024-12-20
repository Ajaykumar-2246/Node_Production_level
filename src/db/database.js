import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Connect to the MongoDB database using async/await
const connectDB = async () => {
  try {
    // Try to connect to MongoDB using the connection URL and database name
    // The URL is fetched from the environment variable and database name from constants.js
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    // Log a success message once the connection is successful, and display the host name
    console.log(
      `\nMongoDB connected successfully! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    // If there is any error in connecting, log the error message
    console.error("Failed in connecting MongoDB:", error.message);

    // Exit the process with an error status (1 indicates failure)
    process.exit(1); // Exit the process with an error status
  }
};

// Export the connectDB function so it can be used in other parts of the application
export default connectDB;

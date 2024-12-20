// Load environment variables from the .env file using dotenv package
import dotenv from "dotenv"; // Importing the dotenv package to handle environment variables

// Initialize dotenv to load variables from the './env' file
dotenv.config({
  path: "./.env", // Specify the location of your .env file, which contains sensitive environment variables
});
 
// Import the database connection function and app setup from separate modules
import connectDB from "./db/database.js"; // Import the function to connect to MongoDB
import { app } from "./app.js"; // Import the Express app instance from the app.js file

// Attempt to connect to the MongoDB database and start the server upon successful connection
connectDB() // Call the connectDB function to establish a connection to the MongoDB database
  .then(() => {
    // If the database connection is successful, the server is started and listens on the specified port
    app.listen(process.env.PORT || 3000, () => {
      // Use the port from environment variables, defaulting to 8000
      console.log(`Server is running at port : ${process.env.PORT}`); // Log the port the server is running on
    });
  })
  .catch((err) => {
    // If the database connection fails, log the error message
    console.log("MongoDB connection failed !!!!", err); // Display the error message if the connection fails
  });

// Alternative approach for directly connecting to MongoDB and starting the server (currently commented out)
// This method constructs the MongoDB connection string manually and attempts to connect

//
// (async () => {  // Start an immediately invoked async function expression (IIFE) for async operations
//   try {
//     // Construct the MongoDB connection string using the environment variables for DB URL and DB name
//     const connectionString = `${process.env.DB_URL}/${DB_NAME}`;  // Create a dynamic connection string
//     await mongoose.connect(connectionString);  // Use Mongoose to connect to the database
//     console.log("Connected to the database successfully!");  // Log success message if connection is successful
//
//     // Once the database is connected, start the Express app and listen for incoming requests
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);  // Log the server's port when it starts
//     });
//   } catch (error) {
//     // Catch any errors during the database connection and log them to the console
//     console.error("Database connection error:", error);  // Log detailed error message if connection fails
//   }
// })();

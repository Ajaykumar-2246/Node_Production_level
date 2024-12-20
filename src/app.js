import express from "express"; // Import Express framework for creating the app
// Middlewares
import cors from "cors"; // Import CORS middleware to handle cross-origin requests
import cookieParser from "cookie-parser"; // Import middleware to read cookies

const app = express(); // Create an instance of the Express app

// Enable CORS (allow requests from other websites)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from the origin specified in environment variables
    credentials: true, // Allow cookies and authentication data to be included in requests
  })
);

// Middleware to parse JSON data sent in requests (with a limit of 16KB)
app.use(
  express.json({
    limit: "16kb", // Restrict the size of the JSON data to prevent large requests from overloading the server
  })
);

// Middleware to handle URL-encoded data (like from HTML forms)
app.use(express.urlencoded()); // Parse data that comes from form submissions (e.g., user inputs in forms)

// Serve static files (like images, CSS, or JavaScript) from the "public" folder
app.use(express.static("public")); // Static files will be served from the "public" directory

// Middleware to read cookies from incoming requests
app.use(cookieParser()); // Parse cookies attached to requests, so you can use them later





// routes import 
import  userRouter from './routes/user.routes.js'


// routes declaration

app.use("/api/v1/users",userRouter)






// http://localhost:3000/api/v1/users/register


// Export the app so it can be used in other files (e.g., to start the server)
export { app };

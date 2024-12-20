import { Router } from "express"; // Import Router from Express for defining routes
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js"; // Import the controller for user registration

import { upload } from "../middlewares/multer.middleware.js"; // Import the multer middleware for handling file uploads
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router(); // Create an instance of the Express router

// Route for user registration
router.route("/register").post(
  // Middleware to handle file uploads for specific fields
  upload.fields([
    {
      name: "avatar", // Field name for the user's profile picture
      maxCount: 1, // Allow only one file for this field
    },
    {
      name: "coverImage", // Field name for the user's cover image
      maxCount: 1, // Allow only one file for this field
    },
  ]),
  registerUser // Controller function to handle the rest of the registration process
);

router.route("/login").post(loginUser);

// secured routes

// Define a POST route for user logout
router.route("/logout").post(
  verifyJWT, // Middleware to verify the user's JWT (ensures the user is authenticated)
  logoutUser // Controller function that handles the logout logic
);

export default router;

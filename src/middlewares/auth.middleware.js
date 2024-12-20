// Import necessary libraries and user model
import asyncHandler from "express-async-handler"; // Handles async errors in Express
import jwt from "jsonwebtoken"; // For JSON Web Token management
import { User } from "../models/user.model.js"; // User model for database queries

// Middleware to verify JWT (JSON Web Token) and authenticate the user
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get the token from cookies or Authorization header
    const token =
      req.cookies?.accessToken || // Check for token in cookies
      req.header("Authorization")?.replace("Bearer", ""); // Check for token in Authorization header

    // If no token is provided, throw an unauthorized error
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token using the secret key
    // decondedToken contain-->details which are used while JWT sign 
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Find the user associated with the token in the database
    // Exclude sensitive fields like password and refreshToken
    // Use optional chaining (?.) to safely access _id from decodedToken
    // If decodedToken is null or undefined, it prevents an error by returning undefined instead of throwing a TypeError
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // If the user does not exist, throw an invalid token error
    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    // Attach the user object to the request for further use in the app
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});



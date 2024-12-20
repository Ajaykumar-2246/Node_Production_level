import asyncHandler from "express-async-handler"; // To handle errors in async functions
import { ApiError } from "../utils/APiError.js"; // Custom error class for handling errors
import { ApiResponse } from "../utils/ApiResponse.js"; // Custom response class for API responses

import { User } from "../models/user.model.js"; // Import User model for database operations

import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Utility to upload files to Cloudinary

// This function generates both access and refresh tokens for a user, given their user ID.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Step 1: Find the user in the database using their unique user ID.
    const user = await User.findById(userId);

    // Step 2: Generate an access token for the user.
    const accessToken = user.generateAccessToken();

    // Step 3: Generate a refresh token for the user.
    const refreshToken = user.generateRefreshToken();

    // Step 4: Store the newly created refresh token in the user's record.
    user.refreshToken = refreshToken;

    // Step 5: Save the user's record back to the database without validation checks.
    // `validateBeforeSave: false` is used to skip validation rules during save.
    await user.save({ validateBeforeSave: false });

    // Step 6: Return both the access and refresh tokens.
    return { accessToken, refreshToken };
  } catch (error) {
    // If any error occurs, throw a new error with a user-friendly message.
    // ApiError is likely a custom error class to handle API errors.
    throw new ApiError(500, "Something went wrong, please wait some time");
  }
};

// Function to register a new user
const registerUser = asyncHandler(async (req, res) => {
  // Step 1: Extract user details from the request
  const { fullname, email, username, password } = req.body;

  // Step 2: Validate that none of the fields are empty
  if (
    [fullname, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // **Alternative Validation Method: Validate each field individually**
  // if (!fullname || fullname.trim() === "") throw new ApiError(400, "Fullname is required");
  // if (!email || email.trim() === "") throw new ApiError(400, "Email is required");
  // if (!username || username.trim() === "") throw new ApiError(400, "Username is required");
  // if (!password || password.trim() === "") throw new ApiError(400, "Password is required");

  // Step 3: Check if a user with the same username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with these credentials already exists");
  }

  // Step 4: Get file paths for avatar and cover image from the request
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath=req.files?.coverImage[0]?.path;

  let coverImageLocalPath; // Variable to store the local path of the cover image

  // Check if the request contains files and specifically a cover image
  if (
    req.files && // Ensure files are present in the request
    Array.isArray(req.files.coverImage) && // Check if coverImage is an array (as expected for file uploads)
    req.files.coverImage.length > 0 // Ensure there is at least one file in the array
  ) {
    // If the above conditions are met, assign the path of the first cover image file
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Step 5: Ensure the avatar file is provided
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Step 6: Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Ensure avatar upload was successful
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar file");
  }

  // Step 7: Create a new user in the database
  const user = await User.create({
    fullname,
    avatar: avatar.url, //store avatar URL from Cloudinary
    coverImage: coverImage?.url || "", // Use cover image URL if available
    email,
    password,
    username: username.toLowerCase(), // Convert username to lowercase
  });

  // Step 8: Fetch created user's details, excluding sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // Exclude password and refreshToken
  );

  // Step 9: Ensure the user was created successfully
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Step 10: Send a success response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// function to login a user

const loginUser = asyncHandler(async (req, res) => {
  // Extract username, email, and password from the request.
  const { username, email, password } = req.body;

  // Ensure both username and email are provided.
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // Search for the user in the database by username or email.
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // If no user is found, send a "User not found" error.
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if the password is correct for the found user.
  const isPasswordValid = await user.isPasswordCorrect(password);

  // If the password is incorrect, send an "Unauthorized" error.
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate access and refresh tokens for the user.
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Get the user's information, but exclude the password and refresh token for security.
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Set cookie options to make them secure.
  const options = {
    httpOnly: true, // The cookie can't be accessed by JavaScript.
    secure: true, // The cookie is only sent over HTTPS.
  };

  // Send the response:
  // - Set the access and refresh tokens as secure cookies.
  // - Include the user info and success message in the response.
  return res
    .status(200) // Success status.
    .cookie("accessToken", accessToken, options) // Store access token in a cookie.
    .cookie("refreshToken", refreshToken, options) // Store refresh token in a cookie.
    .json({
      statusCode: 200, // Indicate success.
      data: { user: loggedInUser, accessToken, refreshToken }, // Send user info and tokens.
      message: "User logged in successfully", // Success message.
    });
});

// function for logOutUser

const logoutUser = asyncHandler(async (req, res) => {
  // Remove the refresh token from the user's record in the database
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined, // Clear the refresh token
    },
  });

  // Options for cookies to ensure they are secure and not accessible via JavaScript
  const options = {
    httpOnly: true, // Makes the cookie accessible only via HTTP(S), not JavaScript
    secure: true, // Ensures the cookie is sent over HTTPS
  };

  // Clear the accessToken and refreshToken cookies
  return res
    .status(200) // Respond with HTTP 200 (success)
    .clearCookie("accessToken", options) // Remove the accessToken cookie
    .clearCookie("refreshToken", options) // Remove the refreshToken cookie
    .json(new ApiResponse(200, {}, "User logged out")); // Send a success response
});

export { registerUser, loginUser, logoutUser }; // Export the function

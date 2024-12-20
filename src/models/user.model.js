import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Convert name to lowercase for consistency
      index: true, // Index the name field to make searching faster
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      index: true,
    },
    avatar: {
      type: String, // URL to the user's avatar image (cloudinary Url)
      required: true,
    },
    coverImage: {
      type: String, // URL to the user's cover image (cloudinary Url)
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video", // Reference to the Video model for the user's watch history
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String, // Store refresh tokens for session management
    },
  },
  { timestamps: true }
);

// Encrypt the user's password before saving it to the database
userSchema.pre("save", async function (next) {
  // Only encrypt the password if it has been modified
  if (!this.isModified("password")) return next();

  // Hash the password using bcrypt before saving
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Custom method to compare the provided password with the stored hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare using bcrypt
};

// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  // Sign a JWT token using the user's ID, email, username, and fullname
  jwt.sign(
    {
      _id: this._id, // User's unique identifier (from MongoDB)
      email: this.email, // User's email
      username: this.username, // User's username
      fullname: this.fullname, // User's full name
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token (stored in environment variables)
    {
      expiresIn: ACCESS_TOKEN_EXPIRAY, // Token expiration time (set via environment or constants)
    }
  );
};

// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
  // Sign a JWT token using the user's ID (the refresh token typically contains just the user's unique ID)
  jwt.sign(
    {
      _id: this._id, // User's unique identifier (from MongoDB)
    },
    process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the refresh token (stored in environment variables)
    {
      expiresIn: REFRESH_TOKEN_EXPIRY, // Refresh token expiration time (set via environment or constants)
    }
  );
};

export const User = mongoose.model("User", userSchema);

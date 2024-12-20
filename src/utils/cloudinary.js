import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary library for file uploads
import fs from "fs"; // Import fs module to handle file operations like deleting files

// Configure Cloudinary with the credentials (replace these with your environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary account's name
  api_key: process.env.CLOUDINARY_API_KEY,       // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your Cloudinary API secret
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Step 1: Check if the file path is valid
    if (!localFilePath) {
      console.error("Invalid file path provided"); // Log error if file path is missing
      return null; // Return null since there's no file to upload
    }

    // Step 2: Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect file type (image, video, etc.)
    });

    // Step 3: Delete the local file after a successful upload
    fs.unlinkSync(localFilePath); // Remove the file from the server to save space

    console.log("File uploaded successfully to Cloudinary:", response.url); // Log the Cloudinary URL
    return response; // Return the upload response (contains URL, ID, etc.)
  } catch (error) {
    // Step 4: Handle errors during the upload process
    console.error("Cloudinary Upload Error:", error); // Log the error

    // Try to delete the local file if it still exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null; // Return null if the upload failed
  }
};

// Export the function so it can be used in other parts of the application
export { uploadOnCloudinary };

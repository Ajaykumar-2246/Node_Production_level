import multer from "multer"; // Import multer for handling file uploads

// Configure disk storage for uploaded files
const storage = multer.diskStorage({
  // Set the destination folder where uploaded files will be saved
  destination: function (req, file, cb) {
    // Save files to the "public/temp" directory
    cb(null, "./public/temp");
  },

  // Set the filename for the uploaded file
  filename: function (req, file, cb) {
    const timestamp = Date.now(); // Unique timestamp for the filename
    // Use the original name of the uploaded file
    cb(null, timestamp + "-"+file.originalname);
  },
});

// Create an upload middleware using the defined storage configuration
export const upload = multer({ storage: storage });

// Define a custom error class that extends the built-in Error class
class ApiError extends Error {
  // Constructor to initialize the custom error
  constructor(
    statusCode, // HTTP status code (e.g., 404 for "Not Found", 500 for "Server Error")
    message = "Something went wrong", // Default error message if none is provided
    error = [], // Optional: Array to hold any specific errors (like validation errors)
    stack = "" // Optional: Stack trace for debugging (if available)
  ) {
    // Call the parent Error class with the message provided
    super(message);

    // Initialize custom properties on the error object
    this.statusCode = statusCode; // Store the HTTP status code for the error
    this.data = null; // Placeholder for additional error data (can be customized later)
    this.success = false; // Always false for errors, indicating the operation failed
    this.error = this.errors; // Store detailed error information (if any)

    // Set the stack trace for debugging
    if (stack) {
      this.stack = stack; // Use the provided stack trace if available
    } else {
      // Otherwise, capture the current stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export the custom ApiError class so it can be used elsewhere in the app
export { ApiError };

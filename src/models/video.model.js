import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // URL to the video file stored on cloud storage (e.g., Cloudinary)
      required: true,
    },
    thumbnail: {
      type: String, // URL to the thumbnail image of the video (cloudinary Url)
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number, // Number of views for the video
      default: 0, // Default value is 0 if no views
    },
    isPublished: {
      type: Boolean, // Whether the video is published or not
      default: true, // Default is true, meaning the video is published
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the user who owns the video
      ref: "User", // Reference to the User model
    },
  },
  { timestamps: true }
);

// Enable pagination for aggregate queries using mongoose-aggregate-paginate-v2
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

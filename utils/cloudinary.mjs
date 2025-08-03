import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "djvkuseph",
  api_key: process.env.CLOUDINARY_API_KEY || "363276981927165",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "WVK4N97FyIYk9StvV7ejzV0RC08",
});

export default cloudinary;

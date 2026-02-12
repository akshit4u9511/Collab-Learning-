import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      // Return null or throw an error if no file path is provided
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully on Cloudinary", response.url);
    // Delete the local file after successful upload
    fs.unlinkSync(localFilePath); 
    return response;
  } catch (error) {
    // Log the specific error from Cloudinary or the process
    console.error("Error inside Cloudinary upload function: ", error);
    // Delete the local file if the upload operation failed
    // Only attempt deletion if localFilePath was actually provided
    if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath); 
    }
    return null; // Explicitly return null on error
  }
  // The finally block was correctly removed/commented out
  // as it caused issues with duplicate deletion attempts.
  // File deletion is handled within the try and catch blocks.
};

export { uploadOnCloudinary };
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

// Configure with your Cloudinary credentials from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce_admin", // Creates a folder in your Cloudinary account
    allowedFormats: ["jpeg", "png", "jpg", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }], // Optional: auto-resize huge images
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };

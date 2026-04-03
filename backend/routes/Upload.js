const express = require("express");
const { upload } = require("../config/cloudinary");
const router = express.Router();

// 1. SINGLE IMAGE UPLOAD (Used for Logos, Thumbnails)
// Field name must be "image"
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Cloudinary automatically puts the secure URL in req.file.path
    res.status(200).json({
      success: true,
      url: req.file.path,
    });
  } catch (error) {
    console.error("Single Upload Error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

// 2. MULTIPLE IMAGES UPLOAD (Used for Product Image Galleries)
// Field name must be "images". The '10' is the maximum number of files allowed at once.
router.post("/multiple", upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    // Extract all the Cloudinary secure URLs from the uploaded files array
    const imageUrls = req.files.map((file) => file.path);

    res.status(200).json({
      success: true,
      urls: imageUrls, // Returns an array of strings: ["url1", "url2", ...]
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ message: "Bulk image upload failed" });
  }
});

module.exports = router;

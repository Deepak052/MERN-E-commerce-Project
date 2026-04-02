const express = require("express");
const { upload } = require("../config/cloudinary");
const router = express.Router();

// The "image" string must match the field name appended in the frontend FormData
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
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

module.exports = router;

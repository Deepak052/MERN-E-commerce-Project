const mongoose = require("mongoose");
const { Schema } = mongoose;

const bannerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // Cloudinary URL
    redirectUrl: { type: String, default: "/" }, // Where the banner clicks to
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Banner", bannerSchema);

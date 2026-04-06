const mongoose = require("mongoose");
const { Schema } = mongoose;

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }, // 🚨 NEW: Added Soft Delete Field
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Brand", brandSchema);

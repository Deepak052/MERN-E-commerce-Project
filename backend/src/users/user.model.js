const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // Roles & Verification
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },

    // Security
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true, // 👈 Fixes the "Invalid Date" bug on the frontend!
    versionKey: false,
  },
);

module.exports = mongoose.model("User", userSchema);

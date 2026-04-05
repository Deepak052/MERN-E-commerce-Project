const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true }, 
    password: { type: String, required: true },

    // Roles
    role: { type: String, enum: ["Admin", "SuperAdmin"], default: "Admin" },

    // Security
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Admin", adminSchema);

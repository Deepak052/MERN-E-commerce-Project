const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminOtpSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("AdminOtp", adminOtpSchema);

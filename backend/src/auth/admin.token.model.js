const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminTokenSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("AdminPasswordResetToken", adminTokenSchema);

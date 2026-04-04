const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: [Schema.Types.Mixed], required: true },
    address: { type: [Schema.Types.Mixed], required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Dispatched",
        "Out for delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentMode: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    // --- PAYMENT FIELDS ---
    paymentStatus: {
      type: String,
      enum: ["Pending", "Received", "Failed"],
      default: "Pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    total: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Order", orderSchema);

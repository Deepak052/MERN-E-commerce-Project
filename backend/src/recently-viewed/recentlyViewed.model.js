const mongoose = require("mongoose");
const { Schema } = mongoose;

const recentlyViewedSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  viewedAt: { type: Date, default: Date.now },
});

// Ensure a user doesn't have the same product logged 50 times
recentlyViewedSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);

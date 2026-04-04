const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Fixed spelling
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true, // Fixed spelling
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Wishlist", wishlistSchema);

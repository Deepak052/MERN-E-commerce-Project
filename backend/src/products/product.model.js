const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },

    // Pricing
    basePrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },

    // Relationships
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },

    // Inventory
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },

    isDealOfTheDay: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },

    isBundle: { type: Boolean, default: false },
    bundleItems: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    // Media
    thumbnail: { type: String, required: true },
    images: { type: [String], default: [] },

    attributes: [
      {
        name: { type: String },
        value: { type: String },
      },
    ],

    // SEO Data
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: { type: [String], default: [] },
    },

    // Status Flags
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

// Create a text index on title and description for blazing-fast search queries
productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

// 🚨 NEW: Variant Sub-Schema
const variantSchema = new Schema({
  sku: { type: String, required: true, uppercase: true }, // Unique SKU for this specific variant
  price: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  thumbnail: { type: String }, // Optional: A specific image for this color/variant
  attributes: [
    {
      name: { type: String, required: true }, // e.g., "Color", "Storage", "Size"
      value: { type: String, required: true }, // e.g., "White", "128GB", "XL"
    },
  ],
});

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true }, // Parent SKU
    description: { type: String, required: true },

    // Pricing & Inventory (Will act as "Starting At" and "Total Stock" if variants exist)
    basePrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },

    // 🚨 NEW: Variant Fields
    hasVariants: { type: Boolean, default: false },
    variants: { type: [variantSchema], default: [] },

    // Relationships
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },

    // Homepage Widgets
    isDealOfTheDay: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },

    // Bundles
    isBundle: { type: Boolean, default: false },
    bundleItems: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    // Media
    thumbnail: { type: String, required: true },
    images: { type: [String], default: [] },

    // Global Product Attributes (e.g., "Material: Cotton", "Weight: 1kg")
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

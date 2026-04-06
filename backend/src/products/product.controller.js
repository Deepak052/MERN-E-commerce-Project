const Product = require("./product.model"); 
const Order = require("../orders/order.model");

const mongoose = require("mongoose");

// Helper function to auto-sync parent pricing and stock based on variants
const syncVariantData = (productData) => {
  if (productData.variants && productData.variants.length > 0) {
    productData.hasVariants = true;
    
    // 1. Set basePrice to the cheapest variant
    productData.basePrice = Math.min(...productData.variants.map(v => Number(v.price)));
    
    // 2. Sum up total stock quantity across all variants
    productData.stockQuantity = productData.variants.reduce((total, v) => total + Number(v.stockQuantity), 0);
  } else {
    productData.hasVariants = false;
  }
  return productData;
};

const parseJSONSafely = (data) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return data;
};

// ==========================================
// 🔴 ADMIN CONTROLLERS
// ==========================================

exports.create = async (req, res) => {
  try {
    // 1. Parse stringified FormData arrays back into objects
    req.body.seo = parseJSONSafely(req.body.seo);
    req.body.attributes = parseJSONSafely(req.body.attributes);
    req.body.variants = parseJSONSafely(req.body.variants);
    req.body.bundleItems = parseJSONSafely(req.body.bundleItems);

    // 2. Map Cloudinary URLs from Multer
    if (req.files) {
      if (req.files.thumbnail) {
        req.body.thumbnail = req.files.thumbnail[0].path;
      }

      const galleryImages = [];
      for (let i = 0; i < 4; i++) {
        if (req.files[`image${i}`]) {
          galleryImages.push(req.files[`image${i}`][0].path);
        }
      }
      if (galleryImages.length > 0) req.body.images = galleryImages;
    }

    // 3. Auto-calculate totals before saving
    const processedData = syncVariantData(req.body);

    const product = new Product(processedData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A product with this SKU or Slug already exists." });
    }
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    const sort = {};
    let skip = 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    // 🚨 FIX: Replaced $text with $regex for partial and case-insensitive searching
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.brand) filter.brand = { $in: req.query.brand.split(",") };
    if (req.query.category)
      filter.category = { $in: req.query.category.split(",") };

    if (req.query.sort) {
      sort[req.query.sort] = req.query.order === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    if (req.query.page) {
      skip = limit * (parseInt(req.query.page) - 1);
    }

    const totalDocs = await Product.countDocuments(filter).exec();
    const results = await Product.find(filter)
      .sort(sort)
      .populate("brand", "name slug logo")
      .populate("category", "name slug")
      .skip(skip)
      .limit(limit)
      .exec();

    res.set("X-Total-Count", totalDocs);
    res.status(200).json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    // 1. Parse stringified FormData back into actual JSON objects/arrays
    if (req.body.seo) req.body.seo = parseJSONSafely(req.body.seo);
    if (req.body.attributes)
      req.body.attributes = parseJSONSafely(req.body.attributes);
    if (req.body.variants)
      req.body.variants = parseJSONSafely(req.body.variants);
    if (req.body.bundleItems)
      req.body.bundleItems = parseJSONSafely(req.body.bundleItems);

    // 2. Fetch the existing product to safely merge images
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct)
      return res.status(404).json({ message: "Product not found" });

    // 3. Handle Cloudinary URLs from Multer
    if (req.files) {
      // If a new thumbnail was uploaded, overwrite the old one
      if (req.files.thumbnail) {
        req.body.thumbnail = req.files.thumbnail[0].path;
      }

      // Carefully merge new gallery images into the existing array
      let updatedImages = [...existingProduct.images];
      for (let i = 0; i < 4; i++) {
        if (req.files[`image${i}`]) {
          updatedImages[i] = req.files[`image${i}`][0].path;
        }
      }
      // Filter out any empty slots and attach to the update payload
      req.body.images = updatedImages.filter(Boolean);
    }

    // 4. Auto-calculate totals before updating (now safe because variants is an array again)
    const processedData = syncVariantData(req.body);

    // 5. Update the database
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      processedData,
      {
        new: true,
      },
    )
      .populate("brand", "name slug")
      .populate("category", "name slug");

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Product Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A product with this SKU or Slug already exists." });
    }
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

exports.undeleteById = async (req, res) => {
  try {
    const unDeleted = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true },
    ).populate("brand", "name slug");
    if (!unDeleted)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json(unDeleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error restoring product", error: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true },
    );
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// ==========================================
// 🟢 PUBLIC CONTROLLERS (Customer Facing)
// ==========================================

exports.getAllPublic = async (req, res) => {
  try {
    const filter = { isDeleted: false, isActive: true };
    const sort = {};
    let skip = 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    // 🚨 FIX: Replaced $text with $regex for partial and case-insensitive searching
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.brand) filter.brand = { $in: req.query.brand.split(",") };
    if (req.query.category)
      filter.category = { $in: req.query.category.split(",") };

    if (req.query.minPrice || req.query.maxPrice) {
      filter.basePrice = {};
      if (req.query.minPrice)
        filter.basePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        filter.basePrice.$lte = Number(req.query.maxPrice);
    }

    if (req.query.sort) {
      sort[req.query.sort] = req.query.order === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    if (req.query.page) {
      skip = limit * (parseInt(req.query.page) - 1);
    }

    const totalDocs = await Product.countDocuments(filter).exec();
    const results = await Product.find(filter)
      .sort(sort)
      .populate("brand", "name slug logo")
      .populate("category", "name slug")
      .skip(skip)
      .limit(limit)
      .exec();

    res.set("X-Total-Count", totalDocs);
    res.status(200).json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const suggestions = await Product.find({
      isDeleted: false,
      isActive: true,
      title: { $regex: q, $options: "i" },
    })
      .select("title slug thumbnail basePrice")
      .limit(5);

    res.status(200).json(suggestions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching suggestions", error: error.message });
  }
};

exports.getByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    // Only allow public users to fetch active products
    const query = isObjectId
      ? { _id: idOrSlug, isDeleted: false, isActive: true }
      : { slug: idOrSlug, isDeleted: false, isActive: true };

    const product = await Product.findOne(query)
      .populate("brand", "name slug")
      .populate("category", "name slug");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting product details", error: error.message });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const newArrivals = await Product.find({ isDeleted: false, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("brand", "name slug logo")
      .populate("category", "name slug");
    res.status(200).json(newArrivals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching new arrivals", error: error.message });
  }
};

exports.getDealsOfTheDay = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Fetch only products where the admin has toggled isDealOfTheDay to true
    const deals = await Product.find({ isDealOfTheDay: true })
      .sort({ updatedAt: -1 }) // Show recently updated deals first
      .limit(limit);

    res.status(200).json(deals);
  } catch (error) {
    console.error("Fetch Deals Error:", error);
    res.status(500).json({ message: "Failed to fetch deals of the day" });
  }
};

exports.getExploreMore = async (req, res) => {
  try {
    // Default to 12 products if the frontend doesn't specify a limit
    const limit = parseInt(req.query.limit) || 12;

    // Use MongoDB's $sample aggregation to grab a randomized set of products.
    // This keeps the homepage fresh on every reload!
    const exploreProducts = await Product.aggregate([
      { $match: { isActive: true } }, // 1. Only pick active products
      { $sample: { size: limit } }, // 2. Randomly select the specified amount
    ]);

    res.status(200).json(exploreProducts);
  } catch (error) {
    console.error("Explore More Error:", error);
    res.status(500).json({ message: "Failed to fetch explore products" });
  }
};

// Sorts by the highest `soldCount`
exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bestSellers = await Product.find({ isActive: true })
      .sort({ soldCount: -1 }) // -1 means highest number first
      .limit(limit);
    
    res.status(200).json(bestSellers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
};

// 2. BUDGET PICKS
// Fetches active products strictly under a certain price point
exports.getBudgetPicks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const maxPrice = parseInt(req.query.maxPrice) || 50; // Default to items under $50

    const budgetPicks = await Product.find({ 
      isActive: true, 
      basePrice: { $lte: maxPrice } // $lte = Less than or equal to
    })
      .sort({ basePrice: 1 }) // 1 means lowest price first
      .limit(limit);
    
    res.status(200).json(budgetPicks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch budget picks" });
  }
};

// 3. FLASH SALE
// Fetches products with the flash sale flag enabled
exports.getFlashSale = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const flashSales = await Product.find({ isActive: true, isFlashSale: true })
      .limit(limit);
    
    res.status(200).json(flashSales);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch flash sales" });
  }
};

// RECOMMENDED FOR YOU (Requires Logged-In User)
// A lightweight recommendation engine based on the user's past order categories
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    console.log("🔹 [START] getRecommendations API");
    console.log("👉 User ID:", userId);
    console.log("👉 Limit:", limit);

    // 🚨 FIX 1: Removed .populate() because 'item' is a Mixed type
    // and the product data is already embedded directly in the order document.
    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3);

    console.log("📦 Recent Orders Count:", recentOrders.length);

    let preferredCategories = [];

    if (recentOrders.length > 0) {
      console.log("🔍 Extracting categories from recent orders...");

      recentOrders.forEach((order, orderIndex) => {
        console.log(`➡️ Order ${orderIndex + 1} ID:`, order._id);

        // 🚨 FIX 2: Changed from order.items to order.item (matching your schema)
        if (order.item && Array.isArray(order.item)) {
          order.item.forEach((cartItem, itemIndex) => {
            if (cartItem.product && cartItem.product.category) {
              console.log(
                `   🛒 Item ${itemIndex + 1} Product ID:`,
                cartItem.product._id,
              );

              // 🚨 FIX 3: Safely extract the category ID whether it is an object or a string
              const categoryId =
                cartItem.product.category._id || cartItem.product.category;
              console.log(`   📂 Category:`, categoryId.toString());

              preferredCategories.push(categoryId.toString());
            } else {
              console.log(
                `   ⚠️ Item ${itemIndex + 1} has no product/category`,
              );
            }
          });
        }
      });

      // Remove duplicates
      preferredCategories = [...new Set(preferredCategories)];

      console.log("✅ Preferred Categories:", preferredCategories);
    } else {
      console.log("⚠️ No recent orders found for user");
    }

    let recommendations;

    if (preferredCategories.length > 0) {
      console.log(
        "🎯 Fetching recommendations based on preferred categories...",
      );

      recommendations = await Product.aggregate([
        {
          $match: {
            isActive: true,
            // Match products where the category ID string matches
            category: {
              $in: preferredCategories.map(
                (id) => new mongoose.Types.ObjectId(id),
              ),
            },
          },
        },
        { $sample: { size: limit } },
      ]);

      console.log(
        "📊 Recommendations fetched (category-based):",
        recommendations.length,
      );
    } else {
      console.log("🎲 Fallback: Fetching random products...");

      recommendations = await Product.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: limit } },
      ]);

      console.log(
        "📊 Recommendations fetched (random):",
        recommendations.length,
      );
    }

    console.log("🔹 [END] getRecommendations API\n");

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("❌ Recommendations Error:", error.message);
    console.error("📌 Stack Trace:", error.stack);

    res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

// GET /products/combo-offers
exports.getComboOffers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    // Fetch bundles and populate the data of the products inside them
    const bundles = await Product.find({ isActive: true, isBundle: true })
      .populate("bundleItems")
      .limit(limit);
      
    res.status(200).json(bundles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching combo offers" });
  }
};

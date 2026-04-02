const Product = require("../models/Product");

exports.create = async (req, res) => {
  try {
    const product = new Product(req.body);
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

exports.getAll = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    const sort = {};
    let skip = 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    // 1. Text Search (Matches title/description using MongoDB text index)
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // 2. Filter by Active Status (Hide inactive from standard users)
    if (req.query.admin !== "true") {
      filter.isActive = true;
    }

    // 3. Multi-Brand / Multi-Category Filtering (Frontend sends ?brand=id1,id2)
    if (req.query.brand) {
      filter.brand = { $in: req.query.brand.split(",") };
    }
    if (req.query.category) {
      filter.category = { $in: req.query.category.split(",") };
    }

    // 4. Price Range Filtering
    if (req.query.minPrice || req.query.maxPrice) {
      filter.basePrice = {};
      if (req.query.minPrice)
        filter.basePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice)
        filter.basePrice.$lte = Number(req.query.maxPrice);
    }

    // 5. Sorting
    if (req.query.sort) {
      sort[req.query.sort] = req.query.order === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // 6. Pagination
    if (req.query.page) {
      const page = parseInt(req.query.page);
      skip = limit * (page - 1);
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

// Finds product by MongoDB _id OR SEO-friendly slug
exports.getByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    // Check if the param is a valid 24-character hex string (ObjectId)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

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

exports.updateById = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("brand", "name slug")
      .populate("category", "name slug");

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updated);
  } catch (error) {
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

// Admin restore function
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

// Admin soft delete function
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

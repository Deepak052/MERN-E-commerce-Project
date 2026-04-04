const Product = require("./product.model"); // Updated import path

// ==========================================
// 🔴 ADMIN CONTROLLERS
// ==========================================

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

exports.getAllAdmin = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    const sort = {};
    let skip = 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (req.query.search) filter.$text = { $search: req.query.search };
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
    // SECURITY FIX: Forcing isActive to true for the public storefront
    const filter = { isDeleted: false, isActive: true };
    const sort = {};
    let skip = 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (req.query.search) filter.$text = { $search: req.query.search };
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

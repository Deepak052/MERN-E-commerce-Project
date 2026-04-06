const Brand = require("./brand.model");
const Product = require("../products/product.model");
const Category = require("../category/category.model");

exports.getAllPublic = async (req, res) => {
  try {
    // 🚨 FIX: Hide deleted brands from the public too
    const brands = await Brand.find({ isActive: true, isDeleted: false }).sort({
      name: 1,
    });
    res.status(200).json(brands);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching brands", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (req.file) req.body.logo = req.file.path;
    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ message: "A brand with this slug already exists" });
    res.status(500).json({ message: "Error creating brand" });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    // 🚨 FIX: Admins see active/inactive brands, but NOT deleted ones
    const brands = await Brand.find({ isDeleted: false }).sort({ name: 1 });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands" });
  }
};

exports.getById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brand details" });
  }
};

exports.updateById = async (req, res) => {
  try {
    if (req.file) {
      req.body.logo = req.file.path;
    }
    const updated = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Brand not found" });

    // 🚨 FIX: This return statement was missing in your code!
    res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ message: "A brand with this slug already exists" });
    res.status(500).json({ message: "Error updating brand" });
  }
};

// 🚨 FIX: Updated Soft Delete Logic
exports.deleteById = async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false }, // Set to deleted and ensure it's deactivated
      { new: true },
    );
    if (!deleted) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand" });
  }
};

exports.getFeaturedBrands = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    // 🚨 FIX: Ensure we only get active, non-deleted featured brands
    const featured = await Brand.find({
      isFeatured: true,
      isActive: true,
      isDeleted: false,
    }).limit(limit);
    res.status(200).json(featured);
  } catch (error) {
    res.status(500).json({ message: "Error fetching featured brands" });
  }
};

exports.getBrandCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const distinctCategoryIds = await Product.distinct("category", {
      brand: id,
      isActive: true,
    });
    const categories = await Category.find({
      _id: { $in: distinctCategoryIds },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brand categories" });
  }
};

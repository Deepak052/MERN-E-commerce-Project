const Category = require("./category.model");

// ==========================================
// 🟢 PUBLIC CONTROLLERS (Customer Storefront)
// ==========================================

exports.getAllPublic = async (req, res) => {
  try {
    // SECURITY FIX: Strictly enforce isActive: true
    const categories = await Category.find({ isActive: true })
      .populate("parentCategory", "name slug")
      .sort({ name: 1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get Public Categories Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

exports.getRootsPublic = async (req, res) => {
  try {
    const categories = await Category.find({
      parentCategory: null,
      isActive: true, // Only show active roots to public
    }).sort({ name: 1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get Public Root Categories Error:", error);
    res
      .status(500)
      .json({
        message: "Error fetching root categories",
        error: error.message,
      });
  }
};

// ==========================================
// 🔴 ADMIN CONTROLLERS (Merchant Dashboard)
// ==========================================

exports.create = async (req, res) => {
  try {
    const { parentCategory } = req.body;

    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ message: "Parent category not found" });
      }
      if (parent.parentCategory) {
        return res
          .status(400)
          .json({
            message: "Subcategories cannot be nested more than one level deep",
          });
      }
    }

    const category = new Category(req.body);
    await category.save();

    const populated = await Category.findById(category._id).populate(
      "parentCategory",
      "name slug",
    );
    res.status(201).json(populated);
  } catch (error) {
    console.error("Create Category Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A category with this slug already exists" });
    }
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    // Admin needs to see EVERYTHING, active or inactive
    const categories = await Category.find({})
      .populate("parentCategory", "name slug")
      .sort({ name: 1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get Admin Categories Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

exports.getRootsAdmin = async (req, res) => {
  try {
    const categories = await Category.find({ parentCategory: null }).sort({
      name: 1,
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Get Admin Root Categories Error:", error);
    res
      .status(500)
      .json({
        message: "Error fetching root categories",
        error: error.message,
      });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentCategory",
      "name slug",
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    console.error("Get Category By ID Error:", error);
    res
      .status(500)
      .json({
        message: "Error fetching category details",
        error: error.message,
      });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { parentCategory, _id } = req.body;
    const categoryId = req.params.id;

    if (parentCategory && parentCategory.toString() === categoryId) {
      return res
        .status(400)
        .json({ message: "A category cannot be its own parent" });
    }

    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent)
        return res.status(400).json({ message: "Parent category not found" });
      if (parent.parentCategory) {
        return res
          .status(400)
          .json({
            message: "Subcategories cannot be nested more than one level deep",
          });
      }
    }

    const updated = await Category.findByIdAndUpdate(categoryId, req.body, {
      new: true,
    }).populate("parentCategory", "name slug");

    if (!updated)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Category Error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A category with this slug already exists" });
    }
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    // Cascade deactivate all subcategories
    await Category.updateMany(
      { parentCategory: req.params.id },
      { isActive: false },
    );

    res.status(200).json(deleted);
  } catch (error) {
    console.error("Delete Category Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

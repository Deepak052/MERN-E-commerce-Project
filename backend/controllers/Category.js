const Category = require("../models/Category");

// Create a new category
exports.create = async (req, res) => {
  try {
    const { parentCategory } = req.body;

    // If parentCategory is provided, validate it exists and is a root category
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ message: "Parent category not found" });
      }
      if (parent.parentCategory) {
        return res.status(400).json({
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

// Get all categories
exports.getAll = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const categories = await Category.find(filter)
      .populate("parentCategory", "name slug")
      .sort({ name: 1 });

    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

// Get only root (top-level) categories
exports.getRoots = async (req, res) => {
  try {
    const categories = await Category.find({
      parentCategory: null,
      isActive: true,
    }).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching root categories",
        error: error.message,
      });
  }
};

// Get category by ID
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
    res.status(500).json({
      message: "Error fetching category details",
      error: error.message,
    });
  }
};

// Update category by ID
exports.updateById = async (req, res) => {
  try {
    const { parentCategory, _id } = req.body;
    const categoryId = req.params.id;

    // Prevent self-referencing
    if (parentCategory && parentCategory.toString() === categoryId) {
      return res
        .status(400)
        .json({ message: "A category cannot be its own parent" });
    }

    // Validate parent exists and is a root category
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ message: "Parent category not found" });
      }
      if (parent.parentCategory) {
        return res.status(400).json({
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

// Soft delete — also deactivate all children
exports.deleteById = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    // Deactivate all subcategories of this parent
    await Category.updateMany(
      { parentCategory: req.params.id },
      { isActive: false },
    );

    res.status(200).json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

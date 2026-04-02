const Brand = require("../models/Brand");

exports.create = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A brand with this slug already exists" });
    }
    res
      .status(500)
      .json({ message: "Error creating brand", error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    // By default, fetch only active brands unless admin requests otherwise
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const brands = await Brand.find(filter).sort({ name: 1 });
    res.status(200).json(brands);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching brands", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json(brand);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching brand details", error: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const updated = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A brand with this slug already exists" });
    }
    res
      .status(500)
      .json({ message: "Error updating brand", error: error.message });
  }
};

// Soft delete (Sets isActive to false instead of deleting from database)
exports.deleteById = async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!deleted) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting brand", error: error.message });
  }
};

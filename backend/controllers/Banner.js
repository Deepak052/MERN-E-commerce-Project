const Banner = require("../models/Banner");

exports.create = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating banner", error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    // If admin=true is passed, fetch all. Otherwise, fetch only active banners.
    const filter = req.query.admin === "true" ? {} : { isActive: true };

    // Sort by newest first
    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching banners", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(banner);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching banner details", error: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating banner", error: error.message });
  }
};

// Soft delete (Sets isActive to false instead of deleting from database)
exports.deleteById = async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!deleted) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(deleted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting banner", error: error.message });
  }
};

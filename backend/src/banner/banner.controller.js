const Banner = require("./banner.model");

// ==========================================
// 🟢 PUBLIC CONTROLLERS (Customer Storefront)
// ==========================================

exports.getAllPublic = async (req, res) => {
  try {
    // SECURITY FIX: Strictly enforce isActive: true on the backend
    const banners = await Banner.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.status(200).json(banners);
  } catch (error) {
    console.error("Get Public Banners Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching banners", error: error.message });
  }
};

// ==========================================
// 🔴 ADMIN CONTROLLERS (Merchant Dashboard)
// ==========================================

exports.create = async (req, res) => {
  try {
    // 🚨 NEW: Grab the URL from Multer
    if (req.file) {
      req.body.image = req.file.path;
    } else {
      return res.status(400).json({ message: "Banner image is required." });
    }

    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    console.error("Create Banner Error:", error);
    res
      .status(500)
      .json({ message: "Error creating banner", error: error.message });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    // Admins need to see all banners to manage them
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    console.error("Get Admin Banners Error:", error);
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
    console.error("Get Banner By ID Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching banner details", error: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    // 🚨 NEW: Only update the image if the admin uploaded a new one
    if (req.file) {
      req.body.image = req.file.path;
    }

    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Banner not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Banner Error:", error);
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
    console.error("Delete Banner Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting banner", error: error.message });
  }
};

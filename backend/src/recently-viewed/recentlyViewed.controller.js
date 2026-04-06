const RecentlyViewed = require("./recentlyViewed.model");

// POST /recently-viewed/:productId
exports.trackView = async (req, res) => {
  try {
    const userId = req.user._id; // From verifyToken
    const productId = req.params.productId;

    // Upsert: Update timestamp if it exists, insert if it doesn't
    await RecentlyViewed.findOneAndUpdate(
      { user: userId, product: productId },
      { viewedAt: Date.now() },
      { upsert: true, new: true },
    );

    res.status(200).json({ message: "View tracked" });
  } catch (error) {
    res.status(500).json({ message: "Error tracking view" });
  }
};

// GET /recently-viewed
exports.getRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const history = await RecentlyViewed.find({ user: userId })
      .sort({ viewedAt: -1 })
      .limit(limit)
      .populate("product"); // Bring in the product details

    // Map it so the frontend just gets an array of products
    const products = history.map((item) => item.product).filter(Boolean);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent views" });
  }
};

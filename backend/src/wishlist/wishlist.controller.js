const Wishlist = require("./wishlist.model");

exports.create = async (req, res) => {
  try {
    // SECURITY FIX: Force user ID from the verified token
    const wishlistData = {
      ...req.body,
      user: req.user._id,
    };

    const created = new Wishlist(wishlistData);
    await created.save();

    // Populate product and brand details for the frontend
    const populated = await created.populate({
      path: "product",
      populate: { path: "brand" },
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create Wishlist Error:", error);
    res
      .status(500)
      .json({
        message: "Error adding product to wishlist, please try again later",
      });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    // SECURITY FIX: Strictly use req.user._id, ignore URL params
    let skip = 0;
    let limit = 0;

    if (req.query.page && req.query.limit) {
      const pageSize = parseInt(req.query.limit);
      const page = parseInt(req.query.page);
      skip = pageSize * (page - 1);
      limit = pageSize;
    }

    const filter = { user: req.user._id };

    const result = await Wishlist.find(filter)
      .skip(skip)
      .limit(limit)
      .populate({ path: "product", populate: { path: "brand" } })
      .sort({ createdAt: -1 });

    const totalResults = await Wishlist.countDocuments(filter);

    res.set("X-Total-Count", totalResults);
    res.status(200).json(result);
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res
      .status(500)
      .json({
        message: "Error fetching your wishlist, please try again later",
      });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Ensure the item belongs to the authenticated user
    const updated = await Wishlist.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true },
    ).populate("product");

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Wishlist item not found or unauthorized" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Wishlist Error:", error);
    res
      .status(500)
      .json({
        message: "Error updating your wishlist, please try again later",
      });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Ensure the item belongs to the authenticated user
    const deleted = await Wishlist.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Wishlist item not found or unauthorized" });
    }

    res.status(200).json(deleted);
  } catch (error) {
    console.error("Delete Wishlist Error:", error);
    res
      .status(500)
      .json({
        message:
          "Error deleting that product from wishlist, please try again later",
      });
  }
};

const Cart = require("./cart.model");

exports.create = async (req, res) => {
  try {
    // SECURITY FIX: Force user ID from the verified token
    const cartItem = new Cart({
      ...req.body,
      user: req.user._id,
    });
    await cartItem.save();

    // Populate product and brand after saving
    const populatedCartItem = await cartItem.populate({
      path: "product",
      populate: { path: "brand" },
    });

    res.status(201).json(populatedCartItem);
  } catch (error) {
    console.error("Create Cart Error:", error);
    return res
      .status(500)
      .json({
        message: "Error adding product to cart, please try again later",
      });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    // SECURITY FIX: Ignore params, strictly use req.user._id
    const result = await Cart.find({ user: req.user._id }).populate({
      path: "product",
      populate: { path: "brand" },
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching cart items, please try again later" });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Ensure the cart item belongs to the authenticated user
    const updated = await Cart.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true },
    ).populate({ path: "product", populate: { path: "brand" } });

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Cart item not found or unauthorized" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Cart Error:", error);
    return res
      .status(500)
      .json({ message: "Error updating cart items, please try again later" });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Ensure the cart item belongs to the authenticated user
    const deleted = await Cart.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Cart item not found or unauthorized" });
    }

    res.status(200).json(deleted);
  } catch (error) {
    console.error("Delete Cart Item Error:", error);
    return res
      .status(500)
      .json({ message: "Error deleting cart item, please try again later" });
  }
};

exports.deleteByUserId = async (req, res) => {
  try {
    // SECURITY FIX: Only clear the cart of the currently logged-in user
    await Cart.deleteMany({ user: req.user._id });
    res.sendStatus(204);
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res
      .status(500)
      .json({ message: "Some Error occurred while resetting your cart" });
  }
};

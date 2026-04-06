const Cart = require("./cart.model");
const Product = require("../products/product.model"); // Import Product to validate variants

exports.create = async (req, res) => {
  try {
    const { product: productId, variantId, quantity } = req.body;

    // 1. Fetch the product to validate it exists and check its variant rules
    const productData = await Product.findById(productId);
    if (!productData) {
      return res.status(404).json({ message: "Product not found." });
    }

    // 2. Validate Variant Selection
    if (productData.hasVariants) {
      if (!variantId) {
        return res
          .status(400)
          .json({
            message: "This product requires you to select a specific variant.",
          });
      }
      const isValidVariant = productData.variants.id(variantId);
      if (!isValidVariant) {
        return res.status(400).json({ message: "Invalid variant selected." });
      }
    }

    // 3. Check if this exact Product + Variant is already in the cart
    const existingCartItem = await Cart.findOne({
      user: req.user._id,
      product: productId,
      variantId: variantId || null,
    });

    if (existingCartItem) {
      // If it exists, just increment the quantity
      existingCartItem.quantity += quantity || 1;
      await existingCartItem.save();

      const populatedItem = await Cart.findById(existingCartItem._id).populate({
        path: "product",
        populate: { path: "brand" },
      });
      return res.status(200).json(populatedItem);
    }

    // 4. Create new cart item
    const cartItem = new Cart({
      ...req.body,
      user: req.user._id,
      variantId: variantId || null,
    });

    await cartItem.save();

    const populatedCartItem = await cartItem.populate({
      path: "product",
      populate: { path: "brand" },
    });

    res.status(201).json(populatedCartItem);
  } catch (error) {
    console.error("Create Cart Error:", error);
    return res.status(500).json({
      message: "Error adding product to cart, please try again later",
    });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user._id }).populate({
      path: "product",
      populate: { path: "brand category" },
    });

    // 🚨 FORMAT RESPONSE: Embed the specific variant data into the item
    // so the frontend doesn't have to search through the product.variants array.
    const formattedCart = cartItems.map((item) => {
      // Convert to plain object so we can modify the output
      const itemObj = item.toObject();

      if (itemObj.product.hasVariants && itemObj.variantId) {
        // Find the specific variant the user selected
        const selectedVariant = itemObj.product.variants.find(
          (v) => v._id.toString() === itemObj.variantId.toString(),
        );

        if (selectedVariant) {
          // Override the base price and image with the variant's specific price and image
          itemObj.product.basePrice = selectedVariant.price;
          if (selectedVariant.thumbnail) {
            itemObj.product.thumbnail = selectedVariant.thumbnail;
          }
          // Attach the selected attributes (Color, Size) so the cart UI can display them
          itemObj.selectedAttributes = selectedVariant.attributes;
        }
      }

      return itemObj;
    });

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({ message: "Error fetching cart items" });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Cart.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true },
    ).populate({ path: "product", populate: { path: "brand" } });

    if (!updated) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Cart Error:", error);
    return res.status(500).json({ message: "Error updating cart items" });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Cart.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json(deleted);
  } catch (error) {
    console.error("Delete Cart Item Error:", error);
    return res.status(500).json({ message: "Error deleting cart item" });
  }
};

exports.deleteByUserId = async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user._id });
    res.sendStatus(204);
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ message: "Error resetting your cart" });
  }
};

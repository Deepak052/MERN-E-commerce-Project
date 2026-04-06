const Order = require("./order.model");
const Product = require("../products/product.model"); // 🚨 NEW: Needed for Stock tracking
const Razorpay = require("razorpay"); // 🚨 FIX: Missing Import
const crypto = require("crypto"); // 🚨 FIX: Missing Import

// ==========================================
// 🛠️ HELPER: REDUCE INVENTORY STOCK
// ==========================================
const reduceStock = async (orderItems) => {
  for (const cartItem of orderItems) {
    // Safely get the product ID whether it's populated or just a string
    const productId = cartItem.product._id || cartItem.product;
    const product = await Product.findById(productId);

    if (product) {
      // 1. If it has variants, reduce the specific variant's stock
      if (product.hasVariants && cartItem.variantId) {
        const variant = product.variants.id(cartItem.variantId);
        if (variant) {
          variant.stockQuantity = Math.max(
            0,
            variant.stockQuantity - cartItem.quantity,
          );
        }
      }

      // 2. Always reduce the parent product's total stock
      product.stockQuantity = Math.max(
        0,
        product.stockQuantity - cartItem.quantity,
      );

      await product.save();
    }
  }
};

// ==========================================
// 🟢 CREATE STANDARD ORDER (COD)
// ==========================================
exports.create = async (req, res) => {
  try {
    const created = new Order({
      ...req.body,
      user: req.user._id,
    });

    await created.save();

    // 🚨 NEW: Reduce stock in the database!
    await reduceStock(req.body.item);

    res.status(201).json(created);
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      message: "Error creating an order, please try again later",
    });
  }
};

// ==========================================
// 💳 RAZORPAY INIT
// ==========================================
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ message: "Total amount is required" });
    }

    // 🚨 FIX: Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise (cents)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Create Error:", error);
    res.status(500).json({
      message: "Error creating Razorpay order",
      error: error.description || error.message || "Unknown Razorpay Error",
    });
  }
};

// ==========================================
// 🔐 VERIFY ONLINE PAYMENT
// ==========================================
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    // 🚨 FIX: Crypto was not imported
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const finalOrder = new Order({
        ...orderData,
        user: req.user._id,
        paymentStatus: "Received",
        paymentMode: "ONLINE",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      await finalOrder.save();

      // 🚨 NEW: Reduce stock after successful payment!
      await reduceStock(orderData.item);

      return res.status(201).json(finalOrder);
    } else {
      return res.status(400).json({
        message: "Invalid payment signature!",
      });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// ==========================================
// 📜 GET USER ORDERS
// ==========================================
exports.getUserOrders = async (req, res) => {
  try {
    const results = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(results);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({
      message: "Error fetching orders, please try again later",
    });
  }
};

// ==========================================
// 🛠️ ADMIN GET ALL ORDERS
// ==========================================
exports.getAllAdmin = async (req, res) => {
  try {
    let skip = 0;
    let limit = 0;

    if (req.query.page && req.query.limit) {
      const pageSize = parseInt(req.query.limit);
      const page = parseInt(req.query.page);
      skip = pageSize * (page - 1);
      limit = pageSize;
    }

    const totalDocs = await Order.countDocuments().exec();
    const results = await Order.find({})
      .populate("user", "name email") // Helpful for the Admin UI to see who ordered
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.header("X-Total-Count", totalDocs);
    res.status(200).json(results);
  } catch (error) {
    console.error("Admin Get Orders Error:", error);
    res.status(500).json({
      message: "Error fetching orders, please try again later",
    });
  }
};

// ==========================================
// ✏️ ADMIN UPDATE ORDER STATUS
// ==========================================
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({
      message: "Error updating order, please try again later",
    });
  }
};

// 🚨 NEW: Fetch specific order by ID (Secured to ensure user owns it)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id // Security: ensures users can only see their own orders
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    return res.status(500).json({ message: "Error fetching order details" });
  }
};
const Order = require("./order.model");
exports.create = async (req, res) => {
  try {
    console.log("🟢 [CREATE ORDER] API HIT");
    console.log("👤 User:", req.user?._id);
    console.log("📦 Order Payload:", req.body);

    const created = new Order({
      ...req.body,
      user: req.user._id,
    });

    await created.save();

    console.log("✅ Order created successfully:", created._id);

    res.status(201).json(created);
  } catch (error) {
    console.error("🔥 [CREATE ORDER ERROR]:", error);
    return res.status(500).json({
      message: "Error creating an order, please try again later",
    });
  }
};

// ==========================================

exports.createRazorpayOrder = async (req, res) => {
  try {
    console.log("💳 [RAZORPAY INIT] API HIT");
    console.log("📩 Request Body:", req.body);

    const { totalAmount } = req.body;

    if (!totalAmount) {
      console.warn("⚠️ Total amount missing");
      return res.status(400).json({ message: "Total amount is required" });
    }

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    console.log("📦 Razorpay Options:", options);

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay Order Created:", order.id);

    res.status(200).json(order);
  } catch (error) {
    console.error("🔥 [RAZORPAY CREATE ERROR]:", error);
    res.status(500).json({
      message: "Error creating Razorpay order",
      error: error.description || error.message || "Unknown Razorpay Error",
    });
  }
};

// ==========================================

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    console.log("🔐 [VERIFY PAYMENT] API HIT");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    console.log("📩 Payment Data:", {
      razorpay_order_id,
      razorpay_payment_id,
      hasSignature: !!razorpay_signature,
    });

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log("🔑 Signature Match:", razorpay_signature === expectedSign);

    if (razorpay_signature === expectedSign) {
      console.log("✅ Payment verified");

      const finalOrder = new Order({
        ...orderData,
        user: req.user._id,
        paymentStatus: "Received",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      await finalOrder.save();

      console.log("📦 Final Order Saved:", finalOrder._id);

      return res.status(201).json(finalOrder);
    } else {
      console.warn("❌ Invalid Razorpay signature");
      return res.status(400).json({
        message: "Invalid payment signature!",
      });
    }
  } catch (error) {
    console.error("🔥 [VERIFY PAYMENT ERROR]:", error);
    res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// ==========================================

exports.getUserOrders = async (req, res) => {
  try {
    console.log("📜 [GET USER ORDERS] API HIT");
    console.log("👤 User:", req.user?._id);

    const results = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    console.log("✅ Orders fetched:", results.length);

    res.status(200).json(results);
  } catch (error) {
    console.error("🔥 [GET USER ORDERS ERROR]:", error);
    return res.status(500).json({
      message: "Error fetching orders, please try again later",
    });
  }
};

// ==========================================

exports.getAllAdmin = async (req, res) => {
  try {
    console.log("🛠️ [ADMIN GET ALL ORDERS] API HIT");
    console.log("📩 Query Params:", req.query);

    let skip = 0;
    let limit = 0;

    if (req.query.page && req.query.limit) {
      const pageSize = parseInt(req.query.limit);
      const page = parseInt(req.query.page);
      skip = pageSize * (page - 1);
      limit = pageSize;
    }

    console.log("📊 Pagination:", { skip, limit });

    const totalDocs = await Order.countDocuments().exec();

    const results = await Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    console.log("✅ Total Orders:", totalDocs);
    console.log("📦 Returned Orders:", results.length);

    res.header("X-Total-Count", totalDocs);
    res.status(200).json(results);
  } catch (error) {
    console.error("🔥 [ADMIN GET ORDERS ERROR]:", error);
    res.status(500).json({
      message: "Error fetching orders, please try again later",
    });
  }
};

// ==========================================

exports.updateById = async (req, res) => {
  try {
    console.log("✏️ [UPDATE ORDER] API HIT");
    console.log("🆔 Order ID:", req.params.id);
    console.log("📩 Update Payload:", req.body);

    const { id } = req.params;

    const updated = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      console.warn("❌ Order not found:", id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order updated:", updated._id);

    res.status(200).json(updated);
  } catch (error) {
    console.error("🔥 [UPDATE ORDER ERROR]:", error);
    res.status(500).json({
      message: "Error updating order, please try again later",
    });
  }
};

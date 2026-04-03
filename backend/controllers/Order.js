const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- NEW: Generate Razorpay Order ID ---
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    // Safety check
    if (!totalAmount) {
      return res.status(400).json({ message: "Total amount is required" });
    }

    const options = {
      // 🚨 FIX: Math.round ensures absolutely no decimals are sent to Razorpay
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    // Improved logging to see exactly what Razorpay is complaining about
    console.error("RAZORPAY CREATE ERROR:", error);
    res.status(500).json({
      message: "Error creating Razorpay order",
      error: error.description || error.message || "Unknown Razorpay Error",
    });
  }
};

// --- NEW: Verify Payment & Save to DB ---
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // Cryptographically verify the signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is legit! Save the actual order to DB
      const finalOrder = new Order({
        ...orderData,
        paymentStatus: "Received",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
      await finalOrder.save();
      return res.status(201).json(finalOrder);
    } else {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error verifying payment", error: error.message });
  }
};

exports.create=async(req,res)=>{
    try {
        const created=new Order(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error creating an order, please trying again later'})
    }
}

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        const results=await Order.find({user:id})
        res.status(200).json(results)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error fetching orders, please trying again later'})
    }
}

exports.getAll = async (req, res) => {
    try {
        let skip=0
        let limit=0

        if(req.query.page && req.query.limit){
            const pageSize=req.query.limit
            const page=req.query.page
            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Order.find({}).countDocuments().exec()
        const results=await Order.find({}).skip(skip).limit(limit).exec()

        res.header("X-Total-Count",totalDocs)
        res.status(200).json(results)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching orders, please try again later'})
    }
};

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Order.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating order, please try again later'})
    }
}

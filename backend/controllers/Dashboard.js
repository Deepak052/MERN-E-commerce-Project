const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate basic KPIs in parallel for speed
    const [totalOrders, activeProducts, totalCustomers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: { $ne: "admin" } }), // Safest way to count customers
    ]);

    // 2. Calculate Total Revenue (Excluding Cancelled Orders)
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }, // FIX: changed to $total
    ]);
    const totalRevenue =
      revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // 3. Sales Over Time (Last 7 Days for the Line Chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$total" }, // FIX: changed to $total
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedSalesChart = salesOverTime.map((item) => ({
      name: item._id,
      sales: item.sales,
    }));

    // 4. Sales by Category (For the Pie Chart)
    const categorySales = await Order.aggregate([
      { $unwind: "$item" }, // FIX: changed to $item
      {
        $lookup: {
          from: "categories",
          localField: "item.product.category", // FIX: Match your populated cart structure
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          // Calculate approximate value based on basePrice * quantity
          value: {
            $sum: { $multiply: ["$item.product.basePrice", "$item.quantity"] },
          },
        },
      },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);

    // 5. Recent Orders (For the Table)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select("_id total status createdAt paymentMode"); // FIX: Corrected field names

    // Format recent orders for the frontend
    const formattedOrders = recentOrders.map((order) => ({
      id: order._id,
      customer: order.user ? order.user.name : "Guest",
      amount: `$${(order.total || 0).toFixed(2)}`, // FIX: Safe fallback + correct field name
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString(),
    }));

    // Send one unified payload
    res.status(200).json({
      kpis: {
        totalRevenue: `$${totalRevenue.toFixed(2)}`,
        totalOrders,
        activeProducts,
        totalCustomers,
      },
      charts: {
        salesData: formattedSalesChart,
        categoryData:
          categorySales.length > 0
            ? categorySales
            : [{ name: "No Data", value: 1 }],
      },
      recentOrders: formattedOrders,
    });
  } catch (error) {
    // This will now print the EXACT reason if it fails again in the future!
    console.error("Dashboard Stats Error:", error);
    res
      .status(500)
      .json({
        message: "Error fetching dashboard statistics",
        error: error.message,
      });
  }
};

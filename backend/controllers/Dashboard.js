const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate basic KPIs in parallel for speed
    const [totalOrders, activeProducts, totalCustomers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: "user" }), // Assuming you have a role field
    ]);

    // 2. Calculate Total Revenue (Excluding Cancelled Orders)
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
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
          // Formats date to YYYY-MM-DD for charting
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } }, // Sort chronologically
    ]);

    // Map it to exactly what Recharts expects: [{ name: '2023-10-01', sales: 450 }]
    const formattedSalesChart = salesOverTime.map((item) => ({
      name: item._id,
      sales: item.sales,
    }));

    // 4. Sales by Category (For the Pie Chart)
    // This assumes your Order model has an `items` array with `{ product: ObjectId, price, quantity }`
    const categorySales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          value: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);

    // 5. Recent Orders (For the Table)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email") // Fetch customer name
      .select("id totalAmount status createdAt paymentMethod");

    // Format recent orders for the frontend
    const formattedOrders = recentOrders.map((order) => ({
      id: order._id,
      customer: order.user ? order.user.name : "Guest",
      amount: `$${order.totalAmount.toFixed(2)}`,
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
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

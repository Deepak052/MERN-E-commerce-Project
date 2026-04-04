require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { connectToDB } = require("./config/db");

// 1. Import Middlewares
const { verifyToken } = require("./middlewares/verifyToken");

// 2. Import Feature Routes (Removed all duplicate imports!)
const authRoutes = require("./src/auth/auth.routes");
const userRoutes = require("./src/users/user.routes");
const productRoutes = require("./src/products/product.routes");
const orderRoutes = require("./src/orders/order.routes");
const cartRoutes = require("./src/cart/cart.routes");
const categoryRoutes = require("./src/category/category.routes");
const brandRoutes = require("./src/brand/brand.routes");
const addressRoutes = require("./src/address/address.routes");
const reviewRoutes = require("./src/reviews/review.routes"); 
const wishlistRoutes = require("./src/wishlist/wishlist.routes");
const bannerRoutes = require("./src/banner/banner.routes");
const dashboardRoutes = require("./src/dashboard/dashboard.routes");

// Initialize Server
const server = express();
connectToDB();

// Global Middlewares
server.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    exposedHeaders: ["X-Total-Count"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
server.use(express.json());
server.use(cookieParser());
server.use(morgan("tiny"));

// ==========================================
// 🚀 API ROUTING (Version 1)
// ==========================================

const API_PREFIX = "/api/v1";

// --- MIXED ROUTES (Public & Admin) ---
// These features handle their own security (verifyToken/requireAdmin) inside their route files
server.use(`${API_PREFIX}/auth`, authRoutes);
server.use(`${API_PREFIX}/products`, productRoutes);
server.use(`${API_PREFIX}/categories`, categoryRoutes);
server.use(`${API_PREFIX}/brands`, brandRoutes);
server.use(`${API_PREFIX}/reviews`, reviewRoutes);
server.use(`${API_PREFIX}/banners`, bannerRoutes);
server.use(`${API_PREFIX}/orders`, orderRoutes);

// --- STRICTLY PROTECTED ROUTES (Requires Login) ---
// Wrapping these entirely with verifyToken saves us from putting it on every single route inside
server.use(`${API_PREFIX}/users`, verifyToken, userRoutes);
server.use(`${API_PREFIX}/cart`, verifyToken, cartRoutes);
server.use(`${API_PREFIX}/address`, verifyToken, addressRoutes);
server.use(`${API_PREFIX}/wishlist`, verifyToken, wishlistRoutes);

// --- STRICTLY ADMIN ROUTES ---
// The dashboard route file already includes requireAdmin, so we just mount it here
server.use(`${API_PREFIX}/admin/dashboard`, dashboardRoutes);

// Health Check
server.get("/", (req, res) => {
  res.status(200).json({ message: "E-commerce API is running successfully." });
});

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server [STARTED] ~ http://localhost:${PORT}`);
});

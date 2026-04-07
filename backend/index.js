require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// 🚀 NEW OPTIMIZATION IMPORTS
const helmet = require("helmet"); // Security headers
const compression = require("compression"); // Payload minification
const rateLimit = require("express-rate-limit"); // DDoS protection

const { connectToDB } = require("./config/db");

// ==========================================
// 1. IMPORT MIDDLEWARES & ROUTES
// ==========================================
const { verifyToken } = require("./middlewares/verifyToken");

const adminAuthRoutes = require("./src/auth/admin.auth.routes");
const authRoutes = require("./src/auth/auth.routes");
const productRoutes = require("./src/products/product.routes");
const categoryRoutes = require("./src/category/category.routes");
const brandRoutes = require("./src/brand/brand.routes");
const reviewRoutes = require("./src/reviews/review.routes");
const bannerRoutes = require("./src/banner/banner.routes");
const orderRoutes = require("./src/orders/order.routes");

const userRoutes = require("./src/users/user.routes");
const cartRoutes = require("./src/cart/cart.routes");
const addressRoutes = require("./src/address/address.routes");
const wishlistRoutes = require("./src/wishlist/wishlist.routes");
const recentlyViewedRoutes = require("./src/recently-viewed/recentlyViewed.routes");

const adminRoutes = require("./src/admins/admin.routes");
const dashboardRoutes = require("./src/dashboard/dashboard.routes");

// ==========================================
// 2. INITIALIZE SERVER & DB
// ==========================================
const server = express();
connectToDB();

// ==========================================
// 3. GLOBAL MIDDLEWARES (Optimized)
// ==========================================

server.set("trust proxy", 1);
const allowedOrigins = [process.env.CUSTOMER_ORIGIN, process.env.ADMIN_ORIGIN];

server.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(
          `🚨 CORS BLOCKED: Origin ${origin} is not in allowedOrigins list!`,
        );
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["X-Total-Count"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  }),
);

// 🚨 ADD THIS NEW DEBUG MIDDLEWARE HERE
server.use((req, res, next) => {
  console.log(`\n🚦 [TRAFFIC COP] ${req.method} ${req.url}`);
  console.log(`🌍 Origin Header:`, req.headers.origin || "NO ORIGIN HEADER");
  console.log(
    `🍪 Cookies Received:`,
    req.headers.cookie || "NO COOKIES SENT BY BROWSER",
  );
  next();
});

server.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    exposedHeaders: ["X-Total-Count"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);

// 🌟 OPTIMIZATION 2: Security & Performance
server.use(helmet()); // Protects against XSS, Clickjacking, and sniffs
server.use(compression()); // Gzip compresses responses, drastically improving API speed
server.use(express.json({ limit: "5mb" })); // Prevents Payload-Too-Large DOS attacks
server.use(cookieParser());
server.use(morgan("dev")); // 'dev' provides better color-coded logs than 'tiny'

// 🌟 OPTIMIZATION 3: Global Rate Limiting
// Prevents brute-force and basic DDoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  message: {
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
server.use("/api", apiLimiter);

// ==========================================
// 4. API ROUTING
// ==========================================
const API_PREFIX = "/api/v1";

server.use(`${API_PREFIX}/auth/user`, authRoutes);
server.use(`${API_PREFIX}/auth/admin`, adminAuthRoutes);
server.use(`${API_PREFIX}/products`, productRoutes);
server.use(`${API_PREFIX}/categories`, categoryRoutes);
server.use(`${API_PREFIX}/brands`, brandRoutes);
server.use(`${API_PREFIX}/reviews`, reviewRoutes);
server.use(`${API_PREFIX}/banners`, bannerRoutes);
server.use(`${API_PREFIX}/orders`, orderRoutes);

// Protected Customer Routes
server.use(`${API_PREFIX}/users`, verifyToken, userRoutes);
server.use(`${API_PREFIX}/cart`, verifyToken, cartRoutes);
server.use(`${API_PREFIX}/address`, verifyToken, addressRoutes);
server.use(`${API_PREFIX}/wishlist`, verifyToken, wishlistRoutes);
server.use(`${API_PREFIX}/recently-viewed`, verifyToken, recentlyViewedRoutes);

// Protected Admin Routes
server.use(`${API_PREFIX}/admin/users`, verifyToken, adminRoutes);
server.use(`${API_PREFIX}/admin/dashboard`, dashboardRoutes);

// ==========================================
// 5. HEALTH CHECK & ERROR HANDLING
// ==========================================
server.get("/", (req, res) => {
  res.status(200).json({
    status: "Active",
    message: "Shopsphere API is running.",
    architecture: "Multi-Tenant FSD",
  });
});

// Handle 404 for undefined API routes
server.use((req, res, next) => {
  res.status(404).json({ message: "API Endpoint not found." });
});

// 🌟 OPTIMIZATION 4: Global Error Handler
// Catches any unhandled errors in your controllers so the server doesn't crash
server.use((err, req, res, next) => {
  console.error("🔥 Global Error Caught:", err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    // Only reveal the stack trace if we are in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ==========================================
// 6. START SERVER
// ==========================================
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server [STARTED] ~ Listening on port ${PORT}`);
});

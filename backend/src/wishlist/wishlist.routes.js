const express = require("express");
const wishlistController = require("./wishlist.controller");
const router = express.Router();

// NOTE: This entire router should be protected by verifyToken in your index.js
// server.use("/api/v1/wishlist", verifyToken, wishlistRoutes);

router.post("/", wishlistController.create);
router.get("/", wishlistController.getByUserId); // Was: /user/:id
router.patch("/:id", wishlistController.updateById);
router.delete("/:id", wishlistController.deleteById);

module.exports = router;

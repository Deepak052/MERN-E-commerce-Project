const express = require("express");
const cartController = require("./cart.controller");
const router = express.Router();

// NOTE: This entire router is protected by verifyToken in your index.js
// server.use("/api/v1/cart", verifyToken, cartRoutes);

router.post("/", cartController.create);
router.get("/", cartController.getByUserId); // Was: /user/:id
router.patch("/:id", cartController.updateById);
router.delete("/:id", cartController.deleteById);
router.delete("/", cartController.deleteByUserId); // Was: /user/:id

module.exports = router;

const express = require("express");
const addressController = require("./address.controller");
const router = express.Router();

// NOTE: Ensure this router is wrapped with verifyToken in your index.js!
// Example: server.use('/api/v1/address', verifyToken, addressRoutes);

router.post("/", addressController.create);
router.get("/", addressController.getByUserId);
router.patch("/:id", addressController.updateById);
router.delete("/:id", addressController.deleteById);

module.exports = router;

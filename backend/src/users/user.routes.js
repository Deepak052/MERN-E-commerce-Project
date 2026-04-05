const express = require("express");
const router = express.Router();
const userController = require("./user.controller");

router.get("/:id", userController.getById);
router.patch("/:id", userController.updateById);

module.exports = router;

const express=require('express')
const orderController=require("../controllers/Order")
const router=express.Router()


router
  .post("/", orderController.create) // Used for COD
  .post("/razorpay/create", orderController.createRazorpayOrder) // Used to init Razorpay
  .post("/razorpay/verify", orderController.verifyRazorpayPayment) // Used to verify & save online order
  .get("/", orderController.getAll)
  .get("/user/:id", orderController.getByUserId)
  .patch("/:id", orderController.updateById);


module.exports=router
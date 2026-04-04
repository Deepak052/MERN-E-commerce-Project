import { axiosi } from "../../../config/axios";

export const createOrder = async (order) => {
  try {
    const res = await axiosi.post("/orders", order);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createRazorpayOrderSession = async (amountData) => {
  try {
    const res = await axiosi.post("/orders/razorpay/create", amountData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyAndCreateOrder = async (verificationData) => {
  try {
    const res = await axiosi.post("/orders/razorpay/verify", verificationData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 🚨 FIX: Removed ID from URL. Backend uses the JWT token securely.
export const getOrderByUserId = async () => {
  try {
    const res = await axiosi.get(`/orders`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 🚨 FIX: Changed to /orders/admin to match your secured Admin route
export const getAllOrders = async () => {
  try {
    const res = await axiosi.get(`/orders/admin`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateOrderById = async (update) => {
  try {
    const res = await axiosi.patch(`/orders/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

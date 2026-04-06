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

export const getOrderByUserId = async () => {
  try {
    const res = await axiosi.get(`/orders`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 🚨 NEW: Added getOrderById for Track Order & Details pages
export const getOrderById = async (id) => {
  try {
    const res = await axiosi.get(`/orders/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

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

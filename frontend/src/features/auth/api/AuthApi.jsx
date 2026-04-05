import { axiosi } from "../../../config/axios";

export const signup = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.post("/auth/user/signup", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.post("/auth/user/login", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyOtp = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.post("/auth/user/verify-otp", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resendOtp = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.post("/auth/user/resend-otp", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const forgotPassword = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.post("/auth/user/forgot-password", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPassword = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.post("/auth/user/reset-password", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkAuth = async () => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.get("/auth/user/check-auth");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    // 🚨 FIX: Points to the separated Customer auth route
    const res = await axiosi.get("/auth/user/logout");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

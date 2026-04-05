import { axiosi } from "../../../config/axios";

export const login = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Admin auth route
    const res = await axiosi.post("/auth/admin/login", cred);
    return res.data;
  } catch (error) {
    // 🚨 FIX: Added optional chaining fallback for robust error handling
    throw error.response?.data || error;
  }
};

export const forgotPassword = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Admin auth route
    const res = await axiosi.post("/auth/admin/forgot-password", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPassword = async (cred) => {
  try {
    // 🚨 FIX: Points to the separated Admin auth route
    const res = await axiosi.post("/auth/admin/reset-password", cred);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkAuth = async () => {
  try {
    // 🚨 FIX: Points to the separated Admin auth route
    const res = await axiosi.get("/auth/admin/check-auth");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    // 🚨 FIX: Points to the separated Admin auth route
    const res = await axiosi.get("/auth/admin/logout");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

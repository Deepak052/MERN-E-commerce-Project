import { axiosi } from "../../../config/axios";

export const fetchDashboardStats = async () => {
  try {
    // 🚨 FIX: Hit the root of the dashboard endpoint to match the new backend
    const res = await axiosi.get("/admin/dashboard");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

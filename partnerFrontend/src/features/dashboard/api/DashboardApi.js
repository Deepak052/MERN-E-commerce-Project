import { axiosi } from "../../../config/axios";

export const fetchDashboardStats = async () => {
  try {
    const res = await axiosi.get("/admin/dashboard/stats");
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

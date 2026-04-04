import { axiosi } from "../../../config/axios";

export const fetchAllBanners = async (admin = false) => {
  try {
    const queryString = admin ? "?admin=true" : "";
    // 🚨 FIX: Removed hardcoded /api prefix. Axios handles /api/v1 automatically.
    const res = await axiosi.get(`/banners${queryString}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getBannerById = async (id) => {
  try {
    const res = await axiosi.get(`/banners/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addBanner = async (data) => {
  try {
    const res = await axiosi.post("/banners", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateBannerById = async (update) => {
  try {
    const { _id, ...rest } = update;
    const res = await axiosi.patch(`/banners/${_id}`, rest);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteBannerById = async (id) => {
  try {
    const res = await axiosi.delete(`/banners/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

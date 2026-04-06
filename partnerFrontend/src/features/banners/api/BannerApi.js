import { axiosi } from "../../../config/axios";

export const fetchAllBanners = async (admin = false) => {
  try {
    const queryString = admin ? "?admin=true" : "";
    const res = await axiosi.get(`/banners${queryString}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch banners" };
  }
};

export const getBannerById = async (id) => {
  try {
    const res = await axiosi.get(`/banners/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch banner" };
  }
};

export const addBanner = async (data) => {
  try {
    // data is now FormData
    const res = await axiosi.post("/banners", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create banner" };
  }
};

export const updateBannerById = async (data) => {
  try {
    // data is now FormData. We extract the ID directly from it.
    const id = data.get("_id");
    const res = await axiosi.patch(`/banners/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update banner" };
  }
};

export const deleteBannerById = async (id) => {
  try {
    const res = await axiosi.delete(`/banners/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete banner" };
  }
};

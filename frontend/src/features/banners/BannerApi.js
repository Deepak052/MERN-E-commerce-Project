import { axiosi } from "../../config/axios";

export const fetchAllBanners = async (admin = false) => {
  try {
    const queryString = admin ? "?admin=true" : "";
    const res = await axiosi.get(`/api/banners${queryString}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch banners" };
  }
};

export const getBannerById = async (id) => {
  try {
    const res = await axiosi.get(`/api/banners/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch banner" };
  }
};

export const addBanner = async (data) => {
  try {
    const res = await axiosi.post("/api/banners", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create banner" };
  }
};

export const updateBannerById = async (update) => {
  try {
    const { _id, ...rest } = update;
    const res = await axiosi.patch(`/api/banners/${_id}`, rest);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update banner" };
  }
};

export const deleteBannerById = async (id) => {
  try {
    const res = await axiosi.delete(`/api/banners/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete banner" };
  }
};

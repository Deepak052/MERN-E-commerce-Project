import { axiosi } from "../../../config/axios";

export const createWishlistItem = async (data) => {
  try {
    const res = await axiosi.post("/wishlist", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 🚨 FIX: Removed ID from URL. Backend uses the JWT token securely.
export const fetchWishlistByUserId = async () => {
  try {
    const res = await axiosi.get(`/wishlist`);
    const totalResults = await res.headers["x-total-count"]; // Fixed header fetching syntax for Axios
    return { data: res.data, totalResults: totalResults };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateWishlistItemById = async (update) => {
  try {
    const res = await axiosi.patch(`/wishlist/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteWishlistItemById = async (id) => {
  try {
    const res = await axiosi.delete(`/wishlist/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

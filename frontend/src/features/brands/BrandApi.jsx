import { axiosi } from "../../config/axios";

// ✅ Public - only active brands
export const fetchAllBrands = async () => {
  try {
    const res = await axiosi.get("/brands");
    return res.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};

// ✅ Admin - all brands
export const fetchAllBrandsForAdmin = async () => {
  try {
    const res = await axiosi.get("/brands?all=true");
    return res.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};

// ✅ Get by ID
export const getBrandById = async (id) => {
  try {
    const res = await axiosi.get(`/brands/${id}`);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};

// ✅ Create
export const addBrand = async (data) => {
  try {
    const res = await axiosi.post("/brands", data);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};

// ✅ Update
export const updateBrandById = async (update) => {
  try {
    const res = await axiosi.patch(`/brands/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};

// ✅ Delete (Soft delete)
export const deleteBrandById = async (id) => {
  try {
    const res = await axiosi.delete(`/brands/${id}`);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};

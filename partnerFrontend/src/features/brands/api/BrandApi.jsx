import { axiosi } from "../../../config/axios";

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
export const addBrand = async (brandFormData) => {
  try {
    // Axios automatically sets Content-Type to multipart/form-data when passing FormData!
    const res = await axiosi.post("/brands", brandFormData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Update
export const updateBrandById = async (brandFormData) => {
  try {
    // Extract the ID from the FormData to build the URL
    const id = brandFormData.get("_id");
    const res = await axiosi.patch(`/brands/${id}`, brandFormData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
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

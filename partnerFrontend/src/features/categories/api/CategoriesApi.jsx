import { axiosi } from "../../../config/axios";

// Fetch all categories
export const fetchAllCategories = async () => {
  try {
    const res = await axiosi.get("/categories");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
};

// Fetch single category by ID
export const getCategoryById = async (id) => {
  try {
    const res = await axiosi.get(`/categories/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch category" };
  }
};

// Create a new category
export const addCategory = async (categoryFormData) => {
  try {
    // 🚨 FIX: Passes FormData directly
    const res = await axiosi.post("/categories", categoryFormData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create category" };
  }
};

// Update an existing category
export const updateCategoryById = async (categoryFormData) => {
  try {
    // 🚨 FIX: Extract ID from FormData
    const id = categoryFormData.get("_id");
    const res = await axiosi.patch(`/categories/${id}`, categoryFormData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update category" };
  }
};

// Soft delete category
export const deleteCategoryById = async (id) => {
  try {
    const res = await axiosi.delete(`/categories/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete category" };
  }
};

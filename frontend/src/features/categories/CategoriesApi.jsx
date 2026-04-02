import { axiosi } from "../../config/axios";

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
export const addCategory = async (data) => {
  try {
    const res = await axiosi.post("/categories", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create category" };
  }
};

// Update an existing category
export const updateCategoryById = async (update) => {
  try {
    // We separate the ID from the rest of the payload for the URL
    const { _id, ...rest } = update;
    const res = await axiosi.patch(`/categories/${_id}`, rest);
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

import { axiosi } from "../../../config/axios";

// --- CUSTOMER PROFILE APIs ---

export const fetchLoggedInUserById = async (id) => {
  try {
    // Correctly points to the protected /users endpoint for standard customers
    const res = await axiosi.get(`/users/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserById = async (update) => {
  try {
    // Correctly points to the protected /users endpoint for standard customers
    const res = await axiosi.patch(`/users/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};



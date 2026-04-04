import { axiosi } from "../../../config/axios";

export const fetchLoggedInUserById = async (id) => {
  try {
    const res = await axiosi.get(`/users/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserById = async (update) => {
  try {
    const res = await axiosi.patch(`/users/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- NEW ADMIN SPECIFIC APIs ---

export const fetchAllCustomers = async () => {
  try {
    // 🚨 FIX: Match the backend route exactly (/users/customers)
    const res = await axiosi.get("/users/customers");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCustomerById = async (update) => {
  try {
    // 🚨 FIX: The backend uses the generic /users/:id to update any user
    const res = await axiosi.patch(`/users/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchAllAdmins = async () => {
  try {
    // 🚨 FIX: Match the backend route exactly
    const res = await axiosi.get("/users/store-admins");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createStoreAdmin = async (adminData) => {
  try {
    // 🚨 FIX: Match the backend route exactly
    const res = await axiosi.post("/users/create-admin", adminData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

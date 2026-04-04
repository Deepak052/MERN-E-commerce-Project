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
    const res = await axiosi.get("/users/customers"); // Fixed to match your backend!
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCustomerById = async (update) => {
  try {
    const res = await axiosi.patch(`/users/${update._id}`, update); // Fixed to match your backend!
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchAllAdmins = async () => {
  try {
    const res = await axiosi.get("/users/store-admins"); // Fixed to match your backend!
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createStoreAdmin = async (adminData) => {
  try {
    const res = await axiosi.post("/users/create-admin", adminData); // Fixed to match your backend!
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

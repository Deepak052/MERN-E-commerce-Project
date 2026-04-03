import { axiosi } from "../../config/axios";

export const fetchLoggedInUserById = async (id) => {
  try {
    const res = await axiosi.get(`/users/${id}`);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const updateUserById = async (update) => {
  try {
    const res = await axiosi.patch(`/users/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// --- NEW ADMIN SPECIFIC APIs ---
export const fetchAllCustomers = async () => {
  try {
    const res = await axiosi.get("/admin/users");
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateCustomerById = async (update) => {
  try {
    const res = await axiosi.patch(`/admin/users/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const fetchAllAdmins = async () => {
  try {
    const res = await axiosi.get("/admin/users/store-admins");
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createStoreAdmin = async (adminData) => {
  try {
    const res = await axiosi.post("/admin/users/create-admin", adminData);
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
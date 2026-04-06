import axios from "axios";

console.log("MY BASE URL IS:", import.meta.env.VITE_BASE_URL);

export const axiosi = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();ch
  formData.append("image", file); 

  try {
    const res = await axiosi.post("api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.url;
  } catch (error) {
    throw error.response?.data || "Upload failed";
  }
};
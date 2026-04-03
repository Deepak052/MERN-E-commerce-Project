import { axiosi } from "../../../config/axios";

export const addProduct=async(data)=>{
    try {
        const res=await axiosi.post('/products',data)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const fetchProducts = async (filters) => {
  let queryParams = new URLSearchParams();

  // ✅ search
  if (filters.search) {
    queryParams.append("search", filters.search);
  }

  // ✅ brand (comma separated)
  if (filters.brand?.length) {
    queryParams.append("brand", filters.brand.join(","));
  }

  // ✅ category (comma separated)
  if (filters.category?.length) {
    queryParams.append("category", filters.category.join(","));
  }

  // ✅ price range
  if (filters.minPrice) {
    queryParams.append("minPrice", filters.minPrice);
  }
  if (filters.maxPrice) {
    queryParams.append("maxPrice", filters.maxPrice);
  }

  // ✅ pagination
  if (filters.pagination) {
    queryParams.append("page", filters.pagination.page);
    queryParams.append("limit", filters.pagination.limit);
  }

  // ✅ sorting
  if (filters.sort) {
    queryParams.append("sort", filters.sort.sort);
    queryParams.append("order", filters.sort.order);
  }

  // ✅ user/admin
  if (filters.user) {
    queryParams.append("user", true);
  }
  if (filters.admin) {
    queryParams.append("admin", true);
  }

  try {
    const res = await axiosi.get(`/products?${queryParams.toString()}`);

    // ❌ WRONG before
    // res.headers.get()

    // ✅ CORRECT
    const totalResults = res.headers["x-total-count"];

    return { data: res.data, totalResults };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const fetchProductById=async(id)=>{
    try {
        const res=await axiosi.get(`/products/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const updateProductById=async(update)=>{
    try {
        const res=await axiosi.patch(`/products/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const undeleteProductById=async(id)=>{
    try {
        const res=await axiosi.patch(`/products/undelete/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const deleteProductById=async(id)=>{
    try {
        const res=await axiosi.delete(`/products/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

//latest arrivals
export const fetchNewArrivals = async (limit = 10) => {
  try {
    const res = await axiosi.get(`/products/new-arrivals?limit=${limit}`);
    return res.data; // Returns the array of newest products
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

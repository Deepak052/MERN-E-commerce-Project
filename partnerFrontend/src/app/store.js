import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "../features/auth/slice/AuthSlice";
import ProductReducer from "../features/products/slice/ProductSlice";
import BrandReducer from "../features/brands/slice/BrandSlice";
import CategoryReducer from "../features/categories/slice/CategoriesSlice";
import OrderReducer from "../features/order/slice/OrderSlice"
import UserReducer from "../features/customers/slice/UserSlice";
import BannerReducer from "../features/banners/slice/BannerSlice";
import DashboardReducer from "../features/dashboard/slice/DashboardSlice";

// ❌ Removed CartSlice, WishlistSlice, AddressSlice, ReviewSlice

export const store = configureStore({
  reducer: {
    AuthSlice: AuthReducer,
    ProductSlice: ProductReducer,
    BrandSlice: BrandReducer,
    CategoriesSlice: CategoryReducer,
    OrderSlice: OrderReducer,
    UserSlice: UserReducer,
    BannerSlice: BannerReducer,
    DashboardSlice: DashboardReducer,
  },
});

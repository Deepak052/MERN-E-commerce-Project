import { configureStore } from "@reduxjs/toolkit";

// 🚨 FIX: All imports updated to point to their respective feature's 'slice' folder
import AuthSlice from "../features/auth/slice/AuthSlice";
import ProductSlice from "../features/products/slice/ProductSlice";
import UserSlice from "../features/profile/slice/UserSlice"; 
import BrandSlice from "../features/products/slice/BrandSlice";
import CartSlice from "../features/cart/slice/CartSlice";
import AddressSlice from "../features/profile/slice/AddressSlice";
import ReviewSlice from "../features/review/slice/ReviewSlice";
import OrderSlice from "../features/order/slice/OrderSlice";
import WishlistSlice from "../features/wishlist/slice/WishlistSlice";
import BannerSlice from "../features/banners/slice/BannerSlice";
import HomeSlice from "../features/home/slice/HomeSlice";
import categorySlice from "../features/products/slice/CategoriesSlice"
export const store = configureStore({
  reducer: {
    AuthSlice,
    ProductSlice,
    UserSlice,
    BrandSlice,
    categorySlice,
    CartSlice,
    AddressSlice,
    ReviewSlice,
    OrderSlice,
    WishlistSlice,
    BannerSlice,
    HomeSlice,
  },
});

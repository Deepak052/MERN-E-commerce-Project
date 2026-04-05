import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLoggedInAdmin,
  logoutAsync,
} from "../features/auth/slice/AuthSlice";
import { fetchAllCategoriesAsync } from "../features/categories/slice/CategoriesSlice";
import { fetchAllBrandsAsync } from "../features/brands/slice/BrandSlice";
import { fetchLoggedInUserByIdAsync } from "../features/customers/slice/UserSlice";

export const useFetchLoggedInUserDetails = () => {
  const loggedInUser = useSelector(selectLoggedInAdmin);
  const dispatch = useDispatch();

  useEffect(() => {
    // Note: Assuming Admins don't strictly use isVerified, or if they do, keep it.
    if (loggedInUser) {
      // 🚨 FIX: SECURITY Check using the 'role' string
      if (loggedInUser.role !== "Admin" && loggedInUser.role !== "SuperAdmin") {
        dispatch(logoutAsync());
        return;
      }

      // Fetch the full admin profile and global data needed for the dashboard
      dispatch(fetchLoggedInUserByIdAsync(loggedInUser._id));
      dispatch(fetchAllBrandsAsync());
      dispatch(fetchAllCategoriesAsync());
    }
  }, [loggedInUser, dispatch]);
};

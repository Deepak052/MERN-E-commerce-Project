import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLoggedInUser,
  logoutAsync,
} from "../features/auth/slice/AuthSlice";
import { fetchAllCategoriesAsync } from "../features/categories/slice/CategoriesSlice";
import { fetchAllBrandsAsync } from "../features/brands/slice/BrandSlice";
import { fetchLoggedInUserByIdAsync } from "../features/customers/slice/UserSlice";

export const useFetchLoggedInUserDetails = () => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (loggedInUser && loggedInUser?.isVerified) {
      // SECURITY: If a normal customer accidentally logs into the Admin Panel, kick them out
      if (!loggedInUser.isAdmin && !loggedInUser.isSuperAdmin) {
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

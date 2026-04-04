import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// 🚨 FIX: All imports updated to match the new FSD Architecture
import { selectLoggedInUser } from "../../features/auth/slice/AuthSlice";
import { fetchAddressByUserIdAsync } from "../../features/profile/slice/AddressSlice";
import { fetchWishlistByUserIdAsync } from "../../features/wishlist/slice/WishlistSlice";
import { fetchCartByUserIdAsync } from "../../features/cart/slice/CartSlice";
import { fetchAllCategoriesAsync } from "../../features/products/slice/CategoriesSlice";
import { fetchAllBrandsAsync } from "../../features/products/slice/BrandSlice";
import { fetchLoggedInUserByIdAsync } from "../../features/profile/slice/UserSlice";

export const useFetchLoggedInUserDetails = (deps) => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const dispatch = useDispatch();

  useEffect(() => {
    /* When a user is logged in, this dispatches actions to get all details, 
           as login/signup only returns bare-minimum information from the server */
    if (deps && loggedInUser?.isVerified) {
      dispatch(fetchLoggedInUserByIdAsync(loggedInUser?._id));
      dispatch(fetchAllBrandsAsync());
      dispatch(fetchAllCategoriesAsync());

      if (!loggedInUser.isAdmin) {
        dispatch(fetchCartByUserIdAsync(loggedInUser?._id));
        dispatch(fetchAddressByUserIdAsync(loggedInUser?._id));
        dispatch(fetchWishlistByUserIdAsync(loggedInUser?._id));
      }
    }
  }, [deps, loggedInUser, dispatch]);
};

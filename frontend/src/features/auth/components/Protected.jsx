import { useSelector } from "react-redux";
import { selectLoggedInUser, selectIsAuthChecked } from "../slice/AuthSlice";
import { Navigate } from "react-router-dom";

export const Protected = ({ children }) => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  if (!isAuthChecked) return null;

  // 1. If not logged in at all, go to login
  if (!loggedInUser) {
    return <Navigate to="/login" replace={true} />;
  }

  // 2. If logged in but NOT verified, force them to OTP page
  if (!loggedInUser.isVerified) {
    return <Navigate to="/verify-otp" replace={true} />;
  }

  // 3. User is fully authenticated & verified
  return children;
};

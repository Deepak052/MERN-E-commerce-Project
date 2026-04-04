import { useSelector } from "react-redux";
import { selectLoggedInUser, selectIsAuthChecked } from "../slice/AuthSlice";
import { Navigate } from "react-router-dom";

export const Protected = ({ children, adminOnly = false }) => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  // ✅ Never redirect until auth is fully resolved
  if (!isAuthChecked) return null;

  if (!loggedInUser?.isVerified) {
    return <Navigate to="/login" replace={true} />;
  }

  if (adminOnly && !loggedInUser?.isAdmin) {
    return <Navigate to="/" replace={true} />;
  }

  return children;
};

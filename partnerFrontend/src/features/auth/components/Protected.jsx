import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectLoggedInUser, selectIsAuthChecked } from "../slice/AuthSlice";

export const Protected = ({ children, superAdminOnly = false }) => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  // Wait for the backend checkAuth to finish before making routing decisions
  if (!isAuthChecked) return null;

  // If not logged in, boot to login page
  if (!loggedInUser) {
    return <Navigate to="/login" replace={true} />;
  }

  // Ensure they are an admin
  if (!loggedInUser.isAdmin && !loggedInUser.isSuperAdmin) {
    return <Navigate to="/login" replace={true} />;
  }

  // For routes that ONLY the agency owner (SuperAdmin) should see (like managing other admins)
  if (superAdminOnly && !loggedInUser.isSuperAdmin) {
    return <Navigate to="/" replace={true} />;
  }

  return children;
};

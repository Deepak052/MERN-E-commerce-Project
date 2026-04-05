import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectLoggedInAdmin, selectIsAuthChecked } from "../slice/AuthSlice";

export const Protected = ({ children }) => {
  const loggedInUser = useSelector(selectLoggedInAdmin);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  if (!isAuthChecked) return null;

  if (!loggedInUser) {
    return <Navigate to="/login" replace={true} />;
  }

  // 🚨 FIX: Strict check for just "Admin"
  if (loggedInUser.role !== "Admin") {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};

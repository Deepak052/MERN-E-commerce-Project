import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutAsync, selectLoggedInAdmin } from "../slice/AuthSlice"; // 🚨 FIX
import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const dispatch = useDispatch();
  const loggedInAdmin = useSelector(selectLoggedInAdmin); // 🚨 FIX
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logoutAsync());
  }, [dispatch]);

  useEffect(() => {
    if (!loggedInAdmin) {
      navigate("/login");
    }
  }, [loggedInAdmin, navigate]);

  return null; // Better than returning <></>
};

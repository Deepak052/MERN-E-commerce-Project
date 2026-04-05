import React, { useEffect } from "react";
import {
  Box,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import LoadingButton from "@mui/lab/LoadingButton";

import {
  selectLoggedInAdmin, 
  loginAdminAsync, 
  selectAuthStatus,
  selectAuthErrors,
  resetAuthStatus,
} from "../slice/AuthSlice";

import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

const Login = () => {
  const dispatch = useDispatch();
    const status = useSelector(selectAuthStatus);
    const error = useSelector(selectAuthErrors);
    const loggedInAdmin = useSelector(selectLoggedInAdmin);
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const theme = useTheme();
    const is480 = useMediaQuery(theme.breakpoints.down(480));
  
    // 1. Fix Navigation Logic for Multi-Tenant Architecture
    useEffect(() => {
      if (loggedInAdmin) {
        // 🚨 FIX: Check 'role' string instead of 'isAdmin' boolean
        if (loggedInAdmin.role === "Admin" || loggedInAdmin.role === "SuperAdmin") {
          navigate("/");
        } else {
          // This case should technically be impossible with your new backend separation,
          // but it's good for safety.
          toast.error("Unauthorized. Partner access required.");
        }
      }
    }, [loggedInAdmin, navigate]);
  
    // 2. Fix Success Handling & Typo
    useEffect(() => {
      // 🚨 FIX: Changed "fullfilled" to "fulfilled"
      if (status === "fulfilled" && loggedInAdmin) {
        toast.success(`Welcome back, ${loggedInAdmin.name}`);
        reset();
      }
    }, [status, loggedInAdmin, reset]);
  
    // 3. Fix Error Handling & Cleanup
    useEffect(() => {
      if (error) {
        toast.error(error.message || "Login failed");
      }
      return () => {
        dispatch(resetAuthStatus());
      };
    }, [error, dispatch]);
  
    const handleLogin = (data) => {
      dispatch(loginAdminAsync(data)); // 🚨 Calling Admin-specific thunk
    };

  return (
    <Stack
      width={"100vw"}
      height={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
      bgcolor="#f4f5f7"
    >
      <Stack
        bgcolor="white"
        p={4}
        borderRadius={3}
        boxShadow="0 4px 20px rgba(0,0,0,0.05)"
        border="1px solid #e5e7eb"
        alignItems="center"
      >
        <AdminPanelSettingsRoundedIcon
          sx={{ fontSize: 48, color: "#6366f1", mb: 1 }}
        />

        <Typography variant="h5" fontWeight={800} color="#111827">
          Partner Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Sign in to manage your store
        </Typography>

        <Stack
          spacing={2.5}
          width={is480 ? "100%" : "22rem"}
          component={"form"}
          noValidate
          onSubmit={handleSubmit(handleLogin)}
        >
          <motion.div whileHover={{ y: -2 }}>
            <TextField
              fullWidth
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                  message: "Enter a valid email",
                },
              })}
              placeholder="Admin Email"
            />
            {errors.email && (
              <FormHelperText sx={{ mt: 1 }} error>
                {errors.email.message}
              </FormHelperText>
            )}
          </motion.div>

          <motion.div whileHover={{ y: -2 }}>
            <TextField
              type="password"
              fullWidth
              {...register("password", { required: "Password is required" })}
              placeholder="Password"
            />
            {errors.password && (
              <FormHelperText sx={{ mt: 1 }} error>
                {errors.password.message}
              </FormHelperText>
            )}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton
              fullWidth
              sx={{ height: "2.8rem", bgcolor: "#6366f1", fontWeight: 700 }}
              loading={status === "pending"}
              type="submit"
              variant="contained"
            >
              Sign In
            </LoadingButton>
          </motion.div>

          <Box textAlign="center" mt={1}>
            <Typography
              variant="body2"
              sx={{ textDecoration: "none", color: "#6366f1", fontWeight: 600 }}
              component={Link}
              to={"/forgot-password"}
            >
              Forgot password?
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Login;

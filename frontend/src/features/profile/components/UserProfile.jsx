import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Avatar,
  Button,
  Paper,
  Stack,
  Typography,
  useTheme,
  TextField,
  useMediaQuery,
  Box,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";

// Redux
import { selectUserInfo } from "../slice/UserSlice";
import {
  addAddressAsync,
  resetAddressAddStatus,
  resetAddressDeleteStatus,
  resetAddressUpdateStatus,
  selectAddressAddStatus,
  selectAddressDeleteStatus,
  selectAddressStatus,
  selectAddressUpdateStatus,
  selectAddresses,
} from "../slice/AddressSlice";
import { Address } from "../pages/Address"; 

// UI Constants for consistency
const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
  border: "1px solid #e5e7eb",
  shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  radius: 3,
};

export const UserProfile = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const is900 = useMediaQuery(theme.breakpoints.down("md"));
  const is480 = useMediaQuery(theme.breakpoints.down("sm"));

  const status = useSelector(selectAddressStatus);
  const userInfo = useSelector(selectUserInfo);
  const addresses = useSelector(selectAddresses) || [];

  const addressAddStatus = useSelector(selectAddressAddStatus);
  const addressUpdateStatus = useSelector(selectAddressUpdateStatus);
  const addressDeleteStatus = useSelector(selectAddressDeleteStatus);

  const [addAddress, setAddAddress] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Toast Notifications & Reset Handlers
  useEffect(() => {
    if (addressAddStatus === "fulfilled") {
      toast.success("Address added successfully");
      setAddAddress(false);
      reset();
    } else if (addressAddStatus === "rejected") {
      toast.error("Failed to add address. Please try again.");
    }
  }, [addressAddStatus, reset]);

  useEffect(() => {
    if (addressUpdateStatus === "fulfilled") {
      toast.success("Address updated successfully");
    } else if (addressUpdateStatus === "rejected") {
      toast.error("Failed to update address.");
    }
  }, [addressUpdateStatus]);

  useEffect(() => {
    if (addressDeleteStatus === "fulfilled") {
      toast.success("Address removed");
    } else if (addressDeleteStatus === "rejected") {
      toast.error("Failed to remove address.");
    }
  }, [addressDeleteStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetAddressAddStatus());
      dispatch(resetAddressUpdateStatus());
      dispatch(resetAddressDeleteStatus());
    };
  }, [dispatch]);

  const handleAddAddress = (data) => {
    const address = { ...data, user: userInfo._id };
    dispatch(addAddressAsync(address));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: UI.bg,
        py: { xs: 4, md: 8 },
        px: { xs: 2, sm: 4 },
      }}
    >
      <Stack alignItems="center" mx="auto" maxWidth="800px" spacing={4}>
        {/* ========================================== */}
        {/* 👤 PROFILE HEADER CARD */}
        {/* ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: "100%" }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: UI.radius,
              border: UI.border,
              boxShadow: UI.shadow,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Decorative Banner */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "80px",
                background: `linear-gradient(90deg, ${UI.primary} 0%, #818cf8 100%)`,
              }}
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ xs: "center", sm: "flex-end" }}
              mt={2}
              position="relative"
              zIndex={1}
            >
              <Avatar
                src="none"
                alt={userInfo?.name}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  bgcolor: "#ffffff",
                  color: UI.primary,
                  border: "4px solid white",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              >
                {userInfo?.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>

              <Box textAlign={{ xs: "center", sm: "left" }} pb={1}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color={UI.textMain}
                  letterSpacing="-0.5px"
                >
                  {userInfo?.name}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent={{ xs: "center", sm: "flex-start" }}
                  spacing={1}
                  mt={0.5}
                >
                  <EmailOutlinedIcon
                    sx={{ fontSize: 18, color: UI.textSecondary }}
                  />
                  <Typography
                    variant="body1"
                    color={UI.textSecondary}
                    fontWeight={500}
                  >
                    {userInfo?.email}
                  </Typography>
                </Stack>
              </Box>

              <Box flexGrow={1} />

              {/* Role Badge */}
              <Chip
                icon={
                  <PersonOutlineRoundedIcon
                    sx={{ fontSize: "16px !important" }}
                  />
                }
                label={
                  userInfo?.role === "admin" ? "Admin Account" : "Customer"
                }
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, border: "none", bgcolor: "#eff6ff" }}
              />
            </Stack>
          </Paper>
        </motion.div>

        {/* ========================================== */}
        {/* 📍 ADDRESS MANAGEMENT SECTION */}
        {/* ========================================== */}
        <Box width="100%">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box>
              <Typography variant="h5" fontWeight={800} color={UI.textMain}>
                Saved Addresses
              </Typography>
              <Typography variant="body2" color={UI.textSecondary}>
                Manage your delivery and billing addresses
              </Typography>
            </Box>
            {!addAddress && (
              <Button
                onClick={() => setAddAddress(true)}
                variant="contained"
                startIcon={<AddLocationAltRoundedIcon />}
                sx={{
                  bgcolor: UI.primary,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                {is480 ? "Add" : "Add Address"}
              </Button>
            )}
          </Stack>

          {/* --- ADD ADDRESS FORM (Animated Collapse) --- */}
          <AnimatePresence>
            {addAddress && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden", marginBottom: "24px" }}
              >
                <Paper
                  elevation={0}
                  component="form"
                  noValidate
                  onSubmit={handleSubmit(handleAddAddress)}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: UI.radius,
                    border: `2px solid ${UI.primary}`,
                    boxShadow: UI.shadow,
                  }}
                >
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    Add New Address
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Row 1 */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Address Type"
                        placeholder="e.g., Home, Office"
                        {...register("type", {
                          required: "Address type is required",
                        })}
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="text"
                        label="Phone Number"
                        placeholder="e.g., 9876543210"
                        {...register("phoneNumber", {
                          required: "Phone number is required",
                        })}
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {/* Row 2 */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        placeholder="123 Main St, Apt 4B"
                        {...register("street", {
                          required: "Street is required",
                        })}
                        error={!!errors.street}
                        helperText={errors.street?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {/* Row 3 */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="City"
                        {...register("city", { required: "City is required" })}
                        error={!!errors.city}
                        helperText={errors.city?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="State/Province"
                        {...register("state", {
                          required: "State is required",
                        })}
                        error={!!errors.state}
                        helperText={errors.state?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Postal Code"
                        {...register("postalCode", {
                          required: "Postal code is required",
                        })}
                        error={!!errors.postalCode}
                        helperText={errors.postalCode?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {/* Row 4 */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Country"
                        {...register("country", {
                          required: "Country is required",
                        })}
                        error={!!errors.country}
                        helperText={errors.country?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Stack direction="row" justifyContent="flex-end" spacing={2}>
                    <Button
                      color="inherit"
                      onClick={() => {
                        setAddAddress(false);
                        reset();
                      }}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      loading={status === "pending"}
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: UI.primary,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      Save Address
                    </LoadingButton>
                  </Stack>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- RENDER EXISTING ADDRESSES --- */}
          <Stack spacing={2}>
            {addresses.length > 0 ? (
              <AnimatePresence>
                {addresses.map((address, index) => (
                  <motion.div
                    key={address._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Address
                      id={address._id}
                      city={address.city}
                      country={address.country}
                      phoneNumber={address.phoneNumber}
                      postalCode={address.postalCode}
                      state={address.state}
                      street={address.street}
                      type={address.type}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              /* EMPTY STATE */
              !addAddress && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: UI.radius,
                    border: `2px dashed #d1d5db`,
                    bgcolor: "transparent",
                  }}
                >
                  <HomeWorkOutlinedIcon
                    sx={{ fontSize: 60, color: "#9ca3af", mb: 1 }}
                  />
                  <Typography variant="h6" fontWeight={700} color={UI.textMain}>
                    No addresses saved
                  </Typography>
                  <Typography variant="body2" color={UI.textSecondary} mb={3}>
                    Add an address so you can check out faster next time.
                  </Typography>
                  <Button
                    onClick={() => setAddAddress(true)}
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Add your first address
                  </Button>
                </Paper>
              )
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

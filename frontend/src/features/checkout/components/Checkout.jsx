import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stack,
  TextField,
  Typography,
  Button,
  Grid,
  Radio,
  Paper,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  MenuItem,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

// Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";

// 🚨 FIX: Corrected Cross-Feature Imports
import {
  addAddressAsync,
  selectAddressStatus,
  selectAddresses,
} from "../../profile/slice/AddressSlice";
import { selectLoggedInUser } from "../../auth/slice/AuthSlice";
import {
  createOrderAsync,
  verifyAndCreateOrderAsync,
  selectCurrentOrder,
  selectOrderStatus,
} from "../../order/slice/OrderSlice";
import {
  resetCartByUserIdAsync,
  selectCartItems,
} from "../../cart/slice/CartSlice";
import { createRazorpayOrderSession } from "../../order/api/OrderApi";
import { Cart } from "../../cart/components/Cart";
import { SHIPPING, TAXES } from "../../../constants/constants";

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
  border: "1px solid #e5e7eb",
  shadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  radius: 3,
};

// Load Razorpay Script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Checkout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Setup React Hook Form with mode="onTouched" for real-time validation UI
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
  });

  const addresses = useSelector(selectAddresses) || [];
  const loggedInUser = useSelector(selectLoggedInUser);
  const addressStatus = useSelector(selectAddressStatus);
  const cartItems = useSelector(selectCartItems) || [];
  const orderStatus = useSelector(selectOrderStatus);
  const currentOrder = useSelector(selectCurrentOrder);

  // State
  const [selectedAddress, setSelectedAddress] = useState(addresses[0] || null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ONLINE");
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(
    addresses.length === 0,
  );

  // Calculate Totals dynamically
  const orderSubtotal = cartItems.reduce((acc, item) => {
    const itemPrice =
      item.product.basePrice *
      (1 - (item.product.discountPercentage || 0) / 100);
    return itemPrice * item.quantity + acc;
  }, 0);
  const finalTotal = orderSubtotal + SHIPPING + TAXES;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle successful address addition
  useEffect(() => {
    if (addressStatus === "fulfilled") {
      reset();
      setIsAddingAddress(false);
      // Auto-select the newly added address
      if (addresses.length > 0) {
        setSelectedAddress(addresses[addresses.length - 1]);
      }
    } else if (addressStatus === "rejected") {
      toast.error("Error adding your address. Please check your details.");
    }
  }, [addressStatus, reset, addresses]);

  // Triggers redirect when an order is successfully created
  useEffect(() => {
    if (currentOrder && currentOrder?._id) {
      // 🚨 FIX: We don't need to pass the userId anymore because the backend reads the secure token!
      dispatch(resetCartByUserIdAsync());
      navigate(`/order-success/${currentOrder?._id}`);
    }
  }, [currentOrder, dispatch, navigate]);

  const handleAddAddress = (data) => {
    if (!data.type || !data.street || !data.phoneNumber) {
      return toast.error("Please fill in all required fields.");
    }
    const address = { ...data, user: loggedInUser._id };
    dispatch(addAddressAsync(address));
  };

  const handleCreateOrder = async () => {
    if (addresses.length === 0)
      return toast.error("Please add a delivery address first.");
    if (!selectedAddress)
      return toast.error("Please select a shipping address.");
    if (cartItems.length === 0) return toast.error("Your cart is empty.");

    const baseOrderData = {
      user: loggedInUser._id,
      item: cartItems,
      address: selectedAddress,
      paymentMode: selectedPaymentMethod,
      total: finalTotal,
    };

    if (selectedPaymentMethod === "COD") {
      dispatch(
        createOrderAsync({ ...baseOrderData, paymentStatus: "Pending" }),
      );
    } else if (selectedPaymentMethod === "ONLINE") {
      setIsRazorpayLoading(true);
      const res = await loadRazorpayScript();

      if (!res) {
        setIsRazorpayLoading(false);
        return toast.error(
          "Failed to load Razorpay SDK. Check your internet connection.",
        );
      }

      try {
        const razorpayOrder = await createRazorpayOrderSession({
          totalAmount: Math.round(finalTotal),
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "MERN SHOP",
          description: "Secure Payment",
          order_id: razorpayOrder.id,
          handler: async function (response) {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: baseOrderData,
            };
            dispatch(verifyAndCreateOrderAsync(verificationData));
          },
          prefill: {
            name: loggedInUser.name || "Customer",
            email: loggedInUser.email,
            contact: selectedAddress.phoneNumber || "",
          },
          theme: { color: UI.primary },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

        paymentObject.on("payment.failed", function (response) {
          toast.error("Payment Failed or Cancelled");
        });
      } catch (err) {
        toast.error("Could not initiate payment process");
        console.error(err);
      } finally {
        setIsRazorpayLoading(false);
      }
    }
  };

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: "100vh", py: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <IconButton
            component={Link}
            to={"/cart"}
            sx={{
              bgcolor: UI.cardBg,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography
            variant="h4"
            fontWeight={800}
            color={UI.textMain}
            letterSpacing="-0.5px"
          >
            Secure Checkout
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 4, lg: 6 }}>
          {/* --- LEFT COLUMN: Address & Payment --- */}
          <Grid item xs={12} md={7} lg={7}>
            <Stack spacing={4}>
              {/* ADDRESS SECTION */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocalShippingOutlinedIcon sx={{ color: UI.primary }} />
                    <Typography variant="h6" fontWeight={800}>
                      Shipping Address
                    </Typography>
                  </Stack>
                  {!isAddingAddress && (
                    <Button
                      size="small"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => setIsAddingAddress(true)}
                      sx={{ fontWeight: 600, textTransform: "none" }}
                    >
                      Add New
                    </Button>
                  )}
                </Stack>

                {/* Existing Addresses */}
                {!isAddingAddress && addresses.length > 0 && (
                  <Grid container spacing={2}>
                    {addresses.map((address) => {
                      const isSelected = selectedAddress?._id === address._id;
                      return (
                        <Grid item xs={12} sm={6} key={address._id}>
                          <motion.div
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Paper
                              elevation={0}
                              onClick={() => setSelectedAddress(address)}
                              sx={{
                                p: 2.5,
                                cursor: "pointer",
                                borderRadius: 2,
                                border: "2px solid",
                                borderColor: isSelected
                                  ? UI.primary
                                  : "#e5e7eb",
                                bgcolor: isSelected ? "#eff6ff" : UI.cardBg,
                                position: "relative",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isSelected && (
                                <CheckCircleRoundedIcon
                                  sx={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,
                                    color: UI.primary,
                                    fontSize: 20,
                                  }}
                                />
                              )}
                              <Typography
                                fontWeight={800}
                                mb={1}
                                color={isSelected ? UI.primary : UI.textMain}
                              >
                                {address.type}
                              </Typography>
                              <Typography
                                variant="body2"
                                color={UI.textSecondary}
                                lineHeight={1.6}
                              >
                                {address.street}
                                <br />
                                {address.city}, {address.state}{" "}
                                {address.postalCode}
                                <br />
                                {address.country}
                                <br />
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: UI.textMain,
                                    marginTop: "8px",
                                    display: "block",
                                  }}
                                >
                                  Phone: {address.phoneNumber}
                                </span>
                              </Typography>
                            </Paper>
                          </motion.div>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                {/* Add New Address Form (Animated & Validated) */}
                <AnimatePresence>
                  {isAddingAddress && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <Box
                        sx={{
                          mt: addresses.length > 0 ? 3 : 0,
                          p: 3,
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                          border: "1px dashed #cbd5e1",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={700} mb={2}>
                          Enter New Delivery Address
                        </Typography>

                        <Stack
                          component="form"
                          noValidate
                          spacing={2.5}
                          onSubmit={handleSubmit(handleAddAddress)}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                select
                                fullWidth
                                label="Address Type"
                                defaultValue=""
                                {...register("type", {
                                  required: "Address type is required",
                                })}
                                error={!!errors.type}
                                helperText={errors.type?.message}
                                SelectProps={{
                                  displayEmpty: true,
                                }}
                                sx={{
                                  "& .MuiSelect-select": {
                                    padding: "14px",
                                  },
                                }}
                              >
                                <MenuItem value="" disabled>
                                  Select Address Type
                                </MenuItem>
                                <MenuItem value="Home">Home</MenuItem>
                                <MenuItem value="Office">Office</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                              </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                type="text"
                                label="Phone Number"
                                {...register("phoneNumber", {
                                  required: "Phone number is required",
                                  pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message:
                                      "Enter a valid 10-digit Indian phone number",
                                  },
                                })}
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber?.message}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Street Address"
                                {...register("street", {
                                  required: "Street address is required",
                                  minLength: {
                                    value: 5,
                                    message: "Minimum 5 characters required",
                                  },
                                })}
                                error={!!errors.street}
                                helperText={errors.street?.message}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="City"
                                {...register("city", {
                                  required: "City is required",
                                  pattern: {
                                    value: /^[A-Za-z\s]+$/,
                                    message: "Only alphabets are allowed",
                                  },
                                })}
                                error={!!errors.city}
                                helperText={errors.city?.message}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="State"
                                {...register("state", {
                                  required: "State is required",
                                  pattern: {
                                    value: /^[A-Za-z\s]+$/,
                                    message: "Only alphabets are allowed",
                                  },
                                })}
                                error={!!errors.state}
                                helperText={errors.state?.message}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                type="text"
                                label="Postal Code (PIN)"
                                {...register("postalCode", {
                                  required: "Postal code is required",
                                  pattern: {
                                    value: /^[1-9][0-9]{5}$/,
                                    message: "Enter a valid 6-digit PIN code",
                                  },
                                })}
                                error={!!errors.postalCode}
                                helperText={errors.postalCode?.message}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Country"
                                {...register("country", {
                                  required: "Country is required",
                                })}
                                error={!!errors.country}
                                helperText={errors.country?.message}
                              />
                            </Grid>
                          </Grid>

                          <Stack
                            direction="row"
                            justifyContent="flex-end"
                            spacing={2}
                            mt={1}
                          >
                            {addresses.length > 0 && (
                              <Button
                                color="inherit"
                                onClick={() => {
                                  setIsAddingAddress(false);
                                  reset();
                                }}
                                sx={{ fontWeight: 600, textTransform: "none" }}
                              >
                                Cancel
                              </Button>
                            )}
                            <LoadingButton
                              loading={addressStatus === "pending"}
                              type="submit"
                              variant="contained"
                              sx={{
                                px: 4,
                                borderRadius: 2,
                                fontWeight: 700,
                                bgcolor: UI.primary,
                              }}
                            >
                              Save Address
                            </LoadingButton>
                          </Stack>
                        </Stack>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Paper>

              {/* PAYMENT SECTION */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Stack direction="row" spacing={1.5} mb={3} alignItems="center">
                  <PaymentOutlinedIcon sx={{ color: UI.primary }} />
                  <Typography variant="h6" fontWeight={800}>
                    Payment Method
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ height: "100%" }}
                    >
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedPaymentMethod("ONLINE")}
                        sx={{
                          p: 2.5,
                          height: "100%",
                          border: "2px solid",
                          cursor: "pointer",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          borderColor:
                            selectedPaymentMethod === "ONLINE"
                              ? UI.primary
                              : "#e5e7eb",
                          bgcolor:
                            selectedPaymentMethod === "ONLINE"
                              ? "#eff6ff"
                              : UI.cardBg,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          mb={1}
                        >
                          <CreditCardOutlinedIcon
                            sx={{
                              color:
                                selectedPaymentMethod === "ONLINE"
                                  ? UI.primary
                                  : UI.textSecondary,
                            }}
                          />
                          <Typography
                            fontWeight={800}
                            color={
                              selectedPaymentMethod === "ONLINE"
                                ? UI.primary
                                : UI.textMain
                            }
                          >
                            Pay Online
                          </Typography>
                          <Radio
                            checked={selectedPaymentMethod === "ONLINE"}
                            sx={{ ml: "auto !important", p: 0 }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          color={UI.textSecondary}
                          display="block"
                          ml={5}
                        >
                          Cards, UPI, NetBanking powered securely by Razorpay
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ height: "100%" }}
                    >
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedPaymentMethod("COD")}
                        sx={{
                          p: 2.5,
                          height: "100%",
                          border: "2px solid",
                          cursor: "pointer",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          borderColor:
                            selectedPaymentMethod === "COD"
                              ? UI.primary
                              : "#e5e7eb",
                          bgcolor:
                            selectedPaymentMethod === "COD"
                              ? "#eff6ff"
                              : UI.cardBg,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          mb={1}
                        >
                          <AccountBalanceWalletOutlinedIcon
                            sx={{
                              color:
                                selectedPaymentMethod === "COD"
                                  ? UI.primary
                                  : UI.textSecondary,
                            }}
                          />
                          <Typography
                            fontWeight={800}
                            color={
                              selectedPaymentMethod === "COD"
                                ? UI.primary
                                : UI.textMain
                            }
                          >
                            Cash on Delivery
                          </Typography>
                          <Radio
                            checked={selectedPaymentMethod === "COD"}
                            sx={{ ml: "auto !important", p: 0 }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          color={UI.textSecondary}
                          display="block"
                          ml={5}
                        >
                          Pay with cash or UPI when your order arrives
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* --- RIGHT COLUMN: Order Summary --- */}
          <Grid item xs={12} md={5} lg={5}>
            <Box sx={{ position: "sticky", top: 24 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h5" fontWeight={800} mb={3}>
                  Order Summary
                </Typography>

                {/* The existing Cart component configured for checkout layout */}
                <Box sx={{ mb: 3 }}>
                  <Cart checkout={true} />
                </Box>

                <LoadingButton
                  fullWidth
                  disabled={
                    cartItems.length === 0 ||
                    !selectedAddress ||
                    orderStatus === "pending" ||
                    isRazorpayLoading
                  }
                  loading={orderStatus === "pending" || isRazorpayLoading}
                  variant="contained"
                  onClick={handleCreateOrder}
                  size="large"
                  sx={{
                    py: 1.8,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    borderRadius: 2,
                    bgcolor: UI.primary,
                    textTransform: "none",
                    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
                    "&:hover": { bgcolor: "#4f46e5" },
                    "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
                  }}
                >
                  {selectedPaymentMethod === "ONLINE"
                    ? "Pay Securely Now"
                    : "Confirm COD Order"}
                </LoadingButton>

                {!selectedAddress &&
                  !isAddingAddress &&
                  addresses.length === 0 && (
                    <Typography
                      variant="caption"
                      color="error"
                      display="block"
                      textAlign="center"
                      mt={2}
                      fontWeight={600}
                    >
                      * You must add a delivery address to place an order.
                    </Typography>
                  )}

                {/* Trust Badges */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  mt={4}
                >
                  <SecurityRoundedIcon
                    sx={{ color: "#10b981", fontSize: 18 }}
                  />
                  <Typography
                    variant="caption"
                    color={UI.textSecondary}
                    fontWeight={600}
                  >
                    Secure & Encrypted Payment
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

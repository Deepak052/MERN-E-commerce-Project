import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import LottieComponent from "lottie-react";

// Icons
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

// 🚨 FIX: Corrected Cross-Feature Imports
import { resetCurrentOrder, selectCurrentOrder } from "../slice/OrderSlice";
import { selectUserInfo } from "../../profile/slice/UserSlice";
import { orderSuccessAnimation } from "../../../assets";

const Lottie = LottieComponent.default || LottieComponent;

const UI = {
  bg: "#f4f5f7",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
};

export const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const currentOrder = useSelector(selectCurrentOrder);
  const userDetails = useSelector(selectUserInfo);
  const { id } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // If the page is refreshed and currentOrder is lost, redirect to home
    if (!currentOrder) {
      navigate("/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentOrder, navigate]);

  if (!currentOrder) return null;

  // Format the raw MongoDB ID into a clean, professional looking Order Number
  const shortOrderId = currentOrder._id
    ? currentOrder._id.slice(-6).toUpperCase()
    : "XXXXXX";
  const shippingAddress =
    currentOrder.address && currentOrder.address.length > 0
      ? currentOrder.address[0]
      : null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: UI.bg,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: { xs: 4, md: 10 },
        pb: 10,
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "600px" }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative Top Border */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              bgcolor: "#10b981",
            }}
          />

          <Stack alignItems="center" spacing={3} textAlign="center">
            {/* Lottie Animation */}
            <Box width="12rem" height="12rem" mt={-2}>
              <Lottie animationData={orderSuccessAnimation} loop={false} />
            </Box>

            {/* Success Messaging */}
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                color={UI.textMain}
                gutterBottom
                letterSpacing="-0.5px"
              >
                Payment Successful!
              </Typography>
              <Typography
                variant="body1"
                color={UI.textSecondary}
                lineHeight={1.6}
              >
                Thank you for your order,{" "}
                <span style={{ fontWeight: 700, color: UI.textMain }}>
                  {userDetails?.name?.split(" ")[0]}
                </span>
                ! <br />
                We are currently processing it and will email you a confirmation
                shortly.
              </Typography>
            </Box>

            {/* Order Summary Card */}
            <Box
              sx={{
                width: "100%",
                bgcolor: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: 3,
                p: 3,
                mt: 2,
                textAlign: "left",
              }}
            >
              <Grid container spacing={3}>
                {/* Order Number & Amount */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <ReceiptLongOutlinedIcon
                      sx={{ color: UI.primary, fontSize: 20 }}
                    />
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={UI.textMain}
                    >
                      Order Details
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color={UI.textSecondary}>
                    Order Number:{" "}
                    <span style={{ fontWeight: 700, color: UI.textMain }}>
                      #ORD-{shortOrderId}
                    </span>
                  </Typography>
                  <Typography variant="body2" color={UI.textSecondary}>
                    Total Amount:{" "}
                    <span style={{ fontWeight: 700, color: UI.textMain }}>
                      ₹{currentOrder.total?.toFixed(2)}
                    </span>
                  </Typography>
                  <Typography variant="body2" color={UI.textSecondary}>
                    Payment:{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          currentOrder.paymentMode === "ONLINE"
                            ? "#10b981"
                            : UI.textMain,
                      }}
                    >
                      {currentOrder.paymentMode === "ONLINE"
                        ? "Paid Online"
                        : "Cash on Delivery"}
                    </span>
                  </Typography>
                </Grid>

                {/* Shipping Info */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <LocalShippingOutlinedIcon
                      sx={{ color: UI.primary, fontSize: 20 }}
                    />
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={UI.textMain}
                    >
                      Delivering To
                    </Typography>
                  </Stack>
                  {shippingAddress ? (
                    <Typography
                      variant="body2"
                      color={UI.textSecondary}
                      lineHeight={1.5}
                    >
                      {shippingAddress.street}
                      <br />
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.postalCode}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color={UI.textSecondary}>
                      Address not provided
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* Action Buttons */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              width="100%"
              pt={1}
            >
              <Button
                component={Link}
                to="/user-orders" // 🚨 Updated Link to match the standard route
                onClick={() => dispatch(resetCurrentOrder())}
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  bgcolor: UI.primary,
                  fontWeight: 700,
                  textTransform: "none",
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
                }}
              >
                Track My Order
              </Button>
              <Button
                component={Link}
                to="/"
                onClick={() => dispatch(resetCurrentOrder())}
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  color: UI.textMain,
                  borderColor: "#d1d5db",
                  fontWeight: 700,
                  textTransform: "none",
                  py: 1.5,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#f9fafb", borderColor: "#9ca3af" },
                }}
              >
                Continue Shopping
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

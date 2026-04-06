import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Divider,
  Grid,
  Button,
  Chip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import {
  getOrderByIdAsync,
  selectCurrentOrder,
  selectOrderFetchStatus,
  clearCurrentOrder,
} from "../slice/OrderSlice";
import LottieComponent from "lottie-react";
import { loadingAnimation } from "../../../assets";

const Lottie = LottieComponent.default || LottieComponent;
const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  radius: 3,
  border: "1px solid #e5e7eb",
};

export const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderFetchStatus);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (id) dispatch(getOrderByIdAsync(id));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, id]);

  if (status === "pending" || !order) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Lottie animationData={loadingAnimation} style={{ width: 150 }} />
      </Box>
    );
  }

  // Security Redirect: If order is active, send them to Track page
  if (order.status !== "Delivered" && order.status !== "Cancelled") {
    return <Navigate to={`/orders/track/${order._id}`} replace />;
  }

  const orderSubtotal = order.item.reduce(
    (acc, item) => acc + item.product.basePrice * item.quantity,
    0,
  );

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: "100vh", py: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 } }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <IconButton
            component={Link}
            to={"/orders"}
            sx={{ bgcolor: UI.cardBg, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={800}>
            Order Details
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: UI.radius,
                border: UI.border,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                mb: 4,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight={800}>
                  Order #{order._id.slice(-8).toUpperCase()}
                </Typography>
                <Chip
                  icon={
                    order.status === "Delivered" ? (
                      <CheckCircleRoundedIcon />
                    ) : (
                      <CancelRoundedIcon />
                    )
                  }
                  label={order.status}
                  color={order.status === "Delivered" ? "success" : "error"}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3}>
                {order.item.map((item, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    spacing={3}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: "#f9fafb",
                        borderRadius: 2,
                        p: 1,
                        border: UI.border,
                      }}
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.product.title}
                      </Typography>
                      {item.selectedAttributes &&
                        item.selectedAttributes.map((attr) => (
                          <Typography
                            key={attr.name}
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {attr.name}: {attr.value}
                          </Typography>
                        ))}
                      <Typography variant="body2" mt={1}>
                        Qty: {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      ₹{item.product.basePrice * item.quantity}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {order.status === "Delivered" && (
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
              >
                Download Invoice
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              {/* Order Summary */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: "none",
                }}
              >
                <Typography variant="h6" fontWeight={800} mb={3}>
                  Summary
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography fontWeight={600}>₹{orderSubtotal}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography fontWeight={600}>
                      ₹
                      {order.total - orderSubtotal > 0
                        ? (order.total - orderSubtotal).toFixed(0)
                        : 0}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={800}>
                      Total
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={800}
                      color={UI.primary}
                    >
                      ₹{order.total}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Delivery Info */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: "none",
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} mb={2}>
                  Delivery Address
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  lineHeight={1.6}
                >
                  <span style={{ fontWeight: 700, color: UI.textMain }}>
                    {order.address.type}
                  </span>
                  <br />
                  {order.address.street}
                  <br />
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.postalCode}
                  <br />
                  {order.address.phoneNumber}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight={800} mb={1}>
                  Payment Method
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.paymentMode} - {order.paymentStatus}
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

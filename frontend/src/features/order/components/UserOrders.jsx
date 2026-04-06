import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

import {
  getOrderByUserIdAsync,
  resetOrderFetchStatus,
  selectOrderFetchStatus,
  selectOrders,
} from "../slice/OrderSlice";
import { selectLoggedInUser } from "../../auth/slice/AuthSlice";
import {
  addToCartAsync,
  resetCartItemAddStatus,
  selectCartItemAddStatus,
  selectCartItems,
} from "../../cart/slice/CartSlice";
import LottieComponent from "lottie-react";
import { loadingAnimation, noOrdersAnimation } from "../../../assets";
import { toast } from "react-toastify";

const Lottie = LottieComponent.default || LottieComponent;

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
  border: "1px solid #e5e7eb",
  radius: 3,
};

export const UserOrders = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const loggedInUser = useSelector(selectLoggedInUser);
  const orders = useSelector(selectOrders) || [];
  const cartItems = useSelector(selectCartItems);
  const orderFetchStatus = useSelector(selectOrderFetchStatus);
  const cartItemAddStatus = useSelector(selectCartItemAddStatus);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (loggedInUser?._id) dispatch(getOrderByUserIdAsync(loggedInUser._id));

    return () => {
      dispatch(resetOrderFetchStatus());
      dispatch(resetCartItemAddStatus());
    };
  }, [dispatch, loggedInUser]);

  useEffect(() => {
    if (cartItemAddStatus === "fulfilled")
      toast.success("Product added to cart");
    else if (cartItemAddStatus === "rejected")
      toast.error("Error adding product to cart");
  }, [cartItemAddStatus]);

  const handleAddToCart = (product) => {
    const item = { user: loggedInUser._id, product: product._id, quantity: 1 };
    dispatch(addToCartAsync(item));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Cancelled":
        return "error";
      case "Out for delivery":
        return "warning";
      default:
        return "primary";
    }
  };

  if (orderFetchStatus === "pending") {
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

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: "100vh", py: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 } }}>
        {/* HEADER */}
        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <IconButton
            component={Link}
            to={"/"}
            sx={{ bgcolor: UI.cardBg, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800} color={UI.textMain}>
              Order History
            </Typography>
            <Typography variant="body2" color={UI.textSecondary}>
              Check status, track shipments, and buy again.
            </Typography>
          </Box>
        </Stack>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 5, borderRadius: UI.radius, textAlign: "center" }}
          >
            <Box sx={{ width: 250, mx: "auto", mb: 3 }}>
              <Lottie animationData={noOrdersAnimation} />
            </Box>
            <Typography variant="h6" fontWeight={700} mb={1}>
              No orders yet
            </Typography>
            <Typography color={UI.textSecondary} mb={3}>
              Looks like you haven't made a purchase recently.
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              sx={{ bgcolor: UI.primary, borderRadius: 2, px: 4 }}
            >
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Stack spacing={4}>
            {orders.map((order) => {
              const isCompleted =
                order.status === "Delivered" || order.status === "Cancelled";

              return (
                <Paper
                  key={order._id}
                  elevation={0}
                  sx={{
                    borderRadius: UI.radius,
                    border: UI.border,
                    overflow: "hidden",
                  }}
                >
                  {/* Order Header */}
                  <Box
                    sx={{
                      bgcolor: "#f9fafb",
                      p: { xs: 2, md: 3 },
                      borderBottom: UI.border,
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6} md={3}>
                        <Typography
                          variant="caption"
                          color={UI.textSecondary}
                          fontWeight={600}
                          display="block"
                        >
                          Order Placed
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <Typography
                          variant="caption"
                          color={UI.textSecondary}
                          fontWeight={600}
                          display="block"
                        >
                          Total
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          ₹{order.total.toFixed(0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography
                          variant="caption"
                          color={UI.textSecondary}
                          fontWeight={600}
                          display="block"
                        >
                          Order ID
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          #{order._id.slice(-8).toUpperCase()}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={3}
                        textAlign={{ xs: "left", md: "right" }}
                      >
                        {isCompleted ? (
                          <Button
                            component={Link}
                            to={`/orders/${order._id}`}
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                          >
                            View Order Details
                          </Button>
                        ) : (
                          <Button
                            component={Link}
                            to={`/orders/track/${order._id}`}
                            variant="contained"
                            size="small"
                            startIcon={<LocalShippingOutlinedIcon />}
                            sx={{
                              bgcolor: UI.primary,
                              borderRadius: 2,
                              fontWeight: 700,
                            }}
                          >
                            Track Order
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Order Items */}
                  <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="subtitle1" fontWeight={800}>
                        {order.status === "Delivered" && (
                          <CheckCircleRoundedIcon
                            color="success"
                            sx={{ verticalAlign: "middle", mr: 1 }}
                          />
                        )}
                        {order.status === "Cancelled" && (
                          <CancelRoundedIcon
                            color="error"
                            sx={{ verticalAlign: "middle", mr: 1 }}
                          />
                        )}
                        Status:{" "}
                        <Chip
                          label={order.status}
                          size="small"
                          color={getStatusColor(order.status)}
                          sx={{ fontWeight: 700, ml: 1 }}
                        />
                      </Typography>
                    </Stack>

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
                              flexShrink: 0,
                              bgcolor: "#f9fafb",
                              borderRadius: 2,
                              border: UI.border,
                              p: 1,
                            }}
                          >
                            <img
                              src={
                                item.product.thumbnail || item.product.images[0]
                              }
                              alt={item.product.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </Box>

                          <Box flexGrow={1}>
                            <Typography
                              variant="h6"
                              fontSize="1.05rem"
                              fontWeight={700}
                              component={Link}
                              to={`/product-details/${item.product._id}`}
                              sx={{
                                textDecoration: "none",
                                color: UI.textMain,
                                "&:hover": { color: UI.primary },
                              }}
                            >
                              {item.product.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={UI.textSecondary}
                              mb={1}
                            >
                              {item.product.brand?.name}
                            </Typography>

                            {/* Variant Attributes */}
                            {item.selectedAttributes &&
                              item.selectedAttributes.length > 0 && (
                                <Stack
                                  direction="row"
                                  flexWrap="wrap"
                                  gap={1}
                                  mb={1}
                                >
                                  {item.selectedAttributes.map((attr, aIdx) => (
                                    <Typography
                                      key={aIdx}
                                      variant="caption"
                                      sx={{
                                        bgcolor: "#f3f4f6",
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: 1,
                                        color: UI.textSecondary,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {attr.name}:{" "}
                                      <span style={{ color: UI.textMain }}>
                                        {attr.value}
                                      </span>
                                    </Typography>
                                  ))}
                                </Stack>
                              )}

                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color={UI.textMain}
                            >
                              Qty: {item.quantity} × ₹{item.product.basePrice}
                            </Typography>
                          </Box>

                          {/* Buy Again Button */}
                          {!isMobile && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleAddToCart(item.product)}
                              sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                flexShrink: 0,
                              }}
                            >
                              Buy Again
                            </Button>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

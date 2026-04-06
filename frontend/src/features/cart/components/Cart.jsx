import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import RemoveShoppingCartOutlinedIcon from "@mui/icons-material/RemoveShoppingCartOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

// Redux & Components
import {
  resetCartItemRemoveStatus,
  selectCartItemRemoveStatus,
  selectCartItems,
} from "../slice/CartSlice";
import { CartItem } from "../components/CartItem"; // Make sure path is correct
import { SHIPPING, TAXES } from "../../../constants/constants";
import { toast } from "react-toastify";

const UI = {
  bg: "#f8f9fb",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
  border: "1px solid #e5e7eb",
  shadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
  radius: 3,
};

const getDiscountedPrice = (basePrice, discountPercentage) => {
  return basePrice * (1 - (discountPercentage || 0) / 100);
};

export const Cart = ({ checkout }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));

  const items = useSelector(selectCartItems) || [];
  const cartItemRemoveStatus = useSelector(selectCartItemRemoveStatus);

  const subtotal = items.reduce((acc, item) => {
    const finalPrice = getDiscountedPrice(
      item.product.basePrice,
      item.product.discountPercentage,
    );
    return finalPrice * item.quantity + acc;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotal = subtotal > 0 ? subtotal + SHIPPING + TAXES : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (cartItemRemoveStatus === "fulfilled") {
      toast.success("Product removed from cart");
    } else if (cartItemRemoveStatus === "rejected") {
      toast.error("Error removing product. Please try again.");
    }
  }, [cartItemRemoveStatus]);

  useEffect(() => {
    return () => {
      dispatch(resetCartItemRemoveStatus());
    };
  }, [dispatch]);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          spacing={3}
          p={3}
        >
          <Box
            sx={{
              p: 4,
              borderRadius: "50%",
              bgcolor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RemoveShoppingCartOutlinedIcon
              sx={{ fontSize: 80, color: "#9ca3af" }}
            />
          </Box>
          <Box textAlign="center">
            <Typography
              variant="h4"
              fontWeight={800}
              color={UI.textMain}
              gutterBottom
            >
              Your cart is empty
            </Typography>
            <Typography variant="body1" color={UI.textSecondary} mb={4}>
              Looks like you haven't added anything to your cart yet.
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="large"
              sx={{
                bgcolor: UI.primary,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              Start Shopping
            </Button>
          </Box>
        </Stack>
      </motion.div>
    );
  }

  return (
    <Stack justifyContent="flex-start" alignItems="center" mb={10}>
      <Stack
        width={is900 ? "100%" : "55rem"}
        mt={checkout ? 0 : 6}
        px={checkout ? 0 : { xs: 2, md: 0 }}
        spacing={4}
      >
        {!checkout && (
          <Box>
            <Typography variant="h4" fontWeight={800} color={UI.textMain}>
              Shopping Cart
            </Typography>
            <Typography variant="body2" color={UI.textSecondary} mt={0.5}>
              You have {totalItems} item{totalItems !== 1 && "s"} in your cart.
            </Typography>
          </Box>
        )}

        <Stack
          direction={{ xs: "column", md: checkout ? "column" : "row" }}
          spacing={4}
          alignItems="flex-start"
        >
          {/* --- LEFT: CART ITEMS LIST --- */}
          <Stack spacing={2} sx={{ flexGrow: 1, width: "100%" }}>
            <AnimatePresence>
              {items.map((item) => {
                const finalPrice = getDiscountedPrice(
                  item.product.basePrice,
                  item.product.discountPercentage,
                );

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CartItem
                      id={item._id}
                      productId={item.product._id}
                      title={item.product.title}
                      brand={item.product.brand?.name}
                      category={item.product.category?.name}
                      price={finalPrice}
                      quantity={item.quantity}
                      thumbnail={item.product.thumbnail}
                      stockQuantity={item.product.stockQuantity}
                      selectedAttributes={item.selectedAttributes} // 🚨 Passes the variant data down
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stack>

          {/* --- RIGHT: ORDER SUMMARY --- */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: UI.radius,
              border: UI.border,
              boxShadow: UI.shadow,
              width: { xs: "100%", md: checkout ? "100%" : "24rem" },
              position: { md: checkout ? "relative" : "sticky" },
              top: { md: 24 },
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Order Summary
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color={UI.textSecondary}>
                  Subtotal ({totalItems} items)
                </Typography>
                <Typography fontWeight={600}>₹{subtotal.toFixed(0)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color={UI.textSecondary}>
                  Shipping estimate
                </Typography>
                <Typography fontWeight={600}>₹{SHIPPING.toFixed(0)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color={UI.textSecondary}>Tax estimate</Typography>
                <Typography fontWeight={600}>₹{TAXES.toFixed(0)}</Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
            >
              <Typography variant="h6" fontWeight={800}>
                Total
              </Typography>
              <Typography variant="h5" fontWeight={800} color={UI.primary}>
                ₹{grandTotal.toFixed(0)}
              </Typography>
            </Stack>

            {!checkout && (
              <Stack spacing={2}>
                <Button
                  component={Link}
                  to="/checkout"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    bgcolor: UI.primary,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    boxShadow: "0 4px 6px -1px rgb(99 102 241 / 0.4)",
                  }}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  component={Link}
                  to="/"
                  variant="text"
                  fullWidth
                  startIcon={<ArrowBackRoundedIcon />}
                  sx={{
                    textTransform: "none",
                    color: UI.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  Continue Shopping
                </Button>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Stack>
    </Stack>
  );
};

import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  deleteCartItemByIdAsync,
  updateCartItemByIdAsync,
} from "../slice/CartSlice";

export const CartItem = ({
  id,
  thumbnail,
  title,
  brand,
  price,
  quantity,
  stockQuantity,
  productId,
  selectedAttributes, // 🚨 NEW: Receive the selected variant attributes
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm")); // Mobile screens

  // ─── QTY HANDLERS ───
  const handleIncreaseQty = () => {
    // Prevent increasing beyond available stock or a reasonable limit
    if (quantity < stockQuantity && quantity < 10) {
      dispatch(updateCartItemByIdAsync({ _id: id, quantity: quantity + 1 }));
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      dispatch(updateCartItemByIdAsync({ _id: id, quantity: quantity - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(deleteCartItemByIdAsync(id));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        bgcolor: "#ffffff",
        transition: "box-shadow 0.2s",
        "&:hover": {
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 3 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        {/* ─── 1. IMAGE ─── */}
        <Box
          component={Link}
          to={`/product-details/${productId}`}
          sx={{
            width: { xs: 80, sm: 120 },
            height: { xs: 80, sm: 120 },
            flexShrink: 0,
            borderRadius: 2,
            border: "1px solid #f3f4f6",
            bgcolor: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            textDecoration: "none",
          }}
        >
          <img
            src={thumbnail}
            alt={title}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* ─── 2. DETAILS (Title, Brand, Attributes) ─── */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* Brand */}
          {brand && (
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {brand}
            </Typography>
          )}

          {/* Title */}
          <Typography
            component={Link}
            to={`/product-details/${productId}`}
            variant="h6"
            fontWeight={700}
            color="#111827"
            sx={{
              textDecoration: "none",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              mt: 0.5,
              mb: 1,
              "&:hover": { color: theme.palette.primary.main },
            }}
          >
            {title}
          </Typography>

          {/* 🚨 NEW: RENDER SELECTED VARIANT ATTRIBUTES */}
          {selectedAttributes && selectedAttributes.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
              {selectedAttributes.map((attr, idx) => (
                <Chip
                  key={idx}
                  label={
                    <span>
                      <span style={{ color: "#6b7280", fontWeight: 500 }}>
                        {attr.name}:{" "}
                      </span>
                      <span style={{ color: "#111827", fontWeight: 700 }}>
                        {attr.value}
                      </span>
                    </span>
                  }
                  size="small"
                  sx={{
                    bgcolor: "#f3f4f6",
                    borderRadius: 1.5,
                    fontSize: "0.75rem",
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Mobile Pricing (Shows under title on small screens) */}
          {isSm && (
            <Typography
              variant="h6"
              fontWeight={800}
              color="text.primary"
              mb={2}
            >
              ₹{price?.toFixed(0)}
            </Typography>
          )}

          {/* ─── QTY CONTROLS & REMOVE ─── */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={3}
            mt={!isSm && !selectedAttributes?.length ? 2 : 0}
          >
            {/* Qty Box */}
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflow: "hidden",
                height: 36,
              }}
            >
              <IconButton
                onClick={handleDecreaseQty}
                disabled={quantity <= 1}
                sx={{
                  borderRadius: 0,
                  p: 1,
                  "&:hover": { bgcolor: "#f3f4f6" },
                }}
              >
                <RemoveRoundedIcon fontSize="small" />
              </IconButton>

              <Typography
                fontWeight={700}
                sx={{
                  px: 1.5,
                  minWidth: 32,
                  textAlign: "center",
                  fontSize: "0.9rem",
                }}
              >
                {quantity}
              </Typography>

              <IconButton
                onClick={handleIncreaseQty}
                disabled={quantity >= stockQuantity || quantity >= 10}
                sx={{
                  borderRadius: 0,
                  p: 1,
                  "&:hover": { bgcolor: "#f3f4f6" },
                }}
              >
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Remove Button */}
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={handleRemove}
              startIcon={<DeleteOutlineRoundedIcon />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Remove
            </Button>
          </Stack>
        </Box>

        {/* ─── 3. DESKTOP PRICING (Right Aligned) ─── */}
        {!isSm && (
          <Box sx={{ textAlign: "right", minWidth: 100 }}>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              ₹{price?.toFixed(0)}
            </Typography>

            {/* Optional Subtotal if QTY > 1 */}
            {quantity > 1 && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                display="block"
                mt={0.5}
              >
                (₹{(price * quantity).toFixed(0)} total)
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

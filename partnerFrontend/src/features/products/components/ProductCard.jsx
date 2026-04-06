import { Box, Typography, Stack, Chip, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

export const ProductCard = ({
  id,
  title,
  thumbnail,
  brand,
  price,
  originalPrice,
  discount,
  stock, // 👈 NEW
  hasVariants, // 👈 NEW
  isAdminCard, // 👈 NEW
  isWishlisted,
  handleAddRemoveFromWishlist,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      style={{ width: "100%", maxWidth: 280, cursor: "pointer" }}
      onClick={() =>
        navigate(
          isAdminCard ? `/products/edit/${id}` : `/product-details/${id}`,
        )
      }
    >
      <Box
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: 3,
          p: 2,
          backgroundColor: "#fff",
          transition: "0.2s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          "&:hover": { boxShadow: "0 10px 25px rgba(0,0,0,0.1)" },
        }}
      >
        {/* WISHILST BUTTON (Hidden for Admins) */}
        {!isAdminCard && handleAddRemoveFromWishlist && (
          <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
            <IconButton
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "white" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddRemoveFromWishlist(e, id);
              }}
            >
              {isWishlisted ? (
                <FavoriteIcon color="error" fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        )}

        {/* IMAGE */}
        <Box
          sx={{
            height: 180,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          <img
            src={thumbnail || "https://via.placeholder.com/200"}
            alt={title}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* DETAILS */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {brand}
            </Typography>

            {/* Admin Stock Indicator */}
            {isAdminCard && (
              <Typography
                variant="caption"
                fontWeight={700}
                color={stock < 10 ? "error.main" : "text.secondary"}
              >
                Stock: {stock}
              </Typography>
            )}
          </Stack>

          <Typography
            fontWeight={600}
            mt={0.5}
            mb={1}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </Typography>

          {/* PRICE */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            mt="auto"
            flexWrap="wrap"
            gap={0.5}
          >
            <Typography fontWeight={800} fontSize="1.1rem" color="text.primary">
              {hasVariants ? "From " : ""}₹{price ? price.toFixed(0) : "0"}
            </Typography>
            {discount > 0 && (
              <>
                <Typography
                  sx={{
                    textDecoration: "line-through",
                    color: "#9ca3af",
                    fontSize: "0.85rem",
                  }}
                >
                  ₹{originalPrice?.toFixed(0)}
                </Typography>
                <Chip
                  label={`${discount}% OFF`}
                  size="small"
                  sx={{
                    background: "#dcfce7",
                    color: "#166534",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
};

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Box,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  Button,
  Breadcrumbs,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import { toast } from "react-toastify";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Icons
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

// 🚨 REMOVED DUPLICATES: Only keeping the correct FSD import paths
import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  selectProductFetchStatus,
  selectSelectedProduct,
} from "../slice/ProductSlice";
import {
  addToCartAsync,
  selectCartItemAddStatus,
  selectCartItems,
} from "../../cart/slice/CartSlice";
import { selectLoggedInUser } from "../../auth/slice/AuthSlice";
import {
  fetchReviewsByProductIdAsync,
  selectReviews,
} from "../../review/slice/ReviewSlice";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  selectWishlistItems,
} from "../../wishlist/slice/WishlistSlice";

import LottieComponent from "lottie-react";
import { loadingAnimation } from "../../../assets";

const Lottie = LottieComponent.default || LottieComponent;

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const product = useSelector(selectSelectedProduct);
  const loggedInUser = useSelector(selectLoggedInUser);
  const cartItems = useSelector(selectCartItems);
  const wishlistItems = useSelector(selectWishlistItems);
  const reviews = useSelector(selectReviews) || [];

  const productFetchStatus = useSelector(selectProductFetchStatus);
  const cartItemAddStatus = useSelector(selectCartItemAddStatus);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Responsive breakpoints
  const is990 = useMediaQuery("(max-width:990px)");
  const is500 = useMediaQuery("(max-width:500px)");

  const isProductAlreadyInCart = cartItems.some(
    (item) => item.product._id === id,
  );
  const isProductAlreadyinWishlist = wishlistItems.some(
    (item) => item.product._id === id,
  );

  const averageRating =
    reviews.length > 0
      ? Math.ceil(
          reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length,
        )
      : 0;

  // Calculate final price
  const finalPrice = product
    ? product.basePrice * (1 - (product.discountPercentage || 0) / 100)
    : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (id) {
      dispatch(fetchProductByIdAsync(id));
      dispatch(fetchReviewsByProductIdAsync(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (cartItemAddStatus === "fulfilled") toast.success("Added to cart!");
    else if (cartItemAddStatus === "rejected")
      toast.error("Failed to add to cart.");
  }, [cartItemAddStatus]);

  const handleAddToCart = () => {
    if (isProductAlreadyInCart) {
      navigate("/cart");
    } else {
      const item = { user: loggedInUser._id, product: id, quantity };
      dispatch(addToCartAsync(item));
    }
  };

  const handleAddRemoveFromWishlist = () => {
    if (!isProductAlreadyinWishlist) {
      dispatch(
        createWishlistItemAsync({ user: loggedInUser?._id, product: id }),
      );
    } else {
      const index = wishlistItems.findIndex((item) => item.product._id === id);
      dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQty = () => {
    if (quantity < product.stockQuantity && quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  if (productFetchStatus === "pending" || !product) {
    return (
      <Stack alignItems="center" justifyContent="center" height="60vh">
        <Lottie animationData={loadingAnimation} style={{ width: 150 }} />
      </Stack>
    );
  }

  return (
    <Box
      sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4, mb: 10 }}
    >
      {/* BREADCRUMBS */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 4 }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "#6b7280" }}>
          Home
        </Link>
        <Link to="/" style={{ textDecoration: "none", color: "#6b7280" }}>
          {product.category?.name}
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {product.title}
        </Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 4, md: 8 }}>
        {/* LEFT: IMAGE GALLERY */}
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          spacing={2}
          width={{ xs: "100%", md: "55%" }}
        >
          {/* Thumbnails */}
          {!is990 && (
            <Stack spacing={2} sx={{ width: 80, flexShrink: 0 }}>
              {product.images?.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  sx={{
                    width: 80,
                    height: 80,
                    border:
                      selectedImageIndex === i
                        ? "2px solid #6366f1"
                        : "1px solid #e5e7eb",
                    borderRadius: 2,
                    cursor: "pointer",
                    overflow: "hidden",
                    opacity: selectedImageIndex === i ? 1 : 0.6,
                    transition: "all 0.2s",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}

          {/* Main Image Area */}
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "#f9fafb",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              position: "relative",
            }}
          >
            {is500 ? (
              <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                style={{ height: "350px" }}
              >
                {product.images?.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <img
                src={product.images?.[selectedImageIndex]}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "500px",
                  objectFit: "contain",
                  padding: "2rem",
                }}
              />
            )}

            <IconButton
              onClick={handleAddRemoveFromWishlist}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": { bgcolor: "white" },
                zIndex: 10,
              }}
            >
              {isProductAlreadyinWishlist ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </Box>
        </Stack>

        {/* RIGHT: PRODUCT DETAILS */}
        <Stack spacing={3} width={{ xs: "100%", md: "45%" }}>
          <Box>
            <Typography
              variant="overline"
              color="#6366f1"
              fontWeight={800}
              letterSpacing={1}
            >
              {product.brand?.name}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              color="#111827"
              lineHeight={1.2}
              mt={0.5}
            >
              {product.title}
            </Typography>
          </Box>

          {/* Rating & Price */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={averageRating} readOnly size="small" />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
              >
                ({reviews.length} Reviews)
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="flex-end" spacing={1.5}>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              ₹{finalPrice.toFixed(0)}
            </Typography>
            {product.discountPercentage > 0 && (
              <>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through", mb: 0.5 }}
                >
                  ₹{product.basePrice}
                </Typography>
                <Chip
                  label={`${product.discountPercentage}% OFF`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 800, mb: 1 }}
                />
              </>
            )}
          </Stack>

          <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
            {product.description}
          </Typography>

          {/* DYNAMIC ATTRIBUTES */}
          {product.attributes?.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: "#f9fafb",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Specifications:
              </Typography>
              {product.attributes.map((attr, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  <span style={{ fontWeight: 600, color: "#111827" }}>
                    {attr.name}:
                  </span>{" "}
                  {attr.value}
                </Typography>
              ))}
            </Box>
          )}

          <Divider />

          {/* Add to Cart Area */}
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>
              Quantity
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* QTY Controls */}
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <IconButton
                  onClick={handleDecreaseQty}
                  disabled={quantity <= 1}
                  sx={{ borderRadius: 0, p: 1.5 }}
                >
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>
                <Typography
                  fontWeight={700}
                  sx={{ px: 2, minWidth: 40, textAlign: "center" }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  onClick={handleIncreaseQty}
                  disabled={quantity >= product.stockQuantity || quantity >= 10}
                  sx={{ borderRadius: 0, p: 1.5 }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography
                variant="caption"
                color={
                  product.stockQuantity < 10 ? "error.main" : "text.secondary"
                }
                fontWeight={600}
              >
                {product.stockQuantity > 0
                  ? `Only ${product.stockQuantity} left in stock`
                  : "Out of Stock"}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              size="large"
              disabled={product.stockQuantity === 0}
              onClick={handleAddToCart}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: isProductAlreadyInCart ? "#10b981" : "#6366f1",
                "&:hover": {
                  bgcolor: isProductAlreadyInCart ? "#059669" : "#4f46e5",
                },
                boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
              }}
            >
              {product.stockQuantity === 0
                ? "Out of Stock"
                : isProductAlreadyInCart
                  ? "Proceed to Checkout"
                  : "Add to Cart"}
            </Button>
          </Stack>

          {/* Trust Badges */}
          <Stack direction="row" spacing={3} mt={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalShippingOutlinedIcon sx={{ color: "text.secondary" }} />
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                Free Shipping
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <VerifiedUserOutlinedIcon sx={{ color: "text.secondary" }} />
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                Secure Checkout
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

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
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Icons
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

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

  // 🚨 NEW: Variant Selection States
  const [availableAttributes, setAvailableAttributes] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

  const is990 = useMediaQuery("(max-width:990px)");
  const is500 = useMediaQuery("(max-width:500px)");

  // Cart & Wishlist Checkers
  const isProductAlreadyInCart = cartItems.some((item) => {
    if (item.product._id !== id) return false;
    // If product has variants, only consider it "in cart" if they chose this exact variant
    if (product?.hasVariants) return item.variantId === currentVariant?._id;
    return true;
  });
  const isProductAlreadyinWishlist = wishlistItems.some(
    (item) => item.product._id === id,
  );

  const averageRating =
    reviews.length > 0
      ? Math.ceil(
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length,
        )
      : 0;

  // 🚨 NEW: Calculate Base vs Variant Pricing & Stock
  const displayPrice = currentVariant
    ? currentVariant.price
    : product?.basePrice;
  const displayStock = currentVariant
    ? currentVariant.stockQuantity
    : product?.stockQuantity;
  const finalPrice = displayPrice
    ? displayPrice * (1 - (product?.discountPercentage || 0) / 100)
    : 0;

  // Initial Fetch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (id) {
      dispatch(fetchProductByIdAsync(id));
      dispatch(fetchReviewsByProductIdAsync(id));
    }
    return () => dispatch(clearSelectedProduct());
  }, [id, dispatch]);

  // 🚨 NEW: Parse Variants when Product Loads
  useEffect(() => {
    if (product && product.hasVariants && product.variants?.length > 0) {
      // 1. Group all available options by attribute name (e.g. Color: [Black, Red], Size: [S, M])
      const extractedAttributes = {};
      product.variants.forEach((variant) => {
        variant.attributes.forEach((attr) => {
          if (!extractedAttributes[attr.name])
            extractedAttributes[attr.name] = new Set();
          extractedAttributes[attr.name].add(attr.value);
        });
      });

      // Convert Sets to Arrays for rendering
      const formattedAttributes = {};
      Object.keys(extractedAttributes).forEach((key) => {
        formattedAttributes[key] = Array.from(extractedAttributes[key]);
      });
      setAvailableAttributes(formattedAttributes);

      // 2. Pre-select the first available options so the user sees a valid price immediately
      const initialSelection = {};
      product.variants[0].attributes.forEach((attr) => {
        initialSelection[attr.name] = attr.value;
      });
      setSelectedOptions(initialSelection);
    }
  }, [product]);

  // 🚨 NEW: Find the exact matching variant whenever the user clicks an option
  useEffect(() => {
    if (product?.hasVariants && Object.keys(selectedOptions).length > 0) {
      const match = product.variants.find((variant) => {
        // A variant is a match ONLY if every selected option matches the variant's attributes
        return variant.attributes.every(
          (attr) => selectedOptions[attr.name] === attr.value,
        );
      });
      setCurrentVariant(match || null);
      setQuantity(1); // Reset quantity if they change variant
    }
  }, [selectedOptions, product]);

  // Add to Cart Status Listener
  useEffect(() => {
    if (cartItemAddStatus === "fulfilled") toast.success("Added to cart!");
    else if (cartItemAddStatus === "rejected")
      toast.error("Failed to add to cart.");
  }, [cartItemAddStatus]);

  // Handlers
  const handleOptionSelect = (attrName, attrValue) => {
    setSelectedOptions((prev) => ({ ...prev, [attrName]: attrValue }));
  };

  const handleAddToCart = () => {
    if (isProductAlreadyInCart) {
      navigate("/cart");
      return;
    }

    if (product.hasVariants && !currentVariant) {
      toast.error("Please select all options before adding to cart.");
      return;
    }

    const item = {
      user: loggedInUser._id,
      product: id,
      quantity,
      variantId: currentVariant ? currentVariant._id : null,
    };
    dispatch(addToCartAsync(item));
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
    if (quantity > 1) setQuantity(quantity - 1);
  };
  const handleIncreaseQty = () => {
    if (quantity < displayStock && quantity < 10) setQuantity(quantity + 1);
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
        {/* LEFT: IMAGE GALLERY */}
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          spacing={2}
          width={{ xs: "100%", md: "55%" }}
        >
          {/* 🚨 NEW: Create a fallback array that uses the thumbnail if the gallery is empty */}
          {(() => {
            const displayImages =
              product.images?.length > 0 ? product.images : [product.thumbnail];

            return (
              <>
                {/* Thumbnails */}
                {!is990 && (
                  <Stack spacing={2} sx={{ width: 80, flexShrink: 0 }}>
                    {displayImages.map((img, i) => (
                      <Box
                        key={i}
                        onClick={() => setSelectedImageIndex(i)}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          cursor: "pointer",
                          overflow: "hidden",
                          border:
                            selectedImageIndex === i
                              ? "2px solid #6366f1"
                              : "1px solid #e5e7eb",
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
                      {displayImages.map((img, i) => (
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
                      src={displayImages[selectedImageIndex]}
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
                      zIndex: 10,
                      "&:hover": { bgcolor: "white" },
                    }}
                  >
                    {isProductAlreadyinWishlist ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </Box>
              </>
            );
          })()}
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
              {product.brand?.name || "Unbranded"}
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

          <Stack direction="row" alignItems="center" spacing={1}>
            <Rating value={averageRating} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              ({reviews.length} Reviews)
            </Typography>
          </Stack>

          {/* PRICE */}
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
                  ₹{displayPrice}
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

          <Divider />

          {/* 🚨 NEW: DYNAMIC VARIANT SELECTORS */}
          {product.hasVariants &&
            Object.keys(availableAttributes).length > 0 && (
              <Stack spacing={2}>
                {Object.entries(availableAttributes).map(
                  ([attrName, values]) => (
                    <Box key={attrName}>
                      <Typography variant="subtitle2" fontWeight={700} mb={1}>
                        Select {attrName}:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {values.map((val) => {
                          const isSelected = selectedOptions[attrName] === val;
                          return (
                            <Button
                              key={val}
                              variant={isSelected ? "contained" : "outlined"}
                              color={isSelected ? "primary" : "inherit"}
                              onClick={() => handleOptionSelect(attrName, val)}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                borderWidth: "2px",
                                "&:hover": { borderWidth: "2px" },
                              }}
                            >
                              {val}
                            </Button>
                          );
                        })}
                      </Stack>
                    </Box>
                  ),
                )}

                {/* Show error if current combination is out of stock */}
                {currentVariant && currentVariant.stockQuantity === 0 && (
                  <Typography variant="body2" color="error" fontWeight={600}>
                    This specific configuration is currently out of stock.
                  </Typography>
                )}
              </Stack>
            )}

          {/* DYNAMIC GLOBAL ATTRIBUTES */}
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

          {/* ADD TO CART AREA */}
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>
              Quantity
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
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
                  disabled={quantity >= displayStock || quantity >= 10}
                  sx={{ borderRadius: 0, p: 1.5 }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography
                variant="caption"
                color={displayStock < 10 ? "error.main" : "text.secondary"}
                fontWeight={600}
              >
                {displayStock > 0
                  ? `Only ${displayStock} left in stock`
                  : "Out of Stock"}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              size="large"
              disabled={
                displayStock === 0 || (product.hasVariants && !currentVariant)
              }
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
              {displayStock === 0
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

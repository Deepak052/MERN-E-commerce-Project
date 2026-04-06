import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

// Icons
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";

// Layout & Components
import { Navbar } from "../../../layout/Navbar";
import { Footer } from "../../../layout/Footer";
import { ProductBanner } from "../../banners/pages/ProductBanner";
import { ProductCard } from "../../products/components/ProductCard";

// Redux
import {
  resetAddressStatus,
  selectAddressStatus,
} from "../../profile/slice/AddressSlice";
import {
  fetchAllBannersAsync,
  selectBanners,
} from "../../banners/slice/BannerSlice";
import {
  fetchNewArrivalsAsync,
  fetchDealsAsync,
  fetchBestSellersAsync,
  fetchBudgetPicksAsync,
  fetchFlashSalesAsync,
  fetchRecommendationsAsync,
  selectNewArrivals,
  selectDeals,
  selectBestSellers,
  selectBudgetPicks,
  selectFlashSales,
  selectRecommendations,
} from "../slice/HomeSlice";
import { selectLoggedInUser } from "../../auth/slice/AuthSlice";
import {
  selectWishlistItems,
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
} from "../../wishlist/slice/WishlistSlice";
import { toast } from "react-toastify";

// ─── TRUST BADGES COMPONENT ───
const ServicesBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const services = [
    {
      icon: <LocalShippingOutlinedIcon fontSize="large" />,
      title: "Free Shipping",
      subtitle: "On orders over ₹500",
    },
    {
      icon: <VerifiedUserOutlinedIcon fontSize="large" />,
      title: "Secure Payment",
      subtitle: "100% protected checkout",
    },
    {
      icon: <AssignmentReturnOutlinedIcon fontSize="large" />,
      title: "Easy Returns",
      subtitle: "14-day return policy",
    },
    {
      icon: <SupportAgentOutlinedIcon fontSize="large" />,
      title: "24/7 Support",
      subtitle: "Dedicated assistance",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        py: 3,
        px: { xs: 2, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent={isMobile ? "center" : "space-between"}
          gap={3}
        >
          {services.map((service, idx) => (
            <Stack key={idx} direction="row" alignItems="center" spacing={2}>
              <Box sx={{ color: theme.palette.primary.main }}>
                {service.icon}
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  fontWeight={800}
                  color="#111827"
                  lineHeight={1.2}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {service.subtitle}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

// ─── REUSABLE CAROUSEL COMPONENT ───
const ProductCarousel = ({
  title,
  icon,
  products,
  wishlistItems,
  handleWishlist,
  viewAllLink,
  bgColor,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <Box
      sx={{
        py: 6,
        px: { xs: 2, md: 5 },
        bgcolor: bgColor || "transparent",
        // Customizing Swiper arrows to look professional and float over the edges
        "& .swiper-button-next, & .swiper-button-prev": {
          color: "#111827",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          "&:after": { fontSize: "18px", fontWeight: "bold" },
          "&:hover": { backgroundColor: "#ffffff", transform: "scale(1.05)" },
          transition: "all 0.2s ease-in-out",
        },
        "& .swiper-button-disabled": { opacity: "0 !important" },
      }}
    >
      <Container maxWidth="xl" sx={{ px: "0 !important" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.5)",
                display: "flex",
              }}
            >
              {icon}
            </Box>
            <Typography
              variant="h5"
              fontWeight={800}
              color="#111827"
              letterSpacing="-0.02em"
            >
              {title}
            </Typography>
          </Stack>

          {viewAllLink && (
            <Button
              component={Link}
              to={viewAllLink}
              endIcon={
                <ArrowForwardIosRoundedIcon
                  sx={{ fontSize: "12px !important" }}
                />
              }
              sx={{
                fontWeight: 700,
                textTransform: "none",
                color: "#6366f1",
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              View All
            </Button>
          )}
        </Stack>

        <Swiper
          modules={[Navigation, FreeMode]}
          navigation
          freeMode={true}
          spaceBetween={24}
          slidesPerView={1.2}
          breakpoints={{
            480: { slidesPerView: 2.2 },
            768: { slidesPerView: 3.2 },
            1024: { slidesPerView: 4.2 },
            1280: { slidesPerView: 5.2 },
          }}
          style={{ paddingBottom: "20px", paddingTop: "5px" }}
        >
          {products.map((product) => {
            const isWishlisted = wishlistItems.some(
              (w) => w.product._id === product._id,
            );
            const finalPrice =
              product.basePrice * (1 - (product.discountPercentage || 0) / 100);

            return (
              <SwiperSlide key={product._id} style={{ height: "auto" }}>
                <ProductCard
                  id={product._id}
                  title={product.title}
                  thumbnail={product.thumbnail}
                  brand={product.brand?.name}
                  price={finalPrice}
                  originalPrice={product.basePrice}
                  discount={product.discountPercentage}
                  hasVariants={product.hasVariants}
                  stock={product.stockQuantity}
                  isAdminCard={false}
                  isWishlisted={isWishlisted}
                  handleAddRemoveFromWishlist={(e) =>
                    handleWishlist(e, product._id, isWishlisted)
                  }
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Container>
    </Box>
  );
};

// ─── MAIN PAGE COMPONENT ───
export const HomePage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const is1200 = useMediaQuery(theme.breakpoints.down("lg"));
  const is800 = useMediaQuery(theme.breakpoints.down("md"));
  const is600 = useMediaQuery(theme.breakpoints.down("sm"));

  const user = useSelector(selectLoggedInUser);
  const addressStatus = useSelector(selectAddressStatus);
  const wishlistItems = useSelector(selectWishlistItems) || [];
  const banners = useSelector(selectBanners) || [];

  const flashSales = useSelector(selectFlashSales);
  const deals = useSelector(selectDeals);
  const bestSellers = useSelector(selectBestSellers);
  const newArrivals = useSelector(selectNewArrivals);
  const budgetPicks = useSelector(selectBudgetPicks);
  const recommendations = useSelector(selectRecommendations);

  // Address Cleanup
  useEffect(() => {
    if (addressStatus === "fulfilled") dispatch(resetAddressStatus());
  }, [addressStatus, dispatch]);

  // Initial Data Hydration
  useEffect(() => {
    dispatch(fetchAllBannersAsync(false)); // Active banners only
    dispatch(fetchFlashSalesAsync(10));
    dispatch(fetchDealsAsync(10));
    dispatch(fetchBestSellersAsync(10));
    dispatch(fetchNewArrivalsAsync(10));
    dispatch(fetchBudgetPicksAsync({ limit: 10, maxPrice: 1000 })); // Fixed to ₹1000

    if (user) {
      dispatch(fetchRecommendationsAsync(10));
    }
  }, [dispatch, user]);

  const dynamicBannerImages = banners.map((banner) => banner.image);

  const handleWishlistToggle = (e, productId, isWishlisted) => {
    e.preventDefault();
    if (!user)
      return toast.error("Please login to add items to your wishlist.");

    if (isWishlisted) {
      const item = wishlistItems.find((w) => w.product._id === productId);
      dispatch(deleteWishlistItemByIdAsync(item._id));
    } else {
      dispatch(createWishlistItemAsync({ user: user._id, product: productId }));
    }
  };

  return (
    <>
      <Navbar />

      <Box
        sx={{ width: "100%", bgcolor: "#f8f9fc", pb: 10, minHeight: "100vh" }}
      >
        {/* ─── HERO BANNER ─── */}
        {banners.length > 0 && (
          <Box
            sx={{
              width: "100%",
              // 🚨 NEW: Clean, responsive CSS handled purely by Material UI!
              height: { xs: "200px", sm: "300px", md: "400px", lg: "500px" },
              display: { xs: "none", sm: "block" }, // Hides entirely on extra-small mobile screens
            }}
          >
            {/* 🚨 Pass the whole array of objects, not just strings! */}
            <ProductBanner banners={banners} />
          </Box>
        )}

        {/* ─── STOREFRONT CAROUSELS ─── */}

        {/* FLASH SALES (Colored Background for urgency) */}
        <ProductCarousel
          title="Flash Sale Live Now"
          icon={<BoltRoundedIcon sx={{ color: "#ef4444", fontSize: 32 }} />}
          products={flashSales}
          wishlistItems={wishlistItems}
          handleWishlist={handleWishlistToggle}
          bgColor="#fee2e2"
        />

        {/* RECOMMENDED FOR YOU */}
        {user && recommendations?.length > 0 && (
          <ProductCarousel
            title="Recommended For You"
            icon={
              <AutoAwesomeMosaicRoundedIcon
                sx={{ color: theme.palette.primary.main, fontSize: 28 }}
              />
            }
            products={recommendations}
            wishlistItems={wishlistItems}
            handleWishlist={handleWishlistToggle}
          />
        )}

        {/* DEALS OF THE DAY */}
        <ProductCarousel
          title="Deals of the Day"
          icon={
            <LocalFireDepartmentRoundedIcon
              sx={{ color: "#f59e0b", fontSize: 28 }}
            />
          }
          products={deals}
          wishlistItems={wishlistItems}
          handleWishlist={handleWishlistToggle}
        />

        {/* BEST SELLERS */}
        <ProductCarousel
          title="Best Sellers"
          icon={<StarRoundedIcon sx={{ color: "#eab308", fontSize: 28 }} />}
          products={bestSellers}
          wishlistItems={wishlistItems}
          handleWishlist={handleWishlistToggle}
          bgColor="#ffffff"
        />

        {/* NEW ARRIVALS */}
        <ProductCarousel
          title="New Arrivals"
          icon={
            <AutoAwesomeMosaicRoundedIcon
              sx={{ color: "#10b981", fontSize: 28 }}
            />
          }
          products={newArrivals}
          wishlistItems={wishlistItems}
          handleWishlist={handleWishlistToggle}
        />

        {/* BUDGET PICKS */}
        <ProductCarousel
          title="Budget Picks under ₹999"
          icon={<SavingsRoundedIcon sx={{ color: "#14b8a6", fontSize: 28 }} />}
          products={budgetPicks}
          wishlistItems={wishlistItems}
          handleWishlist={handleWishlistToggle}
          bgColor="#ffffff"
        />
        {/* ─── TRUST BADGES ─── */}
        <ServicesBanner />
      </Box>

      <Footer />
    </>
  );
};

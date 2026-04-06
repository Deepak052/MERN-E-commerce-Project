import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider,
  Button,
  Drawer,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Breadcrumbs,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
} from "@mui/material";

// Icons
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

// Layout & Components
import { Navbar } from "../../../layout/Navbar";
import { Footer } from "../../../layout/Footer";
import { ProductCard } from "../components/ProductCard";

// Redux
import {
  fetchProductsAsync,
  selectProducts,
  selectProductTotalResults,
  selectProductFetchStatus,
} from "../slice/ProductSlice";
import { selectCategories } from "../slice/CategoriesSlice";
import { selectBrands } from "../slice/BrandSlice";
import { selectLoggedInUser } from "../../auth/slice/AuthSlice";
import {
  selectWishlistItems,
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
} from "../../wishlist/slice/WishlistSlice";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 12;

const UI = {
  primary: "#4f46e5",
  textMain: "#111827",
  textMuted: "#6b7280",
  bgLight: "#f9fafb",
  border: "1px solid #e5e7eb",
};

export const ProductList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate(); // <-- Fixed missing hook
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const products = useSelector(selectProducts);
  const totalResults = useSelector(selectProductTotalResults);
  const fetchStatus = useSelector(selectProductFetchStatus);
  const categories = useSelector(selectCategories) || [];
  const brands = useSelector(selectBrands) || [];

  const user = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems) || [];

  // Mobile Filter Drawer State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Local State for Price Slider
  const [priceRange, setPriceRange] = useState([0, 100000]);

  // ─── 1. READ URL PARAMETERS ───
  const currentCategory = searchParams.get("category");
  const currentBrands = searchParams.get("brand")
    ? searchParams.get("brand").split(",")
    : [];
  const currentSort = searchParams.get("sort") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";

  // ─── 2. FETCH PRODUCTS ON URL CHANGE ───
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const filters = {
      category: currentCategory ? [currentCategory] : [],
      brand: currentBrands,
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      search: currentSearch,
      sort: { sort: currentSort, order: currentOrder },
      pagination: { page: currentPage, limit: ITEMS_PER_PAGE },
    };

    dispatch(fetchProductsAsync(filters));
  }, [searchParams, dispatch]);

  // ─── 3. FILTER HANDLERS ───
  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", 1);
    setSearchParams(params);
  };

  const handleMultiSelectFilter = (key, value) => {
    const current = searchParams.get(key)
      ? searchParams.get(key).split(",")
      : [];
    let updated;
    if (current.includes(value))
      updated = current.filter((item) => item !== value);
    else updated = [...current, value];

    updateParams(key, updated.length > 0 ? updated.join(",") : null);
  };

  const handlePriceCommit = (event, newValue) => {
    const params = new URLSearchParams(searchParams);
    params.set("minPrice", newValue[0]);
    params.set("maxPrice", newValue[1]);
    params.set("page", 1);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const [sort, order] = e.target.value.split("-");
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    params.set("order", order);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 100000]);
  };

  // ─── 4. WISHLIST HANDLER ───
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

  // ─── FILTER SIDEBAR COMPONENT ───
  const FilterSidebar = (
    <Box sx={{ p: { xs: 3, md: 0 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" fontWeight={800} color={UI.textMain}>
          Filters
        </Typography>
        {searchParams.toString() && (
          <Button
            size="small"
            color="error"
            onClick={clearFilters}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Clear All
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 3, borderColor: "#e5e7eb" }} />

      {/* CATEGORIES */}
      <Box mb={4}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          mb={2}
          color={UI.textMain}
        >
          Categories
        </Typography>
        <Stack spacing={0.5}>
          <Box
            onClick={() => updateParams("category", null)}
            sx={{
              cursor: "pointer",
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: !currentCategory ? `${UI.primary}15` : "transparent",
              color: !currentCategory
                ? theme.palette.primary.main
                : UI.textMuted,
              fontWeight: !currentCategory ? 700 : 500,
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: `${UI.primary}10`,
                color: theme.palette.primary.main,
              },
            }}
          >
            All Categories
          </Box>
          {categories.map((c) => (
            <Box
              key={c._id}
              onClick={() => updateParams("category", c._id)}
              sx={{
                cursor: "pointer",
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor:
                  currentCategory === c._id ? `${UI.primary}15` : "transparent",
                color:
                  currentCategory === c._id
                    ? theme.palette.primary.main
                    : UI.textMuted,
                fontWeight: currentCategory === c._id ? 700 : 500,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: `${UI.primary}10`,
                  color: theme.palette.primary.main,
                },
              }}
            >
              {c.name}
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3, borderColor: "#e5e7eb" }} />

      {/* BRANDS */}
      <Box mb={4}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          mb={2}
          color={UI.textMain}
        >
          Brands
        </Typography>
        <Stack spacing={0.5}>
          {brands.map((b) => (
            <FormControlLabel
              key={b._id}
              sx={{
                margin: 0,
                "&:hover": { bgcolor: "#f3f4f6" },
                borderRadius: 1.5,
                pr: 1,
              }}
              control={
                <Checkbox
                  size="small"
                  checked={currentBrands.includes(b._id)}
                  onChange={() => handleMultiSelectFilter("brand", b._id)}
                  sx={{
                    color: "#d1d5db",
                    "&.Mui-checked": { color: theme.palette.primary.main },
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  color={UI.textMain}
                  fontWeight={500}
                >
                  {b.name}
                </Typography>
              }
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3, borderColor: "#e5e7eb" }} />

      {/* PRICE RANGE */}
      <Box mb={4}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          mb={3}
          color={UI.textMain}
        >
          Price Range
        </Typography>
        <Box px={1}>
          <Slider
            value={priceRange}
            onChange={(e, val) => setPriceRange(val)}
            onChangeCommitted={handlePriceCommit}
            valueLabelDisplay="auto"
            min={0}
            max={100000}
            step={500}
            sx={{
              color: theme.palette.primary.main,
              "& .MuiSlider-thumb": {
                bgcolor: "#fff",
                border: "2px solid currentColor",
                "&:hover": { boxShadow: "0 0 0 8px rgba(79, 70, 229, 0.16)" },
              },
            }}
          />
        </Box>
        <Stack direction="row" justifyContent="space-between" mt={1}>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              minWidth: 70,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color={UI.textMain} fontWeight={600}>
              ₹{priceRange[0]}
            </Typography>
          </Paper>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            -
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 1,
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              minWidth: 70,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color={UI.textMain} fontWeight={600}>
              ₹{priceRange[1]}
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: UI.bgLight, minHeight: "100vh", pb: 10 }}>
        {/* PAGE HEADER */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            py: { xs: 4, md: 5 },
            mb: 5,
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
          }}
        >
          <Grid container maxWidth="xl" mx="auto" px={{ xs: 2, md: 5 }}>
            <Grid item xs={12}>
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 2 }}
              >
                <Link
                  to="/"
                  style={{
                    textDecoration: "none",
                    color: UI.textMuted,
                    fontWeight: 500,
                  }}
                >
                  Home
                </Link>
                <Typography color="text.primary" fontWeight={600}>
                  Products
                </Typography>
              </Breadcrumbs>
              <Typography
                variant="h3"
                fontSize={{ xs: "1.75rem", md: "2.25rem" }}
                fontWeight={800}
                color={UI.textMain}
              >
                {currentSearch
                  ? `Search Results for "${currentSearch}"`
                  : "Shop All Products"}
              </Typography>
              <Typography variant="body1" color={UI.textMuted} mt={1}>
                Showing {products.length} of {totalResults} results
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Grid
          container
          maxWidth="xl"
          mx="auto"
          px={{ xs: 2, md: 5 }}
          spacing={4}
        >
          {/* DESKTOP SIDEBAR */}
          {!isMobile && (
            <Grid item md={3} lg={2.5}>
              <Box sx={{ position: "sticky", top: 24, pr: 2 }}>
                {FilterSidebar}
              </Box>
            </Grid>
          )}

          {/* MAIN PRODUCT AREA */}
          <Grid item xs={12} md={9} lg={9.5}>
            {/* TOP BAR (Mobile Filter Btn & Sort) */}
            <Stack
              direction="row"
              justifyContent={isMobile ? "space-between" : "flex-end"}
              alignItems="center"
              mb={4}
            >
              {isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<FilterListRoundedIcon />}
                  onClick={() => setMobileFiltersOpen(true)}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    borderColor: "#d1d5db",
                    color: UI.textMain,
                  }}
                >
                  Filters
                </Button>
              )}

              <FormControl
                size="small"
                sx={{
                  minWidth: 200,
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              >
                <InputLabel sx={{ fontWeight: 500 }}>Sort By</InputLabel>
                <Select
                  value={`${currentSort}-${currentOrder}`}
                  label="Sort By"
                  onChange={handleSortChange}
                  sx={{ fontWeight: 500, color: UI.textMain }}
                >
                  <MenuItem value="createdAt-desc">Newest First</MenuItem>
                  <MenuItem value="basePrice-asc">Price: Low to High</MenuItem>
                  <MenuItem value="basePrice-desc">Price: High to Low</MenuItem>
                  <MenuItem value="soldCount-desc">Best Selling</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* PRODUCTS GRID / EMPTY STATE */}
            {fetchStatus === "pending" ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="50vh"
              >
                <CircularProgress size={48} thickness={4} />
              </Box>
            ) : products.length === 0 ? (
              /* 🚨 PERFECTED ALIGNED EMPTY STATE */
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "50vh",
                  textAlign: "center",
                  p: { xs: 4, md: 8 },
                  borderRadius: 4,
                  border: UI.border,
                  bgcolor: "white",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
              >
                <Box
                  sx={{
                    bgcolor: `${UI.primary}10`,
                    p: 3,
                    borderRadius: "50%",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {currentSearch ? (
                    <SearchOffRoundedIcon
                      sx={{ fontSize: 64, color: theme.palette.primary.main }}
                    />
                  ) : (
                    <Inventory2OutlinedIcon
                      sx={{ fontSize: 64, color: theme.palette.primary.main }}
                    />
                  )}
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color={UI.textMain}
                  mb={1}
                >
                  {currentSearch
                    ? `No results found for "${currentSearch}"`
                    : "No products matched your criteria."}
                </Typography>
                <Typography color={UI.textMuted} mb={4} maxWidth="sm">
                  {currentSearch
                    ? "We couldn't find anything matching your search. Try checking for spelling errors or using more general terms."
                    : "Try adjusting your filters, selecting a different category, or removing pricing constraints."}
                </Typography>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    clearFilters();
                    navigate("/products"); // Safe now that useNavigate is imported
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  Clear All Filters & Search
                </Button>
              </Paper>
            ) : (
              <>
                <Grid container spacing={3}>
                  {products.map((product) => {
                    const isWishlisted = wishlistItems.some(
                      (w) => w.product._id === product._id,
                    );
                    const finalPrice =
                      product.basePrice *
                      (1 - (product.discountPercentage || 0) / 100);

                    return (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={product._id}>
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
                            handleWishlistToggle(e, product._id, isWishlisted)
                          }
                        />
                      </Grid>
                    );
                  })}
                </Grid>

                {/* PAGINATION */}
                {totalResults > ITEMS_PER_PAGE && (
                  <Box display="flex" justifyContent="center" mt={8}>
                    <Pagination
                      count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
                      page={currentPage}
                      onChange={(e, page) => updateParams("page", page)}
                      color="primary"
                      size="large"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: 2,
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* MOBILE FILTER DRAWER */}
      <Drawer
        anchor="bottom"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{
          sx: {
            height: "85vh",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
        }}
      >
        <Box
          p={2}
          display="flex"
          justifyContent="flex-end"
          borderBottom="1px solid #e5e7eb"
          position="sticky"
          top={0}
          bgcolor="white"
          zIndex={1}
        >
          <IconButton
            onClick={() => setMobileFiltersOpen(false)}
            sx={{ bgcolor: "#f3f4f6" }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflowY: "auto", pb: 12 }}>{FilterSidebar}</Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: "white",
            borderTop: "1px solid #e5e7eb",
            boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.05)",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            disableElevation
            size="large"
            onClick={() => setMobileFiltersOpen(false)}
            sx={{
              bgcolor: UI.primary,
              borderRadius: 2,
              fontWeight: 700,
              py: 1.5,
            }}
          >
            Show Results
          </Button>
        </Box>
      </Drawer>

      <Footer />
    </>
  );
};

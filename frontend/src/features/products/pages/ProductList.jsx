import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { motion } from "framer-motion";
import LottieComponent from "lottie-react";
import { toast } from "react-toastify";

// --- REDUX & FEATURE IMPORTS ---
import {
  fetchProductsAsync,
  resetProductFetchStatus,
  selectProductFetchStatus,
  selectProductIsFilterOpen,
  selectProductTotalResults,
  selectProducts,
  toggleFilters,
} from "../slice/ProductSlice";
import { ProductCard } from "../components/ProductCard";
import { selectBrands } from "../slice/BrandSlice";
import { selectCategories } from "../slice/CategoriesSlice";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  resetWishlistItemAddStatus,
  resetWishlistItemDeleteStatus,
  selectWishlistItemAddStatus,
  selectWishlistItemDeleteStatus,
  selectWishlistItems,
} from "../../wishlist/slice/WishlistSlice";
import { selectLoggedInUser } from "../../auth/slice/AuthSlice";
import {
  resetCartItemAddStatus,
  selectCartItemAddStatus,
} from "../../cart/slice/CartSlice";

// --- CONSTANTS & ASSETS ---
import { ITEMS_PER_PAGE } from "../../../constants/constants";
import { loadingAnimation } from "../../../assets";

const Lottie = LottieComponent.default || LottieComponent;

const sortOptions = [
  { name: "Price: low to high", sort: "price", order: "asc" },
  { name: "Price: high to low", sort: "price", order: "desc" },
];

export const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(null);
  const theme = useTheme();

  const is700 = useMediaQuery(theme.breakpoints.down(700));
  const is600 = useMediaQuery(theme.breakpoints.down(600));
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is488 = useMediaQuery(theme.breakpoints.down(488));

  const brands = useSelector(selectProducts);
  const categories = useSelector(selectProducts);
  const products = useSelector(selectProducts);
  const totalResults = useSelector(selectProductTotalResults);
  const loggedInUser = useSelector(selectLoggedInUser);

  const productFetchStatus = useSelector(selectProductFetchStatus);

  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus);
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus);

  const cartItemAddStatus = useSelector(selectCartItemAddStatus);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);

  const dispatch = useDispatch();

  const handleBrandFilters = (e) => {
    const filterSet = new Set(filters.brand);
    if (e.target.checked) {
      filterSet.add(e.target.value);
    } else {
      filterSet.delete(e.target.value);
    }
    setFilters({ ...filters, brand: Array.from(filterSet) });
  };

  const handleCategoryFilters = (e) => {
    const filterSet = new Set(filters.category);
    if (e.target.checked) {
      filterSet.add(e.target.value);
    } else {
      filterSet.delete(e.target.value);
    }
    setFilters({ ...filters, category: Array.from(filterSet) });
  };

  const handleQuickCategoryFilter = (categoryId) => {
    setFilters({ ...filters, category: [categoryId] });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [totalResults]);

  useEffect(() => {
    const finalFilters = { ...filters };
    finalFilters["pagination"] = { page: page, limit: ITEMS_PER_PAGE };
    finalFilters["sort"] = sort;

    if (searchParams.get("search")) {
      finalFilters["search"] = searchParams.get("search");
    }

    if (!loggedInUser?.isAdmin) {
      finalFilters["user"] = true;
    }

    dispatch(fetchProductsAsync(finalFilters));
  }, [filters, page, sort, dispatch, loggedInUser, searchParams]);

  const handleAddRemoveFromWishlist = (e, productId) => {
    if (e.target.checked) {
      dispatch(
        createWishlistItemAsync({
          user: loggedInUser?._id,
          product: productId,
        }),
      );
    } else {
      const index = wishlistItems.findIndex(
        (item) => item.product._id === productId,
      );
      dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
    }
  };

  useEffect(() => {
    if (wishlistItemAddStatus === "fulfilled")
      toast.success("Product added to wishlist");
    else if (wishlistItemAddStatus === "rejected")
      toast.error("Error adding product to wishlist");
  }, [wishlistItemAddStatus]);

  useEffect(() => {
    if (wishlistItemDeleteStatus === "fulfilled")
      toast.success("Product removed from wishlist");
    else if (wishlistItemDeleteStatus === "rejected")
      toast.error("Error removing product from wishlist");
  }, [wishlistItemDeleteStatus]);

  useEffect(() => {
    if (cartItemAddStatus === "fulfilled")
      toast.success("Product added to cart");
    else if (cartItemAddStatus === "rejected")
      toast.error("Error adding product to cart");
  }, [cartItemAddStatus]);

  useEffect(() => {
    if (productFetchStatus === "rejected")
      toast.error("Error fetching products");
  }, [productFetchStatus]);

  useEffect(() => {
    return () => {
      dispatch(resetProductFetchStatus());
      dispatch(resetWishlistItemAddStatus());
      dispatch(resetWishlistItemDeleteStatus());
      dispatch(resetCartItemAddStatus());
    };
  }, [dispatch]);

  const handleFilterClose = () => dispatch(toggleFilters());

  return (
    <>
      {productFetchStatus === "pending" ? (
        <Stack
          width={is500 ? "35vh" : "25rem"}
          height={"calc(100vh - 4rem)"}
          justifyContent={"center"}
          margin={"auto"}
        >
          <Lottie animationData={loadingAnimation} />
        </Stack>
      ) : (
        <>
          <motion.div
            style={{
              position: "fixed",
              backgroundColor: "white",
              height: "100vh",
              padding: "1rem",
              overflowY: "scroll",
              width: is500 ? "100vw" : "30rem",
              zIndex: 500,
            }}
            variants={{ show: { left: 0 }, hide: { left: -500 } }}
            initial={"hide"}
            transition={{ ease: "easeInOut", duration: 0.7, type: "spring" }}
            animate={isProductFilterOpen === true ? "show" : "hide"}
          >
            <Stack
              mb={"5rem"}
              sx={{ scrollBehavior: "smooth", overflowY: "scroll" }}
            >
              <Typography variant="h4">Quick Categories</Typography>

              <IconButton
                onClick={handleFilterClose}
                style={{ position: "absolute", top: 15, right: 15 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ClearIcon fontSize="medium" />
                </motion.div>
              </IconButton>

              <Stack rowGap={2} mt={4}>
                <Typography
                  sx={{
                    cursor: "pointer",
                    fontWeight: !filters.category?.length ? 700 : 400,
                    color: !filters.category?.length
                      ? "primary.main"
                      : "text.primary",
                    "&:hover": { color: "primary.main" },
                  }}
                  variant="body2"
                  onClick={() => setFilters({ ...filters, category: [] })}
                >
                  All Products
                </Typography>

                {categories?.slice(0, 6).map((category) => (
                  <Typography
                    key={category._id}
                    sx={{
                      cursor: "pointer",
                      fontWeight: filters.category?.includes(category._id)
                        ? 700
                        : 400,
                      color: filters.category?.includes(category._id)
                        ? "primary.main"
                        : "text.primary",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: "primary.main",
                        transform: "translateX(4px)",
                      },
                    }}
                    variant="body2"
                    onClick={() => handleQuickCategoryFilter(category._id)}
                  >
                    {category.name}
                  </Typography>
                ))}
              </Stack>

              <Stack mt={2}>
                <Accordion>
                  <AccordionSummary expandIcon={<AddIcon />}>
                    <Typography>Brands</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <FormGroup onChange={handleBrandFilters}>
                      {brands?.map((brand) => (
                        <motion.div
                          key={brand._id}
                          style={{ width: "fit-content" }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FormControlLabel
                            sx={{ ml: 1 }}
                            control={
                              <Checkbox
                                checked={
                                  filters.brand?.includes(brand._id) || false
                                }
                                value={brand._id}
                              />
                            }
                            label={brand.name}
                          />
                        </motion.div>
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              </Stack>

              <Stack mt={2}>
                <Accordion>
                  <AccordionSummary expandIcon={<AddIcon />}>
                    <Typography>All Categories</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <FormGroup onChange={handleCategoryFilters}>
                      {categories?.map((category) => (
                        <motion.div
                          key={category._id}
                          style={{ width: "fit-content" }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FormControlLabel
                            sx={{ ml: 1 }}
                            control={
                              <Checkbox
                                checked={
                                  filters.category?.includes(category._id) ||
                                  false
                                }
                                value={category._id}
                              />
                            }
                            label={category.name}
                          />
                        </motion.div>
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </Stack>
          </motion.div>

          <Stack mb={"3rem"}>
            <Stack rowGap={5} mt={is600 ? 2 : 4}>
              {/* sort options */}
              <Stack
                flexDirection={"row"}
                mr={"2rem"}
                justifyContent={"flex-end"}
                alignItems={"center"}
                columnGap={5}
              >
                <Stack alignSelf={"flex-end"} width={"12rem"}>
                  <FormControl fullWidth>
                    <InputLabel id="sort-dropdown">Sort</InputLabel>
                    <Select
                      variant="standard"
                      labelId="sort-dropdown"
                      label="Sort"
                      onChange={(e) => setSort(e.target.value)}
                      value={sort || ""}
                    >
                      <MenuItem value={null}>Reset</MenuItem>
                      {sortOptions.map((option) => (
                        <MenuItem key={option.name} value={option}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              {/* product grid */}
              <Grid
                gap={is700 ? 1 : 2}
                container
                justifyContent={"center"}
                alignContent={"center"}
              >
                {products.map((product) => {
                  const discountedPrice =
                    product.basePrice *
                    (1 - (product.discountPercentage || 0) / 100);
                  return (
                    <ProductCard
                      key={product._id}
                      id={product._id}
                      title={product.title}
                      thumbnail={product.thumbnail}
                      brand={product.brand?.name || "Generic"}
                      price={discountedPrice}
                      originalPrice={product.basePrice}
                      discount={product.discountPercentage}
                      handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                    />
                  );
                })}
              </Grid>

              {/* pagination */}
              <Stack
                alignSelf={is488 ? "center" : "flex-end"}
                mr={is488 ? 0 : 5}
                rowGap={2}
                p={is488 ? 1 : 0}
              >
                <Pagination
                  size={is488 ? "medium" : "large"}
                  page={page}
                  onChange={(e, page) => setPage(page)}
                  count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
                  variant="outlined"
                  shape="rounded"
                />
                <Typography textAlign={"center"}>
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {page * ITEMS_PER_PAGE > totalResults
                    ? totalResults
                    : page * ITEMS_PER_PAGE}{" "}
                  of {totalResults} results
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </>
      )}
    </>
  );
};

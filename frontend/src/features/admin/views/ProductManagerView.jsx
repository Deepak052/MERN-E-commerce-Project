import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Button,
  Paper,
  Chip,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { motion } from "framer-motion";

import {
  deleteProductByIdAsync,
  fetchProductsAsync,
  selectProductTotalResults,
  selectProducts,
  undeleteProductByIdAsync,
} from "../../products/ProductSlice";

import { selectCategories } from "../../categories/CategoriesSlice";
import { ITEMS_PER_PAGE } from "../../../constants";
import { ProductCard } from "../../products/components/ProductCard";
import { UI } from "../theme";

const ProductManagerView = () => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const products = useSelector(selectProducts);
  const totalResults = useSelector(selectProductTotalResults);
  const categories = useSelector(selectCategories);

  useEffect(() => {
    dispatch(
      fetchProductsAsync({
        search,
        category: categoryFilter ? [categoryFilter] : [],
        pagination: { page, limit: ITEMS_PER_PAGE },
      }),
    );
  }, [dispatch, page, search, categoryFilter]);

  const handleDelete = (id) => dispatch(deleteProductByIdAsync(id));
  const handleRestore = (id) => dispatch(undeleteProductByIdAsync(id));

  const getFinalPrice = (p) =>
    p.basePrice - (p.basePrice * p.discountPercentage) / 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        spacing={2}
      >
        {/* LEFT */}
        <Stack direction="row" spacing={2} width="100%">
          <TextField
            placeholder="Search products..."
            size="small"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            sx={{
              width: { xs: "100%", md: 300 },
              backgroundColor: "#fff",
              borderRadius: 2,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160, background: "#fff" }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => {
                setPage(1);
                setCategoryFilter(e.target.value);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {categories?.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* ADD BUTTON */}
        <Button
          component={Link}
          to="/admin/add-product"
          variant="contained"
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          + Add Product
        </Button>
      </Stack>

      {/* EMPTY */}
      {products.length === 0 ? (
        <Box textAlign="center" mt={6}>
          <Typography>No products found</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => {
            const finalPrice = getFinalPrice(product);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <motion.div whileHover={{ y: -6 }}>
                  <Box
                    sx={{
                      opacity: product.isDeleted ? 0.5 : 1,
                      position: "relative",
                    }}
                  >
                    {/* Chips */}
                    {product.stockQuantity < 10 && !product.isDeleted && (
                      <Chip
                        label="Low Stock"
                        color="error"
                        size="small"
                        sx={{ position: "absolute", top: 10, left: 10 }}
                      />
                    )}

                    {product.isDeleted && (
                      <Chip
                        label="Inactive"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          background: "#374151",
                          color: "#fff",
                        }}
                      />
                    )}

                    <ProductCard
                      title={product.title}
                      thumbnail={product.thumbnail}
                      brand={product.brand?.name || "Unbranded"}
                      price={finalPrice}
                      originalPrice={product.basePrice}
                      discount={product.discountPercentage}
                      isAdminCard
                    />

                    {/* ACTIONS */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mt: 1,
                        border: UI.border,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        component={Link}
                        to={`/admin/product-update/${product._id}`}
                        size="small"
                        startIcon={<EditRoundedIcon />}
                      >
                        Edit
                      </Button>

                      {product.isDeleted ? (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleRestore(product._id)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Paper>
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* PAGINATION */}
      {products.length > 0 && (
        <Box display="flex" justifyContent="center" mt={6}>
          <Pagination
            count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
            page={page}
            onChange={(e, p) => setPage(p)}
          />
        </Box>
      )}
    </motion.div>
  );
};

export default ProductManagerView;

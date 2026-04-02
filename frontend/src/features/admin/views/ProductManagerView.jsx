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
import { selectBrands } from "../../brands/BrandSlice";
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
        pagination: { page, limit: ITEMS_PER_PAGE },
        filters: { search, category: categoryFilter },
      }),
    );
  }, [dispatch, page, search, categoryFilter]);

  const handleDelete = (id) => dispatch(deleteProductByIdAsync(id));
  const handleRestore = (id) => dispatch(undeleteProductByIdAsync(id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        spacing={2}
      >
        <TextField
          placeholder="Search products..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: { xs: "100%", md: 350 },
            backgroundColor: "#fff",
            borderRadius: 2,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={2}>
          <FormControl
            size="small"
            sx={{ minWidth: 150, backgroundColor: "#fff" }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categories?.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <motion.div whileHover={{ y: -5 }}>
              <Box
                sx={{
                  opacity: product.isDeleted ? 0.5 : 1,
                  position: "relative",
                }}
              >
                {product.stockQuantity < 10 && !product.isDeleted && (
                  <Chip
                    label="Low Stock"
                    color="error"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      zIndex: 10,
                      fontWeight: 600,
                    }}
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
                      zIndex: 10,
                      backgroundColor: "#374151",
                      color: "white",
                    }}
                  />
                )}
                <ProductCard
                  id={product._id}
                  title={product.title}
                  thumbnail={product.thumbnail}
                  brand={product.brand?.name}
                  price={product.price}
                  isAdminCard
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mt: 1,
                    border: UI.border,
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    backgroundColor: "#fafafa",
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
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" mt={6}>
        <Pagination
          count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
          page={page}
          onChange={(e, p) => setPage(p)}
          color="primary"
          shape="rounded"
        />
      </Box>
    </motion.div>
  );
};

export default ProductManagerView;

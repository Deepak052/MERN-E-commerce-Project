import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import { motion } from "framer-motion";

import {
  deleteProductByIdAsync,
  fetchProductsAsync,
  selectProductTotalResults,
  selectProducts,
  undeleteProductByIdAsync,
} from "../slice/ProductSlice";
import { selectCategories } from "../../categories/slice/CategoriesSlice";
import { ITEMS_PER_PAGE } from "../../../constants";

const UI = {
  bg: "#f8f9fc",
  primary: "#4f46e5",
  primaryLight: "#eef2ff",
  textMain: "#111827",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
};

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
      {/* HEADER & FILTERS */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        spacing={2}
      >
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

        <Button
          component={Link}
          to="/products/add"
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            bgcolor: UI.primary,
            minWidth: "150px",
          }}
        >
          + Add Product
        </Button>
      </Stack>

      {/* PRODUCT LIST / TABLE */}
      {products.length === 0 ? (
        <Box
          textAlign="center"
          mt={6}
          p={4}
          bgcolor="#fff"
          borderRadius={3}
          border={UI.border}
        >
          <Typography variant="h6" fontWeight={700} color={UI.textMain}>
            No products found
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, border: UI.border, boxShadow: "none" }}
        >
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: UI.textMuted }}>
                  Product Info
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: UI.textMuted }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: UI.textMuted }}>
                  Stock
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: UI.textMuted }}>
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: UI.textMuted }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const finalPrice = getFinalPrice(product);
                return (
                  <TableRow
                    key={product._id}
                    sx={{
                      opacity: product.isDeleted ? 0.5 : 1,
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    {/* PRODUCT INFO */}
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: UI.border,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {product.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            SKU: {product.sku}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* PRICE */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {product.hasVariants ? "From " : ""}₹
                        {finalPrice.toFixed(0)}
                      </Typography>
                      {product.discountPercentage > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            textDecoration: "line-through",
                            color: UI.textMuted,
                          }}
                        >
                          ₹{product.basePrice.toFixed(0)}
                        </Typography>
                      )}
                    </TableCell>

                    {/* STOCK */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={
                          product.stockQuantity < 10
                            ? "error.main"
                            : "text.primary"
                        }
                      >
                        {product.stockQuantity} in stock
                      </Typography>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {product.isDeleted ? (
                          <Chip
                            label="Inactive"
                            size="small"
                            sx={{
                              bgcolor: "#f3f4f6",
                              color: "#374151",
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Chip
                            label="Active"
                            size="small"
                            sx={{
                              bgcolor: "#dcfce7",
                              color: "#166534",
                              fontWeight: 700,
                            }}
                          />
                        )}
                        {!product.isDeleted && product.hasVariants && (
                          <Chip
                            icon={<StyleRoundedIcon fontSize="small" />}
                            label={`${product.variants?.length || 0} Variants`}
                            size="small"
                            sx={{
                              bgcolor: UI.primaryLight,
                              color: UI.primary,
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="View Details">
                          <IconButton
                            component={Link}
                            to={`/products/view/${product._id}`}
                            size="small"
                            color="primary"
                          >
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Product">
                          <IconButton
                            component={Link}
                            to={`/products/edit/${product._id}`}
                            size="small"
                            sx={{ color: UI.textMuted }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {product.isDeleted ? (
                          <Tooltip title="Restore Product">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleRestore(product._id)}
                            >
                              <RestoreRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Delete Product">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(product._id)}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* PAGINATION */}
      {products.length > 0 && (
        <Box display="flex" justifyContent="center" mt={6}>
          <Pagination
            count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
            page={page}
            onChange={(e, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}
    </motion.div>
  );
};

export default ProductManagerView;

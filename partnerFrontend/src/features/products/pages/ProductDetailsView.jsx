import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Grid,
  Paper,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Breadcrumbs,
  CircularProgress,
  Button,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";

import {
  fetchProductByIdAsync,
  clearSelectedProduct,
  selectSelectedProduct,
} from "../slice/ProductSlice";

const UI = {
  bg: "#f8f9fc",
  cardBg: "#ffffff",
  primary: "#4f46e5",
  textMain: "#111827",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  radius: 3,
};

export const ProductDetailsView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const product = useSelector(selectSelectedProduct);

  useEffect(() => {
    dispatch(fetchProductByIdAsync(id));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, id]);

  if (!product) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  const finalPrice =
    product.basePrice - (product.basePrice * product.discountPercentage) / 100;

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      {/* HEADER */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ bgcolor: UI.cardBg, border: UI.border }}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="h4"
              fontWeight={800}
              color={UI.textMain}
              letterSpacing="-0.02em"
            >
              Product Details
            </Typography>
          </Stack>
          <Button
            component={Link}
            to={`/products/edit/${product._id}`}
            variant="contained"
            startIcon={<EditRoundedIcon />}
            sx={{
              bgcolor: UI.primary,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Edit Product
          </Button>
        </Stack>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link to="/" style={{ textDecoration: "none", color: UI.textMuted }}>
            Dashboard
          </Link>
          <Link
            to="/products"
            style={{ textDecoration: "none", color: UI.textMuted }}
          >
            Products
          </Link>
          <Typography color="textSecondary" fontWeight={600}>
            {product.sku}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* CONTENT */}
      <Box sx={{ px: { xs: 3, md: 5 } }}>
        <Grid container spacing={4}>
          {/* LEFT COLUMN */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {/* MAIN INFO */}
              <Paper
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: "none",
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 200 },
                      height: 200,
                      borderRadius: 2,
                      border: UI.border,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 1,
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
                  <Box flex={1}>
                    <Stack direction="row" spacing={1} mb={1}>
                      {product.isActive ? (
                        <Chip label="Active" size="small" color="success" />
                      ) : (
                        <Chip label="Inactive" size="small" />
                      )}
                      {product.isDealOfTheDay && (
                        <Chip
                          label="Deal of the Day"
                          size="small"
                          color="warning"
                        />
                      )}
                      {product.isFlashSale && (
                        <Chip label="Flash Sale" size="small" color="error" />
                      )}
                    </Stack>
                    <Typography variant="h5" fontWeight={800} mb={0.5}>
                      {product.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                      mb={2}
                    >
                      SKU: {product.sku}
                    </Typography>

                    <Stack direction="row" spacing={4} mb={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Price
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          ₹{finalPrice.toFixed(0)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Stock
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color={
                            product.stockQuantity < 10
                              ? "error.main"
                              : "text.primary"
                          }
                        >
                          {product.stockQuantity}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* VARIANTS (If Applicable) */}
              {product.hasVariants && (
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: UI.radius,
                    border: UI.border,
                    boxShadow: "none",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                    <StyleRoundedIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Variants ({product.variants?.length})
                    </Typography>
                  </Stack>
                  <TableContainer
                    variant="outlined"
                    sx={{ border: UI.border, borderRadius: 2 }}
                  >
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#f9fafb" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Attributes
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {product.variants?.map((v) => (
                          <TableRow key={v.sku}>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {v.sku}
                            </TableCell>
                            <TableCell>
                              {v.attributes
                                ?.map((attr) => `${attr.name}: ${attr.value}`)
                                .join(", ")}
                            </TableCell>
                            <TableCell>₹{v.price}</TableCell>
                            <TableCell
                              sx={{
                                color:
                                  v.stockQuantity < 10
                                    ? "error.main"
                                    : "inherit",
                                fontWeight: 600,
                              }}
                            >
                              {v.stockQuantity}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* GALLERY IMAGES */}
              {product.images?.length > 0 && (
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: UI.radius,
                    border: UI.border,
                    boxShadow: "none",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    Image Gallery
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {product.images.map((img, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          border: UI.border,
                          p: 1,
                        }}
                      >
                        <img
                          src={img}
                          alt={`Gallery ${i}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* ORGANIZATION */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: "none",
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Organization
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.category?.name || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Brand
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.brand?.name || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* GLOBAL ATTRIBUTES */}
              {product.attributes?.length > 0 && (
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: UI.radius,
                    border: UI.border,
                    boxShadow: "none",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    Global Attributes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    {product.attributes.map((attr, i) => (
                      <Box
                        key={i}
                        display="flex"
                        justifyContent="space-between"
                      >
                        <Typography variant="body2" color="text.secondary">
                          {attr.name}:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {attr.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* SEO DATA */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: "none",
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  SEO Data
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Meta Title
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.seo?.metaTitle || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Meta Description
                    </Typography>
                    <Typography variant="body2">
                      {product.seo?.metaDescription || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Keywords
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {product.seo?.keywords?.map((k, i) => (
                        <Chip
                          key={i}
                          label={k}
                          size="small"
                          sx={{ bgcolor: "#f3f4f6" }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

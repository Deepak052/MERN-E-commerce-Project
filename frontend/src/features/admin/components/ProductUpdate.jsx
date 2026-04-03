import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  resetProductUpdateStatus,
  selectProductUpdateStatus,
  selectSelectedProduct,
  updateProductByIdAsync,
} from "../../products/ProductSlice";

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  CircularProgress,
  Grid,
  FormHelperText,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

import { useForm } from "react-hook-form";
import { selectBrands } from "../../brands/BrandSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { toast } from "react-toastify";
import { uploadImageToCloudinary } from "../../../config/axios"; // Adjust path if needed

export const ProductUpdate = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedProduct = useSelector(selectSelectedProduct);
  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const productUpdateStatus = useSelector(selectProductUpdateStatus);

  const theme = useTheme();
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  // State for Cloudinary upload loaders
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Watch values for real-time image previews
  const formValues = watch();
  const thumbnailUrl = formValues.thumbnail;

  // ✅ Fetch product
  useEffect(() => {
    if (id) dispatch(fetchProductByIdAsync(id));
  }, [id, dispatch]);

  // ✅ Set form values properly
  useEffect(() => {
    if (selectedProduct) {
      reset({
        title: selectedProduct.title,
        description: selectedProduct.description,
        basePrice: selectedProduct.basePrice,
        discountPercentage: selectedProduct.discountPercentage,
        stockQuantity: selectedProduct.stockQuantity,
        thumbnail: selectedProduct.thumbnail,
        brand: selectedProduct.brand?._id || "",
        category: selectedProduct.category?._id || "",
        ...selectedProduct.images.reduce((acc, img, i) => {
          acc[`image${i}`] = img;
          return acc;
        }, {}),
      });
    }
  }, [selectedProduct, reset]);

  // ✅ Update status handling & Navigate Back
  useEffect(() => {
    if (productUpdateStatus === "fulfilled") {
      toast.success("Product Updated successfully!");
      navigate(-1); // 🔙 True navigate back to previous screen
    } else if (productUpdateStatus === "rejected") {
      toast.error("Error updating product");
    }
  }, [productUpdateStatus, navigate]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(resetProductUpdateStatus());
    };
  }, [dispatch]);

  // ✅ Submit
  const handleProductUpdate = (data) => {
    const images = Object.keys(data)
      .filter((key) => key.startsWith("image"))
      .map((key) => data[key]);

    const updatedProduct = {
      ...data,
      _id: selectedProduct._id,
      images,
    };

    dispatch(updateProductByIdAsync(updatedProduct));
  };

  // ✅ Cloudinary Handlers
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploadingThumb(true);
      const url = await uploadImageToCloudinary(file);
      setValue("thumbnail", url, { shouldValidate: true, shouldDirty: true });
      toast.success("Thumbnail uploaded successfully!");
    } catch (error) {
      toast.error("Thumbnail upload failed.");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handleAdditionalImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImages((prev) => ({ ...prev, [index]: true }));
      const url = await uploadImageToCloudinary(file);
      setValue(`image${index}`, url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success(`Image ${index + 1} updated!`);
    } catch (error) {
      toast.error("Image upload failed.");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  return (
    <Stack alignItems="center" p={2}>
      {selectedProduct && (
        <Stack
          width="60rem"
          maxWidth="100%"
          spacing={4}
          component="form"
          noValidate // Disables default HTML5 validation bubbles to use MUI's styled errors
          onSubmit={handleSubmit(handleProductUpdate)}
        >
          {/* TITLE */}
          <Stack>
            <Typography fontWeight={600} mb={1}>
              Title
            </Typography>
            <TextField
              {...register("title", {
                required: "Product title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters long",
                },
              })}
              error={!!errors.title}
              helperText={errors.title?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* BRAND + CATEGORY */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth error={!!errors.brand}>
              <InputLabel id="brand-select-label">Brand</InputLabel>
              <Select
                labelId="brand-select-label"
                label="Brand"
                {...register("brand", { required: "Brand is required" })}
                defaultValue={selectedProduct.brand?._id || ""}
              >
                <MenuItem value="" disabled>
                  Select a brand
                </MenuItem>
                {brands.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.brand && (
                <FormHelperText>{errors.brand.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.category}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                label="Category"
                {...register("category", { required: "Category is required" })}
                defaultValue={selectedProduct.category?._id || ""}
              >
                <MenuItem value="" disabled>
                  Select a category
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category.message}</FormHelperText>
              )}
            </FormControl>
          </Stack>

          {/* DESCRIPTION */}
          <Stack>
            <Typography fontWeight={600} mb={1}>
              Description
            </Typography>
            <TextField
              multiline
              rows={4}
              {...register("description", {
                required: "Description is required",
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* PRICE */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Base Price ($)"
              type="number"
              fullWidth
              {...register("basePrice", {
                required: "Base price is required",
                min: { value: 0, message: "Price cannot be negative" },
              })}
              error={!!errors.basePrice}
              helperText={errors.basePrice?.message}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Discount Percentage (%)"
              type="number"
              fullWidth
              {...register("discountPercentage", {
                min: { value: 0, message: "Discount cannot be negative" },
                max: { value: 100, message: "Discount cannot exceed 100%" },
              })}
              error={!!errors.discountPercentage}
              helperText={errors.discountPercentage?.message}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {/* STOCK */}
          <TextField
            label="Stock Quantity"
            type="number"
            {...register("stockQuantity", {
              required: "Stock quantity is required",
              min: { value: 0, message: "Stock cannot be negative" },
            })}
            error={!!errors.stockQuantity}
            helperText={errors.stockQuantity?.message}
            InputLabelProps={{ shrink: true }}
          />

          {/* ========================================== */}
          {/* 🖼️ CLOUDINARY THUMBNAIL UPLOAD UI */}
          {/* ========================================== */}
          <Stack>
            <Typography fontWeight={600} mb={1}>
              Main Thumbnail{" "}
              {errors.thumbnail && (
                <span
                  style={{
                    color: "#d32f2f",
                    fontSize: "0.85rem",
                    fontWeight: 400,
                  }}
                >
                  {" "}
                  - Required
                </span>
              )}
            </Typography>
            <input
              type="hidden"
              {...register("thumbnail", {
                required: "Thumbnail image is required",
              })}
            />
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="upload-thumbnail"
              type="file"
              onChange={handleThumbnailUpload}
            />
            <label htmlFor="upload-thumbnail">
              <Box
                sx={{
                  width: "100%",
                  height: 250,
                  border: "2px dashed",
                  borderColor: errors.thumbnail ? "#d32f2f" : "#d1d5db", // Turns red if empty and submitted
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#f9fafb",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": { borderColor: "#6366f1", bgcolor: "#eff6ff" },
                }}
              >
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      opacity: isUploadingThumb ? 0.3 : 1,
                    }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    {isUploadingThumb ? (
                      <CircularProgress size={28} />
                    ) : (
                      <CloudUploadRoundedIcon
                        sx={{
                          color: errors.thumbnail ? "#d32f2f" : "#9ca3af",
                          fontSize: 40,
                        }}
                      />
                    )}
                    <Typography
                      color={errors.thumbnail ? "error" : "primary"}
                      fontWeight={600}
                    >
                      Click to upload thumbnail
                    </Typography>
                  </Stack>
                )}
              </Box>
            </label>
          </Stack>

          {/* ========================================== */}
          {/* 📸 CLOUDINARY ADDITIONAL IMAGES UI */}
          {/* ========================================== */}
          <Stack spacing={2}>
            <Typography fontWeight={600}>Additional Images</Typography>
            <Grid container spacing={2}>
              {selectedProduct.images?.map((_, i) => {
                const imgVal = formValues[`image${i}`];
                const isUploading = uploadingImages[i];

                return (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <input type="hidden" {...register(`image${i}`)} />
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id={`upload-image-${i}`}
                      type="file"
                      onChange={(e) => handleAdditionalImageUpload(e, i)}
                    />
                    <label htmlFor={`upload-image-${i}`}>
                      <Box
                        sx={{
                          height: 150,
                          border: "2px dashed #d1d5db",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#f9fafb",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            borderColor: "#6366f1",
                            bgcolor: "#eff6ff",
                          },
                        }}
                      >
                        {imgVal ? (
                          <img
                            src={imgVal}
                            alt={`Product Image ${i + 1}`}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                              opacity: isUploading ? 0.3 : 1,
                            }}
                          />
                        ) : (
                          <Stack alignItems="center" spacing={1}>
                            {isUploading ? (
                              <CircularProgress size={24} />
                            ) : (
                              <CloudUploadRoundedIcon
                                sx={{ color: "#9ca3af" }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              color="primary"
                              fontWeight={600}
                            >
                              Replace Image {i + 1}
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    </label>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>

          {/* ACTIONS */}
          <Stack direction="row" justifyContent="flex-end" spacing={2} pt={2}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(-1)} // 🔙 Safely cancel and go back
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={
                isUploadingThumb || Object.values(uploadingImages).some(Boolean)
              }
            >
              Update Product
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  Grid,
  Breadcrumbs,
  Divider,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { toast } from "react-toastify";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";

// Redux & API
import {
  addProductAsync,
  resetProductAddStatus,
  selectProductAddStatus,
} from "../../products/ProductSlice";
import { selectBrands } from "../../brands/BrandSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { uploadImageToCloudinary } from "../../../config/axios"; // Adjust path if needed

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  radius: 3,
};

export const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const productAddStatus = useSelector(selectProductAddStatus);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
      discountPercentage: 0,
      stockQuantity: 0,
      attributes: [], // Initializes dynamic attributes array
    },
  });

  // Allows dynamic adding/removing of attributes (Color, Size, etc.)
  const {
    fields: attributeFields,
    append: addAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  const formValues = watch();
  const title = formValues.title;
  const thumbnailUrl = formValues.thumbnail;

  // Auto-generate Slug from Title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [title, setValue]);

  // Handle Response
  useEffect(() => {
    if (productAddStatus === "fulfilled" && isSubmitted) {
      toast.success("New product created successfully!");
      reset();
      setIsSubmitted(false);
      navigate(-1); // Go back to products list
    } else if (productAddStatus === "rejected" && isSubmitted) {
      toast.error(
        "Error adding product, please check unique fields (SKU/Slug).",
      );
      setIsSubmitted(false);
    }
  }, [productAddStatus, isSubmitted, navigate, reset]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(resetProductAddStatus());
    };
  }, [dispatch]);

  // Submit Handler -> Formats payload exactly to your Mongoose Schema
  const handleAddProduct = (data) => {
    setIsSubmitted(true);

    // 1. Gather all successfully uploaded additional images
    const images = [data.image0, data.image1, data.image2, data.image3].filter(
      Boolean,
    );

    // 2. Format SEO keywords from a comma-separated string to an array
    let keywordsArray = [];
    if (data.seoKeywords && data.seoKeywords.trim()) {
      keywordsArray = data.seoKeywords.split(",").map((k) => k.trim());
    }

    // 3. Construct the final Payload
    const newProduct = {
      title: data.title,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      basePrice: Number(data.basePrice),
      discountPercentage: Number(data.discountPercentage),
      stockQuantity: Number(data.stockQuantity),
      category: data.category,
      brand: data.brand || undefined, // Brand is optional
      thumbnail: data.thumbnail,
      images: images,
      attributes: data.attributes,
      seo: {
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        keywords: keywordsArray,
      },
      isActive: data.isActive,
    };

    dispatch(addProductAsync(newProduct));
  };

  // Cloudinary Uploaders
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
      toast.success(`Image ${index + 1} added!`);
    } catch (error) {
      toast.error("Image upload failed.");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      {/* HEADER */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            to="/admin/dashboard"
            style={{
              textDecoration: "none",
              color: UI.textMuted,
              fontSize: "0.875rem",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/products"
            style={{
              textDecoration: "none",
              color: UI.textMuted,
              fontSize: "0.875rem",
            }}
          >
            Products
          </Link>
          <Typography color={UI.textMain} fontSize="0.875rem" fontWeight={600}>
            New Product
          </Typography>
        </Breadcrumbs>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ border: UI.border, bgcolor: UI.cardBg, mt: 0.5 }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              color={UI.textMain}
              letterSpacing="-0.02em"
            >
              Create Product
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* FORM GRID */}
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(handleAddProduct)}
        sx={{ px: { xs: 3, md: 5 } }}
      >
        <Grid container spacing={4}>
          {/* LEFT COLUMN: Main Details (70%) */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {/* Basic Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Basic Information
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Product Title"
                    {...register("title", { required: "Title is required" })}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    InputLabelProps={{ shrink: true }}
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <TextField
                      fullWidth
                      label="URL Slug"
                      {...register("slug", { required: "Slug is required" })}
                      error={!!errors.slug}
                      helperText={errors.slug?.message}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkRoundedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="SKU (Stock Keeping Unit)"
                      {...register("sku", { required: "SKU is required" })}
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                      InputLabelProps={{ shrink: true }}
                      placeholder="e.g., SONY-A7IV-001"
                      sx={{ input: { textTransform: "uppercase" } }}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={5}
                    {...register("description", {
                      required: "Description is required",
                    })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Paper>

              {/* Pricing & Inventory */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Pricing & Inventory
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                  <TextField
                    fullWidth
                    label="Base Price ($)"
                    type="number"
                    {...register("basePrice", {
                      required: "Price is required",
                      min: 0,
                    })}
                    error={!!errors.basePrice}
                    helperText={errors.basePrice?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Discount Percentage (%)"
                    type="number"
                    {...register("discountPercentage", { min: 0, max: 100 })}
                    error={!!errors.discountPercentage}
                    helperText={errors.discountPercentage?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    type="number"
                    {...register("stockQuantity", {
                      required: "Stock is required",
                      min: 0,
                    })}
                    error={!!errors.stockQuantity}
                    helperText={errors.stockQuantity?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Paper>

              {/* Attributes (Dynamic) */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography variant="h6" fontWeight={700}>
                    Product Attributes
                  </Typography>
                  <Button
                    startIcon={<AddCircleOutlineRoundedIcon />}
                    onClick={() => addAttribute({ name: "", value: "" })}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Add Attribute
                  </Button>
                </Stack>
                {attributeFields.length === 0 ? (
                  <Typography variant="body2" color={UI.textMuted}>
                    No attributes added yet (e.g., Color, Size, Material).
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {attributeFields.map((field, index) => (
                      <Stack
                        key={field.id}
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Name (e.g., Color)"
                          {...register(`attributes.${index}.name`, {
                            required: true,
                          })}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Value (e.g., Black)"
                          {...register(`attributes.${index}.value`, {
                            required: true,
                          })}
                          InputLabelProps={{ shrink: true }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeAttribute(index)}
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* SEO Settings */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Search Engine Optimization
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    {...register("metaTitle")}
                    InputLabelProps={{ shrink: true }}
                    placeholder="Used for browser tabs and search engine results"
                  />
                  <TextField
                    fullWidth
                    label="Meta Description"
                    multiline
                    rows={2}
                    {...register("metaDescription")}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Keywords (Comma separated)"
                    {...register("seoKeywords")}
                    InputLabelProps={{ shrink: true }}
                    placeholder="e.g., camera, mirrorless, sony, photography"
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN: Media & Meta (30%) */}
          <Grid item xs={12} lg={4}>
            <Box
              sx={{
                position: "sticky",
                top: 24,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Actions & Organization */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={
                    status === "pending" ||
                    isUploadingThumb ||
                    Object.values(uploadingImages).some(Boolean)
                  }
                  sx={{
                    bgcolor: UI.primary,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 4px 6px -1px rgb(99 102 241 / 0.4)",
                  }}
                >
                  {status === "pending" && isSubmitted
                    ? "Publishing..."
                    : "Publish Product"}
                </Button>
                <Divider sx={{ my: 3 }} />

                <Box
                  mb={3}
                  sx={{
                    p: 2,
                    border: UI.border,
                    borderRadius: 2,
                    bgcolor: "#f9fafb",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        color="success"
                        defaultChecked
                        {...register("isActive")}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={700}>
                        Active on Store
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>

                <Stack spacing={3}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel id="cat-label">Category</InputLabel>
                    <Select
                      labelId="cat-label"
                      label="Category"
                      {...register("category", {
                        required: "Category is required",
                      })}
                      defaultValue=""
                    >
                      <MenuItem value="" disabled>
                        Select Category
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

                  <FormControl fullWidth>
                    <InputLabel id="brand-label">Brand</InputLabel>
                    <Select
                      labelId="brand-label"
                      label="Brand"
                      {...register("brand")}
                      defaultValue=""
                    >
                      <MenuItem value="">No Brand</MenuItem>
                      {brands.map((b) => (
                        <MenuItem key={b._id} value={b._id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>

              {/* Media: Thumbnail */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={UI.textSecondary}
                  mb={2}
                >
                  Main Thumbnail{" "}
                  {errors.thumbnail && (
                    <span style={{ color: "#d32f2f" }}>*</span>
                  )}
                </Typography>
                <input
                  type="hidden"
                  {...register("thumbnail", { required: true })}
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
                      height: 200,
                      border: "2px dashed",
                      borderColor: errors.thumbnail ? "#d32f2f" : "#d1d5db",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#f9fafb",
                      cursor: "pointer",
                      overflow: "hidden",
                      "&:hover": { borderColor: UI.primary },
                    }}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Thumb"
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
                          variant="body2"
                          color={errors.thumbnail ? "error" : "primary"}
                          fontWeight={600}
                        >
                          Upload Thumbnail
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </label>
              </Paper>

              {/* Media: Gallery Images */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={UI.textSecondary}
                  mb={2}
                >
                  Product Gallery
                </Typography>
                <Grid container spacing={2}>
                  {[0, 1, 2, 3].map((i) => {
                    const imgVal = formValues[`image${i}`];
                    const isUploading = uploadingImages[i];
                    return (
                      <Grid item xs={6} key={i}>
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
                              height: 100,
                              border: "2px dashed #d1d5db",
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "#f9fafb",
                              cursor: "pointer",
                              overflow: "hidden",
                              "&:hover": { borderColor: UI.primary },
                            }}
                          >
                            {imgVal ? (
                              <img
                                src={imgVal}
                                alt={`Gallery ${i}`}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  opacity: isUploading ? 0.3 : 1,
                                }}
                              />
                            ) : (
                              <Stack alignItems="center">
                                {isUploading ? (
                                  <CircularProgress size={20} />
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
                                  Add Image
                                </Typography>
                              </Stack>
                            )}
                          </Box>
                        </label>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

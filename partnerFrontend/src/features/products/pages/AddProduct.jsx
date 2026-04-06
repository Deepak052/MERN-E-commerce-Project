import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  Tooltip,
  Collapse,
} from "@mui/material";
import { toast } from "react-toastify";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Redux
import {
  addProductAsync,
  resetProductAddStatus,
  selectProductAddStatus,
  selectProducts,
  fetchProductsAsync,
} from "../slice/ProductSlice";
import { selectBrands } from "../../brands/slice/BrandSlice";
import { selectCategories } from "../../categories/slice/CategoriesSlice";

const UI = {
  bg: "#f8f9fc",
  cardBg: "#ffffff",
  primary: "#4f46e5",
  textMain: "#111827",
  textSecondary: "#374151",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  radius: 3,
  shadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
};

const rules = {
  requiredStr: { required: "Required" },
  slug: {
    required: "Required",
    pattern: { value: /^[a-z0-9-]+$/, message: "Lowercase and hyphens only" },
  },
  sku: {
    required: "Required",
    pattern: { value: /^[A-Z0-9-]+$/, message: "Uppercase, numbers, hyphens" },
  },
  price: {
    required: "Required",
    min: { value: 0, message: "Cannot be negative" },
  },
  stock: {
    required: "Required",
    min: { value: 0, message: "Cannot be negative" },
  },
};

// ======================================================================
// 🚨 NEW: NESTED VARIANT COMPONENT (Handles Attributes per Variant)
// ======================================================================
const VariantRow = ({ control, register, index, removeVariant, errors }) => {
  const {
    fields: attributes,
    append: addAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: `variants.${index}.attributes`,
  });

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "#ffffff",
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        position: "relative",
        mb: 2,
      }}
    >
      <IconButton
        size="small"
        color="error"
        onClick={() => removeVariant(index)}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <DeleteOutlineRoundedIcon />
      </IconButton>

      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Variant {index + 1}
      </Typography>

      {/* Variant Base Details */}
      <Grid container spacing={2} pr={4} mb={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Variant SKU *"
            {...register(`variants.${index}.sku`, rules.sku)}
            error={!!errors?.variants?.[index]?.sku}
            sx={{ input: { textTransform: "uppercase" } }}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Price ($) *"
            {...register(`variants.${index}.price`, rules.price)}
            error={!!errors?.variants?.[index]?.price}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Stock *"
            {...register(`variants.${index}.stockQuantity`, rules.stock)}
            error={!!errors?.variants?.[index]?.stockQuantity}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Nested Attributes Array (Color, Material, Size, etc.) */}
      <Typography
        variant="body2"
        fontWeight={600}
        mb={1}
        color={UI.textSecondary}
      >
        Variant Attributes (e.g., Color: Black, Screen: 4 inch)
      </Typography>
      <Stack spacing={1.5} mb={2}>
        {attributes.map((attr, attrIndex) => (
          <Stack key={attr.id} direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              label="Attribute Name"
              placeholder="e.g. Color"
              {...register(
                `variants.${index}.attributes.${attrIndex}.name`,
                rules.requiredStr,
              )}
              error={!!errors?.variants?.[index]?.attributes?.[attrIndex]?.name}
            />
            <TextField
              fullWidth
              size="small"
              label="Attribute Value"
              placeholder="e.g. Black"
              {...register(
                `variants.${index}.attributes.${attrIndex}.value`,
                rules.requiredStr,
              )}
              error={
                !!errors?.variants?.[index]?.attributes?.[attrIndex]?.value
              }
            />
            <IconButton
              color="error"
              size="small"
              onClick={() => removeAttribute(attrIndex)}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button
        variant="text"
        size="small"
        startIcon={<AddCircleOutlineRoundedIcon />}
        onClick={() => addAttribute({ name: "", value: "" })}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        Add Attribute
      </Button>
    </Box>
  );
};

// ======================================================================
// MAIN ADD PRODUCT COMPONENT
// ======================================================================
export const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const brands = useSelector(selectBrands);
  const categories = useSelector(selectCategories);
  const productAddStatus = useSelector(selectProductAddStatus);
  const products = useSelector(selectProducts);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState({});
  const [galleryPreviews, setGalleryPreviews] = useState({});

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
      isDealOfTheDay: false,
      isFlashSale: false,
      isBundle: false,
      bundleItems: [],
      hasVariants: false,
      discountPercentage: 0,
      basePrice: "",
      stockQuantity: "",
      attributes: [],
      variants: [],
    },
    mode: "onBlur",
  });

  const isBundle = watch("isBundle");
  const hasVariants = watch("hasVariants");
  const title = watch("title");

  const {
    fields: globalAttributes,
    append: addGlobalAttribute,
    remove: removeGlobalAttribute,
  } = useFieldArray({ control, name: "attributes" });
  const {
    fields: variantFields,
    append: addVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  useEffect(() => {
    if (!products || products.length === 0) dispatch(fetchProductsAsync());
  }, [dispatch, products]);

  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [title, setValue]);

  useEffect(() => {
    if (productAddStatus === "fulfilled" && isSubmitted) {
      toast.success("Product created successfully!");
      reset();
      setIsSubmitted(false);
      navigate(-1);
    } else if (productAddStatus === "rejected" && isSubmitted) {
      toast.error(
        "Failed to create product. Check if SKU/Slug already exists.",
      );
      setIsSubmitted(false);
    }
  }, [productAddStatus, isSubmitted, navigate, reset]);

  useEffect(() => {
    return () => dispatch(resetProductAddStatus());
  }, [dispatch]);

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleGallerySelect = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setGalleryFiles((prev) => ({ ...prev, [index]: file }));
    setGalleryPreviews((prev) => ({
      ...prev,
      [index]: URL.createObjectURL(file),
    }));
  };

  const handleAddProduct = (data) => {
    if (!thumbnailFile) {
      toast.error("Main thumbnail is required!");
      return;
    }

    setIsSubmitted(true);
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("sku", data.sku);
    formData.append("description", data.description);
    formData.append("basePrice", hasVariants ? 0 : Number(data.basePrice));
    formData.append("discountPercentage", Number(data.discountPercentage));
    formData.append(
      "stockQuantity",
      hasVariants ? 0 : Number(data.stockQuantity),
    );
    formData.append("category", data.category);
    if (data.brand) formData.append("brand", data.brand);

    formData.append("isActive", data.isActive);
    formData.append("isDealOfTheDay", data.isDealOfTheDay);
    formData.append("isFlashSale", data.isFlashSale);
    formData.append("isBundle", data.isBundle);
    formData.append("hasVariants", data.hasVariants);

    const keywordsArray = data.seoKeywords
      ? data.seoKeywords.split(",").map((k) => k.trim())
      : [];
    formData.append(
      "seo",
      JSON.stringify({
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: keywordsArray,
      }),
    );

    // Global Attributes
    formData.append("attributes", JSON.stringify(data.attributes));
    formData.append(
      "bundleItems",
      JSON.stringify(data.isBundle ? data.bundleItems : []),
    );

    // 🚨 FIX: Format Variants EXACTLY as the backend expects
    const formattedVariants =
      data.variants?.map((v) => ({
        sku: v.sku,
        price: Number(v.price),
        stockQuantity: Number(v.stockQuantity),
        attributes: v.attributes || [], // Takes the nested array directly!
      })) || [];
    formData.append("variants", JSON.stringify(formattedVariants));

    formData.append("thumbnail", thumbnailFile);
    [0, 1, 2, 3].forEach((i) => {
      if (galleryFiles[i]) formData.append(`image${i}`, galleryFiles[i]);
    });

    dispatch(addProductAsync(formData));
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
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
            Add New Product
          </Typography>
        </Stack>
      </Box>

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(handleAddProduct)}
        sx={{ px: { xs: 3, md: 5 } }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {/* BASIC INFO */}
              <Paper
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  General Information
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Product Title *"
                    {...register("title", rules.requiredStr)}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <TextField
                      fullWidth
                      label="URL Slug *"
                      {...register("slug", rules.slug)}
                      error={!!errors.slug}
                      helperText={errors.slug?.message}
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
                      label="Parent SKU *"
                      {...register("sku", rules.sku)}
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                      sx={{ input: { textTransform: "uppercase" } }}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Description *"
                    multiline
                    rows={5}
                    {...register("description", rules.requiredStr)}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                </Stack>
              </Paper>

              {/* MEDIA */}
              <Paper
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Media
                </Typography>
                <Typography variant="body2" color={UI.textMuted} mb={3}>
                  Upload a main thumbnail and up to 4 gallery images.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="upload-thumbnail"
                      type="file"
                      onChange={handleThumbnailSelect}
                    />
                    <label htmlFor="upload-thumbnail">
                      <Box
                        sx={{
                          height: 180,
                          border: "2px dashed",
                          borderColor:
                            !thumbnailPreview && isSubmitted
                              ? "#ef4444"
                              : "#d1d5db",
                          borderRadius: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#f9fafb",
                          cursor: "pointer",
                          "&:hover": { borderColor: UI.primary },
                        }}
                      >
                        {thumbnailPreview ? (
                          <img
                            src={thumbnailPreview}
                            alt="Thumb"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Stack alignItems="center" spacing={1}>
                            <CloudUploadRoundedIcon
                              sx={{
                                color:
                                  !thumbnailPreview && isSubmitted
                                    ? "#ef4444"
                                    : "#9ca3af",
                                fontSize: 32,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color={
                                !thumbnailPreview && isSubmitted
                                  ? "error"
                                  : "primary"
                              }
                              fontWeight={600}
                            >
                              Main Thumbnail *
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    </label>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <Grid container spacing={2}>
                      {[0, 1, 2, 3].map((i) => {
                        const preview = galleryPreviews[i];
                        return (
                          <Grid item xs={6} key={i}>
                            <input
                              accept="image/*"
                              style={{ display: "none" }}
                              id={`upload-image-${i}`}
                              type="file"
                              onChange={(e) => handleGallerySelect(e, i)}
                            />
                            <label htmlFor={`upload-image-${i}`}>
                              <Box
                                sx={{
                                  height: 82,
                                  border: "1px dashed #d1d5db",
                                  borderRadius: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "#f9fafb",
                                  cursor: "pointer",
                                  "&:hover": { borderColor: UI.primary },
                                }}
                              >
                                {preview ? (
                                  <img
                                    src={preview}
                                    alt={`Gallery ${i}`}
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : (
                                  <Stack alignItems="center">
                                    <CloudUploadRoundedIcon
                                      sx={{ color: "#9ca3af", fontSize: 20 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                    >
                                      Gallery {i + 1}
                                    </Typography>
                                  </Stack>
                                )}
                              </Box>
                            </label>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>

              {/* GLOBAL ATTRIBUTES */}
              <Paper
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
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Global Attributes
                    </Typography>
                    <Typography variant="body2" color={UI.textMuted}>
                      Applies to the entire product (e.g. Brand, Warranty).
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddCircleOutlineRoundedIcon />}
                    onClick={() => addGlobalAttribute({ name: "", value: "" })}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Add
                  </Button>
                </Stack>
                {globalAttributes.length > 0 && (
                  <Stack spacing={2}>
                    {globalAttributes.map((field, index) => (
                      <Stack
                        key={field.id}
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Name"
                          placeholder="e.g. Warranty"
                          {...register(
                            `attributes.${index}.name`,
                            rules.requiredStr,
                          )}
                          error={!!errors?.attributes?.[index]?.name}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Value"
                          placeholder="e.g. 1 Year"
                          {...register(
                            `attributes.${index}.value`,
                            rules.requiredStr,
                          )}
                          error={!!errors?.attributes?.[index]?.value}
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeGlobalAttribute(index)}
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* PRICING & VARIANTS */}
              <Paper
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
                  mb={2}
                >
                  <Typography variant="h6" fontWeight={700}>
                    Pricing & Inventory
                  </Typography>
                  <FormControlLabel
                    control={
                      <Controller
                        name="hasVariants"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            color="primary"
                            checked={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              if (
                                e.target.checked &&
                                variantFields.length === 0
                              ) {
                                addVariant({
                                  sku: "",
                                  price: "",
                                  stockQuantity: "",
                                  attributes: [{ name: "", value: "" }],
                                });
                              }
                            }}
                          />
                        )}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        This product has variants
                      </Typography>
                    }
                  />
                </Stack>
                <Divider sx={{ mb: 3 }} />

                <Collapse in={!hasVariants}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <TextField
                      fullWidth
                      label="Price ($) *"
                      type="number"
                      {...register("basePrice", hasVariants ? {} : rules.price)}
                      error={!!errors.basePrice}
                      helperText={errors.basePrice?.message}
                    />
                    <TextField
                      fullWidth
                      label="Stock Quantity *"
                      type="number"
                      {...register(
                        "stockQuantity",
                        hasVariants ? {} : rules.stock,
                      )}
                      error={!!errors.stockQuantity}
                      helperText={errors.stockQuantity?.message}
                    />
                    <TextField
                      fullWidth
                      label="Discount (%)"
                      type="number"
                      {...register("discountPercentage", { min: 0, max: 100 })}
                      error={!!errors.discountPercentage}
                    />
                  </Stack>
                </Collapse>

                {/* 🚨 NEW: NESTED VARIANT BUILDER */}
                <Collapse in={hasVariants}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "#f3f4f6",
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      mb={2}
                      color={UI.primary}
                    >
                      Variant Configurations
                    </Typography>

                    {variantFields.map((field, index) => (
                      <VariantRow
                        key={field.id}
                        control={control}
                        register={register}
                        index={index}
                        removeVariant={removeVariant}
                        errors={errors}
                      />
                    ))}

                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddCircleOutlineRoundedIcon />}
                      onClick={() =>
                        addVariant({
                          sku: "",
                          price: "",
                          stockQuantity: "",
                          attributes: [{ name: "", value: "" }],
                        })
                      }
                      sx={{ mt: 1, textTransform: "none", fontWeight: 700 }}
                    >
                      Add Another Variant
                    </Button>
                  </Box>
                </Collapse>
              </Paper>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
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
              <Paper
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Organization
                </Typography>
                <Stack spacing={3}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      label="Category *"
                      {...register("category", rules.requiredStr)}
                      defaultValue=""
                    >
                      {categories?.map((c) => (
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
                    <InputLabel>Brand</InputLabel>
                    <Select
                      label="Brand"
                      {...register("brand")}
                      defaultValue=""
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {brands?.map((b) => (
                        <MenuItem key={b._id} value={b._id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Storefront Visibility
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            color="success"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        Active Product
                      </Typography>
                    }
                  />
                  <Divider sx={{ my: 1 }} />
                  <FormControlLabel
                    control={
                      <Controller
                        name="isDealOfTheDay"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            color="warning"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        Promote as Deal of the Day
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Controller
                        name="isFlashSale"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            color="error"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        Include in Flash Sale
                      </Typography>
                    }
                  />
                  <Divider sx={{ my: 1 }} />
                  <FormControlLabel
                    control={
                      <Controller
                        name="isBundle"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            color="info"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={600}>
                          Is a Combo/Bundle
                        </Typography>
                      </Box>
                    }
                  />
                  <Collapse in={isBundle}>
                    <FormControl fullWidth sx={{ mt: 1 }} size="small">
                      <InputLabel>Select Included Products</InputLabel>
                      <Select
                        multiple
                        {...register("bundleItems")}
                        defaultValue={[]}
                      >
                        {products?.length > 0 ? (
                          products.map((p) => (
                            <MenuItem key={p._id} value={p._id}>
                              {p.title}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No products available</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Collapse>
                </Stack>
              </Paper>

              <Paper
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
                  disabled={productAddStatus === "pending"}
                  sx={{
                    bgcolor: UI.primary,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {productAddStatus === "pending" && isSubmitted
                    ? "Publishing..."
                    : "Publish Product"}
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

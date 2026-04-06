import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
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
  CircularProgress,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";

import {
  addCategoryAsync,
  updateCategoryByIdAsync,
  getCategoryByIdAsync,
  selectCategoryStatus,
  selectSelectedCategory,
  selectCategories,
  resetCategoryStatus,
  clearSelectedCategory,
} from "../slice/CategoriesSlice";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#f8f9fc",
  card: "#ffffff",
  primary: "#4f46e5",
  primaryLight: "#eef2ff",
  primaryDark: "#3730a3",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: "#111827",
  textSub: "#374151",
  textMuted: "#9ca3af",
  border: "1.5px solid #e5e7eb",
  borderFocus: "1.5px solid #4f46e5",
  shadow: "0 1px 4px 0 rgba(0,0,0,0.07)",
  shadowMd: "0 4px 16px 0 rgba(79,70,229,0.10)",
  radius: "14px",
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const NoCategoriesEmptyState = ({ onCreateClick }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 420,
      gap: 2.5,
      textAlign: "center",
      px: 3,
    }}
  >
    <Box
      sx={{
        width: 90,
        height: 90,
        borderRadius: "50%",
        background: T.primaryLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 1,
      }}
    >
      <FolderOpenRoundedIcon sx={{ fontSize: 44, color: T.primary }} />
    </Box>
    <Typography
      variant="h5"
      fontWeight={800}
      color={T.text}
      letterSpacing="-0.02em"
    >
      No Categories Yet
    </Typography>
    <Typography variant="body1" color={T.textMuted} maxWidth={360}>
      You haven't created any categories. Start by adding your first top-level
      category — subcategories can be added once you have at least one.
    </Typography>
    <Button
      variant="contained"
      size="large"
      startIcon={<AddRoundedIcon />}
      onClick={onCreateClick}
      sx={{
        mt: 1,
        bgcolor: T.primary,
        borderRadius: "10px",
        fontWeight: 700,
        px: 4,
        py: 1.4,
        boxShadow: T.shadowMd,
        textTransform: "none",
        "&:hover": { bgcolor: T.primaryDark },
      }}
    >
      Create First Category
    </Button>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const AddEditCategoryView = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectCategoryStatus);
  const selectedCategory = useSelector(selectSelectedCategory);
  const allCategories = useSelector(selectCategories) || [];

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categoryLevel, setCategoryLevel] = useState("root");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 🚨 File & Preview States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Root-only categories eligible as parents
  const availableParents = allCategories.filter(
    (cat) => !cat.parentCategory && cat._id !== id && cat.isActive !== false,
  );
  const hasRootCategories = availableParents.length > 0;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control, // 👈 Needed for Switch Controller
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
      parentCategory: "",
      name: "",
      slug: "",
      description: "",
    },
  });

  const categoryName = watch("name");
  const watchedParent = watch("parentCategory");

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(resetCategoryStatus());
    if (isEditMode) {
      dispatch(getCategoryByIdAsync(id));
    } else {
      dispatch(clearSelectedCategory());
      reset({
        name: "",
        slug: "",
        description: "",
        parentCategory: "",
        isActive: true,
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [id, isEditMode, dispatch, reset]);

  // ── Populate form on edit ─────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && selectedCategory && selectedCategory._id === id) {
      const level = selectedCategory.parentCategory ? "sub" : "root";
      setCategoryLevel(level);
      reset({
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        description: selectedCategory.description || "",
        parentCategory: selectedCategory.parentCategory?._id || "",
        isActive: selectedCategory.isActive,
      });

      // Set image preview if one exists
      if (selectedCategory.thumbnail) {
        setPreviewUrl(selectedCategory.thumbnail);
      }
    }
  }, [selectedCategory, isEditMode, reset, id]);

  // ── Auto-generate slug ────────────────────────────────────────────────────
  useEffect(() => {
    if (categoryName && !isEditMode) {
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [categoryName, setValue, isEditMode]);

  // ── Handle status ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isSubmitted && status === "fulfilled") {
      setSubmitSuccess(true);
      toast.success(isEditMode ? "Category updated!" : "Category created!");
      setTimeout(() => navigate("/categories"), 1200);
    }
    if (isSubmitted && status === "rejected") {
      toast.error(
        "Something went wrong. Please try again or check for duplicate slugs.",
      );
      setIsSubmitted(false);
    }
  }, [status, isSubmitted, isEditMode, navigate]);

  // ── Image Selection (Local) ───────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Submit via FormData ───────────────────────────────────────────────────
  const onSubmit = (data) => {
    setIsSubmitted(true);
    const formData = new FormData();

    // Append text fields
    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("description", data.description || "");
    formData.append("isActive", data.isActive);

    // Handle parent logic
    const finalParent =
      categoryLevel === "root" ? "" : data.parentCategory || "";
    formData.append("parentCategory", finalParent);

    // Append file if selected
    if (selectedFile) {
      formData.append("thumbnail", selectedFile);
    }

    if (isEditMode) {
      formData.append("_id", id);
      dispatch(updateCategoryByIdAsync(formData));
    } else {
      dispatch(addCategoryAsync(formData));
    }
  };

  const handleLevelChange = (_, val) => {
    if (!val) return;
    // Prevent switching to sub if no parents available
    if (val === "sub" && !hasRootCategories) return;
    setCategoryLevel(val);
    if (val === "root") setValue("parentCategory", "");
  };

  const isPending = status === "pending" && isSubmitted;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          pt: 4,
          pb: 3,
          borderBottom: "1.5px solid #f0f1f5",
          bgcolor: "#fff",
          mb: 4,
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1.5 }}
        >
          <Link
            to="/"
            style={{ textDecoration: "none", color: T.textMuted, fontSize: 13 }}
          >
            Dashboard
          </Link>
          <Link
            to="/categories"
            style={{ textDecoration: "none", color: T.textMuted, fontSize: 13 }}
          >
            Categories
          </Link>
          <Typography fontSize={13} color={T.text} fontWeight={600}>
            {isEditMode ? "Edit" : "New"} Category
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            color={T.text}
            letterSpacing="-0.03em"
          >
            {isEditMode ? "Edit Category" : "Create Category"}
          </Typography>
          {isEditMode && (
            <Chip
              label="Editing"
              size="small"
              sx={{
                bgcolor: T.primaryLight,
                color: T.primary,
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          )}
        </Box>
        <Typography variant="body2" color={T.textMuted} mt={0.5}>
          {isEditMode
            ? "Update the details for this category."
            : "Fill in the details below to create a new category."}
        </Typography>
      </Box>

      {/* ── Form ── */}
      <Box component="form" noValidate sx={{ px: { xs: 3, md: 5 } }}>
        <Grid container spacing={4}>
          {/* ─── LEFT COLUMN ─────────────────────────────────────────── */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3.5}>
              {/* ── 1. Category Level Card ── */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: T.radius,
                  border: T.border,
                  boxShadow: T.shadow,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography variant="h6" fontWeight={800} color={T.text}>
                    Category Type
                  </Typography>
                  <Tooltip
                    title="Top-level categories appear in the main navigation. Subcategories are nested under a parent."
                    arrow
                  >
                    <InfoOutlinedIcon
                      sx={{ fontSize: 16, color: T.textMuted, cursor: "help" }}
                    />
                  </Tooltip>
                </Box>
                <Typography variant="body2" color={T.textMuted} mb={3}>
                  Is this a top-level category or a subcategory?
                </Typography>

                <ToggleButtonGroup
                  value={categoryLevel}
                  exclusive
                  onChange={handleLevelChange}
                  fullWidth
                  sx={{
                    mb: 0,
                    gap: 2,
                    "& .MuiToggleButtonGroup-grouped": {
                      border: "1.5px solid #e5e7eb !important",
                      borderRadius: "10px !important",
                    },
                  }}
                >
                  <ToggleButton
                    value="root"
                    sx={{
                      py: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: "10px",
                      color: categoryLevel === "root" ? T.primary : T.textSub,
                      bgcolor:
                        categoryLevel === "root"
                          ? T.primaryLight
                          : "transparent",
                      "&.Mui-selected": {
                        bgcolor: T.primaryLight,
                        color: T.primary,
                      },
                      "&.Mui-selected:hover": { bgcolor: "#e0e7ff" },
                    }}
                  >
                    <LayersRoundedIcon sx={{ mr: 1.2, fontSize: 20 }} />
                    Top-level Category
                  </ToggleButton>

                  <ToggleButton
                    value="sub"
                    disabled={!hasRootCategories && !isEditMode}
                    sx={{
                      py: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: "10px",
                      color: categoryLevel === "sub" ? T.primary : T.textSub,
                      bgcolor:
                        categoryLevel === "sub"
                          ? T.primaryLight
                          : "transparent",
                      "&.Mui-selected": {
                        bgcolor: T.primaryLight,
                        color: T.primary,
                      },
                      "&.Mui-selected:hover": { bgcolor: "#e0e7ff" },
                      "&.Mui-disabled": { opacity: 0.45 },
                    }}
                  >
                    <AccountTreeRoundedIcon sx={{ mr: 1.2, fontSize: 20 }} />
                    Subcategory
                    {!hasRootCategories && !isEditMode && (
                      <Chip
                        label="No parents"
                        size="small"
                        sx={{
                          ml: 1.5,
                          fontSize: 10,
                          height: 18,
                          bgcolor: "#fef3c7",
                          color: "#92400e",
                        }}
                      />
                    )}
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Warning when sub is locked */}
                <AnimatePresence>
                  {!hasRootCategories && !isEditMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert
                        severity="warning"
                        icon={<WarningAmberRoundedIcon fontSize="small" />}
                        sx={{ mt: 2.5, borderRadius: "10px", fontSize: 13 }}
                      >
                        You need at least one{" "}
                        <strong>top-level category</strong> before creating a
                        subcategory. Create a top-level category first, then
                        come back.
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Parent selector */}
                <AnimatePresence>
                  {categoryLevel === "sub" && (
                    <motion.div
                      key="parent-selector"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <TextField
                        select
                        fullWidth
                        label="Parent Category *"
                        value={watchedParent}
                        {...register("parentCategory", {
                          required:
                            categoryLevel === "sub"
                              ? "Please select a parent category"
                              : false,
                        })}
                        onChange={(e) =>
                          setValue("parentCategory", e.target.value, {
                            shouldValidate: true,
                          })
                        }
                        error={!!errors.parentCategory}
                        helperText={
                          errors.parentCategory
                            ? errors.parentCategory.message
                            : "This category will appear under the selected parent"
                        }
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ displayEmpty: true }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                          "& .MuiFormHelperText-root": {
                            color: errors.parentCategory
                              ? T.danger
                              : T.textMuted,
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <Typography color={T.textMuted}>
                            — Select a parent category —
                          </Typography>
                        </MenuItem>
                        {availableParents.map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              {cat.thumbnail ? (
                                <img
                                  src={cat.thumbnail}
                                  alt=""
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 4,
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <LayersRoundedIcon
                                  sx={{ fontSize: 18, color: T.textMuted }}
                                />
                              )}
                              {cat.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Paper>

              {/* ── 2. Basic Details Card ── */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: T.radius,
                  border: T.border,
                  boxShadow: T.shadow,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color={T.text}
                  mb={3.5}
                >
                  Basic Details
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Category Name *"
                    placeholder="e.g. Men's Clothing"
                    {...register("name", {
                      required: "Category name is required",
                    })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="URL Slug *"
                    placeholder="e.g. mens-clothing"
                    {...register("slug", {
                      required: "Slug is required",
                      pattern: {
                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        message: "Only lowercase letters, numbers, and hyphens",
                      },
                    })}
                    error={!!errors.slug}
                    helperText={
                      errors.slug?.message ||
                      "Auto-generated from name. Used in the URL."
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                      "& .MuiFormHelperText-root": {
                        color: errors.slug ? T.danger : T.textMuted,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="Briefly describe what this category covers..."
                    multiline
                    rows={4}
                    {...register("description")}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                    }}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* ─── RIGHT COLUMN ─────────────────────────────────────────── */}
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
              {/* ── Publish Card ── */}
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: T.radius,
                  border: T.border,
                  boxShadow: T.shadow,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color={T.text}
                  mb={2.5}
                >
                  Publish
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending || submitSuccess}
                  startIcon={
                    submitSuccess ? (
                      <CheckCircleRoundedIcon />
                    ) : isPending ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : null
                  }
                  sx={{
                    bgcolor: submitSuccess ? T.success : T.primary,
                    py: 1.5,
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: 15,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: submitSuccess ? T.success : T.primaryDark,
                      boxShadow: "none",
                    },
                    transition: "background 0.3s",
                  }}
                >
                  {submitSuccess
                    ? "Saved!"
                    : isPending
                      ? "Saving..."
                      : isEditMode
                        ? "Update Category"
                        : "Create Category"}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate("/categories")}
                  sx={{
                    mt: 1.5,
                    color: T.textMuted,
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                  }}
                >
                  Cancel
                </Button>

                <Divider sx={{ my: 2.5 }} />

                {/* 🚨 UPDATED Active Switch with Controller */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={T.textSub}
                    >
                      Active on Store
                    </Typography>
                    <Typography variant="caption" color={T.textMuted}>
                      Visible to customers
                    </Typography>
                  </Box>
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
                </Box>

                {/* Summary chips */}
                <Box
                  sx={{ mt: 2.5, display: "flex", gap: 1, flexWrap: "wrap" }}
                >
                  <Chip
                    icon={
                      categoryLevel === "root" ? (
                        <LayersRoundedIcon />
                      ) : (
                        <AccountTreeRoundedIcon />
                      )
                    }
                    label={
                      categoryLevel === "root" ? "Top-level" : "Subcategory"
                    }
                    size="small"
                    sx={{
                      bgcolor: T.primaryLight,
                      color: T.primary,
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                  {categoryLevel === "sub" && watchedParent && (
                    <Chip
                      label={`Under: ${availableParents.find((p) => p._id === watchedParent)?.name || "..."}`}
                      size="small"
                      sx={{
                        bgcolor: "#f0fdf4",
                        color: "#166534",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  )}
                </Box>
              </Paper>

              {/* ── Thumbnail Card (Local Upload) ── */}
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: T.radius,
                  border: T.border,
                  boxShadow: T.shadow,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color={T.text}
                  mb={0.5}
                >
                  Thumbnail
                </Typography>
                <Typography
                  variant="caption"
                  color={T.textMuted}
                  display="block"
                  mb={2}
                >
                  Recommended: 400×400 px, PNG or JPG
                </Typography>

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="local-upload-button"
                  type="file"
                  onChange={handleImageSelect}
                />
                <label htmlFor="local-upload-button">
                  <Box
                    sx={{
                      height: 180,
                      border: previewUrl
                        ? "2px solid #e5e7eb"
                        : "2px dashed #d1d5db",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: previewUrl ? "#fff" : "#f9fafb",
                      cursor: "pointer",
                      overflow: "hidden",
                      transition: "border-color 0.2s, background 0.2s",
                      "&:hover": {
                        borderColor: T.primary,
                        bgcolor: T.primaryLight,
                      },
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          maxWidth: "90%",
                          maxHeight: "90%",
                          objectFit: "contain",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            bgcolor: T.primaryLight,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CloudUploadRoundedIcon
                            sx={{ color: T.primary, fontSize: 22 }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={T.primary}
                        >
                          Click to upload
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </label>

                {previewUrl && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    sx={{
                      mt: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    Remove image
                  </Button>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

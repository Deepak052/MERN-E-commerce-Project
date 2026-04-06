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
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { toast } from "react-toastify";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

// Redux
import {
  addBannerAsync,
  updateBannerByIdAsync,
  getBannerByIdAsync,
  selectBannerStatus,
  selectSelectedBanner,
  resetBannerStatus,
} from "../slice/BannerSlice";
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
  shadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
  radius: 3,
};

export const AddEditBannerView = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectBannerStatus);
  const selectedBanner = useSelector(selectSelectedBanner);
  const brands = useSelector(selectBrands) || [];
  const categories = useSelector(selectCategories) || [];

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
      redirectType: "custom",
      redirectTarget: "",
    },
  });

  const redirectType = watch("redirectType");

  // 1. Initialization
  useEffect(() => {
    dispatch(resetBannerStatus());
    if (isEditMode) dispatch(getBannerByIdAsync(id));
    else
      reset({
        title: "",
        redirectType: "custom",
        redirectTarget: "",
        isActive: true,
      });
  }, [id, isEditMode, dispatch, reset]);

  // 2. Populate Edit Data
  useEffect(() => {
    if (isEditMode && selectedBanner && selectedBanner._id === id) {
      // Reverse-engineer the URL to set the correct dropdown states
      let rType = "custom";
      let rTarget = selectedBanner.redirectUrl || "/";

      if (rTarget.includes("category=")) {
        rType = "category";
        rTarget = rTarget.split("category=")[1];
      } else if (rTarget.includes("brand=")) {
        rType = "brand";
        rTarget = rTarget.split("brand=")[1];
      }

      reset({
        title: selectedBanner.title,
        redirectType: rType,
        redirectTarget: rTarget,
        isActive: selectedBanner.isActive,
      });
      setImagePreview(selectedBanner.image);
    }
  }, [selectedBanner, isEditMode, reset, id]);

  // 3. Status Handling
  useEffect(() => {
    if (status === "fulfilled" && isSubmitted) {
      toast.success(
        `Banner ${isEditMode ? "updated" : "created"} successfully!`,
      );
      setIsSubmitted(false);
      navigate(-1);
    } else if (status === "rejected" && isSubmitted) {
      toast.error("Operation failed.");
      setIsSubmitted(false);
    }
  }, [status, navigate, isSubmitted, isEditMode]);

  // 4. Image Handler
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // 5. Form Submit (Using FormData)
  const onSubmit = (data) => {
    if (!imagePreview && !imageFile) {
      return toast.error("Banner image is required");
    }

    setIsSubmitted(true);
    const formData = new FormData();

    // Compile the final URL based on the admin's selection
    let finalUrl = data.redirectTarget;
    if (data.redirectType === "category")
      finalUrl = `/products?category=${data.redirectTarget}`;
    if (data.redirectType === "brand")
      finalUrl = `/products?brand=${data.redirectTarget}`;

    formData.append("title", data.title);
    formData.append("redirectUrl", finalUrl);
    formData.append("isActive", data.isActive);
    if (imageFile) formData.append("image", imageFile);

    if (isEditMode) {
      formData.append("_id", id);
      dispatch(updateBannerByIdAsync(formData));
    } else {
      dispatch(addBannerAsync(formData));
    }
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
            {isEditMode ? "Edit Banner" : "Create Banner"}
          </Typography>
        </Stack>
      </Box>

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ px: { xs: 3, md: 5 } }}
      >
        <Grid container spacing={4}>
          {/* LEFT: Details */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={4}>
                  Banner Details
                </Typography>

                <Stack spacing={3.5}>
                  <TextField
                    fullWidth
                    label="Banner Title (Internal Reference)"
                    placeholder="e.g., Summer Sale 2026"
                    {...register("title", { required: "Title required" })}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    InputLabelProps={{ shrink: true }}
                  />

                  {/* 🚨 NEW: Dynamic Destination Builder */}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <FormControl fullWidth sx={{ maxWidth: { sm: 200 } }}>
                      <InputLabel>Link To</InputLabel>
                      <Select
                        label="Link To"
                        {...register("redirectType")}
                        defaultValue="custom"
                      >
                        <MenuItem value="category">Category Page</MenuItem>
                        <MenuItem value="brand">Brand Page</MenuItem>
                        <MenuItem value="custom">Custom URL</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth error={!!errors.redirectTarget}>
                      {redirectType === "category" ? (
                        <>
                          <InputLabel>Select Category</InputLabel>
                          <Select
                            label="Select Category"
                            {...register("redirectTarget", {
                              required: "Please select a category",
                            })}
                            defaultValue=""
                          >
                            <MenuItem value="" disabled>
                              Choose a category...
                            </MenuItem>
                            {categories.map((c) => (
                              <MenuItem key={c._id} value={c._id}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </>
                      ) : redirectType === "brand" ? (
                        <>
                          <InputLabel>Select Brand</InputLabel>
                          <Select
                            label="Select Brand"
                            {...register("redirectTarget", {
                              required: "Please select a brand",
                            })}
                            defaultValue=""
                          >
                            <MenuItem value="" disabled>
                              Choose a brand...
                            </MenuItem>
                            {brands.map((b) => (
                              <MenuItem key={b._id} value={b._id}>
                                {b.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </>
                      ) : (
                        <TextField
                          fullWidth
                          label="Custom URL Path"
                          placeholder="e.g. /products"
                          {...register("redirectTarget", {
                            required: "URL required",
                          })}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      {errors.redirectTarget && (
                        <FormHelperText>
                          {errors.redirectTarget.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Stack>
                </Stack>
              </Paper>

              {/* 🚨 UPDATED: Local Image Preview */}
              <Paper
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Banner Image{" "}
                  {!imagePreview && (
                    <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                      * Required
                    </span>
                  )}
                </Typography>

                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="banner-upload"
                  type="file"
                  onChange={handleImageSelect}
                />
                <label htmlFor="banner-upload">
                  <Box
                    sx={{
                      height: 300,
                      border: "2px dashed",
                      borderColor:
                        !imagePreview && isSubmitted ? "#ef4444" : "#d1d5db",
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
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Banner Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={1.5}>
                        <CloudUploadRoundedIcon
                          sx={{ color: UI.textMuted, fontSize: 40 }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={UI.primary}
                        >
                          Click to upload High-Res Banner (e.g., 1920x600)
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </label>
              </Paper>
            </Stack>
          </Grid>

          {/* RIGHT: Actions */}
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
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={status === "pending"}
                  sx={{
                    bgcolor: UI.primary,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  {status === "pending" && isSubmitted
                    ? "Saving..."
                    : "Save Banner"}
                </Button>
                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={UI.textSecondary}
                  mb={2}
                >
                  Visibility
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: UI.border,
                    borderRadius: 2,
                    bgcolor: "#f9fafb",
                  }}
                >
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
                      <Typography variant="body2" fontWeight={700}>
                        Active on Storefront
                      </Typography>
                    }
                  />
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

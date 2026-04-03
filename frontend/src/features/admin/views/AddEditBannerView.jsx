import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
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
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

// Redux & API (Assume you have created a BannerSlice similar to CategorySlice)
import {
  addBannerAsync,
  updateBannerByIdAsync,
  getBannerByIdAsync,
  selectBannerStatus,
  selectSelectedBanner,
  resetBannerStatus,
} from "../../banners/BannerSlice";
import { uploadImageToCloudinary } from "../../../config/axios";

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  radius: 3,
};

export const AddEditBannerView = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectBannerStatus);
  const selectedBanner = useSelector(selectSelectedBanner);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { isActive: true },
  });

  const imageUrl = watch("image");

  useEffect(() => {
    dispatch(resetBannerStatus());
    if (isEditMode) {
      dispatch(getBannerByIdAsync(id));
    } else {
      reset({ title: "", image: "", redirectUrl: "/", isActive: true });
    }
  }, [id, isEditMode, dispatch, reset]);

  useEffect(() => {
    if (isEditMode && selectedBanner && selectedBanner._id === id) {
      reset({
        title: selectedBanner.title,
        image: selectedBanner.image,
        redirectUrl: selectedBanner.redirectUrl || "/",
        isActive: selectedBanner.isActive,
      });
    }
  }, [selectedBanner, isEditMode, reset, id]);

  useEffect(() => {
    if (status === "fulfilled" && isSubmitted) {
      toast.success(
        `Banner ${isEditMode ? "updated" : "created"} successfully!`,
      );
      setIsSubmitted(false);
      navigate("/admin/dashboard"); // Or wherever your banner list is
    } else if (status === "rejected" && isSubmitted) {
      toast.error("Operation failed.");
      setIsSubmitted(false);
    }
  }, [status, navigate, isSubmitted, isEditMode]);

  const onSubmit = (data) => {
    setIsSubmitted(true);
    if (isEditMode) {
      dispatch(updateBannerByIdAsync({ _id: id, ...data }));
    } else {
      dispatch(addBannerAsync(data));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadImageToCloudinary(file);
      setValue("image", url, { shouldValidate: true, shouldDirty: true });
      toast.success("Banner image uploaded!");
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            to="/admin/dashboard"
            style={{ textDecoration: "none", color: UI.textMuted }}
          >
            Dashboard
          </Link>
          <Typography color={UI.textMain} fontWeight={600}>
            {isEditMode ? "Edit" : "New"} Banner
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
            <Typography variant="h4" fontWeight={800} color={UI.textMain}>
              {isEditMode ? "Edit Banner" : "Create Banner"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box component="form" noValidate sx={{ px: { xs: 3, md: 5 } }}>
        <Grid container spacing={4}>
          {/* LEFT: Details */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              <Paper
                elevation={0}
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
                  <TextField
                    fullWidth
                    label="Redirect URL"
                    placeholder="e.g., /products?category=shoes"
                    {...register("redirectUrl", {
                      required: "Redirect URL required",
                    })}
                    error={!!errors.redirectUrl}
                    helperText="Where should users go when they click this banner?"
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Paper>

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
                  Banner Image{" "}
                  {errors.image && (
                    <span style={{ color: "#d32f2f", fontSize: "0.85rem" }}>
                      * Required
                    </span>
                  )}
                </Typography>
                <input
                  type="hidden"
                  {...register("image", { required: "Image is required" })}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="cloudinary-upload-button"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="cloudinary-upload-button">
                  <Box
                    sx={{
                      height: 300,
                      border: "2px dashed",
                      borderColor: errors.image ? "#d32f2f" : "#d1d5db",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#f9fafb",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Banner"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: isUploading ? 0.3 : 1,
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={1.5}>
                        {isUploading ? (
                          <CircularProgress size={24} />
                        ) : (
                          <CloudUploadRoundedIcon
                            sx={{
                              color: errors.image ? "#d32f2f" : UI.textMuted,
                              fontSize: 40,
                            }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={errors.image ? "error" : UI.primary}
                        >
                          Upload High-Res Banner (e.g., 1920x600)
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
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleSubmit(onSubmit)}
                  disabled={status === "pending" || isUploading}
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
                      <Switch color="success" {...register("isActive")} />
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

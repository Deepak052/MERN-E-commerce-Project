import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useParams } from "react-router-dom";
// 🚨 NEW: Import Controller
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
  InputAdornment,
} from "@mui/material";
import { toast } from "react-toastify";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

// Redux
import {
  addBrandAsync,
  updateBrandAsync,
  getBrandByIdAsync,
  selectSelectedBrand,
  selectBrandAddStatus,
  selectBrandUpdateStatus,
  selectBrandErrors,
  resetBrandStatus,
} from "../slice/BrandSlice";

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  radius: 3,
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
};

export const AddEditBrandView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const addStatus = useSelector(selectBrandAddStatus);
  const updateStatus = useSelector(selectBrandUpdateStatus);
  const authError = useSelector(selectBrandErrors);
  const selectedBrand = useSelector(selectSelectedBrand);

  const status = isEditMode ? updateStatus : addStatus;
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control, // 🚨 NEW: Destructure control here
    formState: { errors },
  } = useForm({
    defaultValues: { isActive: true, isFeatured: false },
  });

  const brandName = watch("name");

  useEffect(() => {
    dispatch(resetBrandStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode) dispatch(getBrandByIdAsync(id));
  }, [id, isEditMode, dispatch]);

  useEffect(() => {
    if (isEditMode && selectedBrand) {
      setValue("name", selectedBrand.name);
      setValue("slug", selectedBrand.slug);
      setValue("description", selectedBrand.description);

      // These will now properly update the UI because of the Controller component!
      setValue("isActive", selectedBrand.isActive);
      setValue("isFeatured", selectedBrand.isFeatured || false);

      if (selectedBrand.logo) setPreviewUrl(selectedBrand.logo);
    }
  }, [selectedBrand, isEditMode, setValue]);

  useEffect(() => {
    if (brandName) {
      const slug = brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug);
    }
  }, [brandName, setValue]);

  useEffect(() => {
    if (status === "fulfilled" && isSubmitted) {
      toast.success(isEditMode ? "Brand updated!" : "Brand created!");
      setIsSubmitted(false);
      navigate("/brands");
    }
    if (status === "rejected" && isSubmitted) {
      toast.error(authError?.message || "Something went wrong");
      setIsSubmitted(false);
    }
  }, [status, isSubmitted, authError, navigate, isEditMode]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = (data) => {
    setIsSubmitted(true);
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("slug", data.slug);
    formData.append("description", data.description || "");
    formData.append("isActive", data.isActive);
    formData.append("isFeatured", data.isFeatured);

    if (selectedFile) {
      formData.append("logo", selectedFile);
    }

    if (isEditMode) {
      formData.append("_id", id);
      dispatch(updateBrandAsync(formData));
    } else {
      dispatch(addBrandAsync(formData));
    }
  };

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: "100vh", p: 4 }}>
      {/* HEADER */}
      <Breadcrumbs separator={<NavigateNextIcon />}>
        <Link
          to="/brands"
          style={{ textDecoration: "none", color: UI.textMuted }}
        >
          Brands
        </Link>
        <Typography color={UI.textMain} fontWeight={600}>
          {isEditMode ? "Edit Brand" : "Create Brand"}
        </Typography>
      </Breadcrumbs>

      <Typography
        variant="h4"
        fontWeight={800}
        mt={2}
        mb={3}
        color={UI.textMain}
      >
        {isEditMode ? "Edit Brand" : "Create Brand"}
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 4,
              borderRadius: UI.radius,
              border: UI.border,
              boxShadow: UI.shadow,
            }}
          >
            <Stack spacing={3}>
              <TextField
                label="Brand Name"
                fullWidth
                {...register("name", { required: true })}
                error={!!errors.name}
              />

              <TextField
                label="Slug"
                fullWidth
                {...register("slug", { required: true })}
                error={!!errors.slug}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                {...register("description")}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 4,
              borderRadius: UI.radius,
              border: UI.border,
              boxShadow: UI.shadow,
            }}
          >
            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={status === "pending"}
              sx={{ bgcolor: UI.primary, fontWeight: 700, mb: 3 }}
            >
              {status === "pending"
                ? "Saving..."
                : isEditMode
                  ? "Update Brand"
                  : "Save Brand"}
            </Button>

            {/* 🚨 UPDATED: Controller for Featured Switch */}
            <Box
              mb={2}
              p={2}
              sx={{
                bgcolor: "#f9fafb",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
              }}
            >
              <FormControlLabel
                control={
                  <Controller
                    name="isFeatured"
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
                  <Typography variant="body2" fontWeight={700}>
                    Highlight as Featured
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            {/* 🚨 UPDATED: Controller for Active Switch */}
            <Box
              mb={3}
              p={2}
              sx={{
                bgcolor: "#f9fafb",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
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
                    Active on Store
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            {/* Image Upload Area */}
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={UI.textSecondary}
              mb={1}
            >
              Brand Logo
            </Typography>
            <input
              type="file"
              hidden
              id="upload"
              onChange={handleImageSelect}
              accept="image/*"
            />
            <label htmlFor="upload">
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
                  overflow: "hidden",
                  "&:hover": { borderColor: UI.primary },
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <CloudUploadRoundedIcon
                      sx={{ color: "#9ca3af", fontSize: 40 }}
                    />
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight={600}
                    >
                      Upload Logo
                    </Typography>
                  </Stack>
                )}
              </Box>
            </label>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

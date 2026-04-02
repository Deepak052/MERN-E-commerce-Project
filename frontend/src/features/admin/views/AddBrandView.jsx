import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useParams } from "react-router-dom";
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
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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
} from "../../brands/BrandSlice";

import { uploadImageToCloudinary } from "../../../config/axios";

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  textMain: "#111827",
  textSecondary: "#4b5563",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  radius: 3,
};

export const AddBrandView = () => {
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
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { isActive: true },
  });

  const brandName = watch("name");
  const logoUrl = watch("logo");

  // reset
  useEffect(() => {
    dispatch(resetBrandStatus());
  }, [dispatch]);

  // fetch brand for edit
  useEffect(() => {
    if (isEditMode) {
      dispatch(getBrandByIdAsync(id));
    }
  }, [id, isEditMode, dispatch]);

  // fill form
  useEffect(() => {
    if (isEditMode && selectedBrand) {
      setValue("name", selectedBrand.name);
      setValue("slug", selectedBrand.slug);
      setValue("description", selectedBrand.description);
      setValue("logo", selectedBrand.logo);
      setValue("isActive", selectedBrand.isActive);
    }
  }, [selectedBrand, isEditMode, setValue]);

  // slug auto-gen
  useEffect(() => {
    if (brandName) {
      const slug = brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug);
    }
  }, [brandName, setValue]);

  // success / error
  useEffect(() => {
    if (status === "fulfilled" && isSubmitted) {
      toast.success(isEditMode ? "Brand updated!" : "Brand created!");
      setIsSubmitted(false);
      navigate("/admin/brands");
    }

    if (status === "rejected" && isSubmitted) {
      toast.error(authError?.message || "Something went wrong");
      setIsSubmitted(false);
    }
  }, [status, isSubmitted, authError, navigate, isEditMode]);

  const onSubmit = (data) => {
    setIsSubmitted(true);

    if (isEditMode) {
      dispatch(updateBrandAsync({ ...data, _id: id }));
    } else {
      dispatch(addBrandAsync(data));
    }
  };

  // upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImageToCloudinary(file);
      setValue("logo", url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // loading state (edit)
  if (isEditMode && !selectedBrand) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: "100vh", p: 4 }}>
      {/* HEADER */}
      <Breadcrumbs separator={<NavigateNextIcon />}>
        <Link to="/admin/brands">Brands</Link>
        <Typography>{isEditMode ? "Edit Brand" : "Create Brand"}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" mt={2} mb={3}>
        {isEditMode ? "Edit Brand" : "Create Brand"}
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Brand Name"
                {...register("name", { required: true })}
                error={!!errors.name}
              />

              <TextField
                label="Slug"
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
                multiline
                rows={4}
                {...register("description")}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              disabled={status === "pending" || isUploading}
            >
              {status === "pending"
                ? "Saving..."
                : isEditMode
                  ? "Update Brand"
                  : "Save Brand"}
            </Button>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={<Switch defaultChecked {...register("isActive")} />}
              label="Active"
            />

            <Divider sx={{ my: 2 }} />

            <input
              type="file"
              hidden
              id="upload"
              onChange={handleImageUpload}
            />

            <label htmlFor="upload">
              <Box
                sx={{
                  height: 150,
                  border: "2px dashed gray",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {isUploading ? (
                  <CircularProgress />
                ) : logoUrl ? (
                  <img src={logoUrl} height={100} />
                ) : (
                  <CloudUploadRoundedIcon />
                )}
              </Box>
            </label>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Grid,
  Paper,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Box,
  Chip,
  Skeleton,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Tooltip,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import { motion } from "framer-motion";

import {
  fetchAllBrandsForAdminAsync,
  selectAdminBrands,
  selectBrandStatus,
  deleteBrandAsync,
  updateBrandAsync,
} from "../slice/BrandSlice";

import { UI } from "../../../theme/theme";

const BrandManagerView = () => {
  const dispatch = useDispatch();
  const brands = useSelector(selectAdminBrands);
  const status = useSelector(selectBrandStatus);
  const navigate = useNavigate();

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllBrandsForAdminAsync());
  }, [dispatch]);

  // ✅ Delete handler
  const handleDelete = () => {
    dispatch(deleteBrandAsync(deleteId));
    setDeleteId(null);
  };

  // ✅ Toggle active/inactive
  const handleToggleActive = (brand) => {
    // 🚨 FIX: Send as FormData to match the API expectation
    const formData = new FormData();
    formData.append("_id", brand._id);
    formData.append("isActive", !brand.isActive);
    dispatch(updateBrandAsync(formData));
  };

  // ✅ Toggle featured status
  const handleToggleFeatured = (brand) => {
    // 🚨 FIX: Send as FormData to match the API expectation
    const formData = new FormData();
    formData.append("_id", brand._id);
    formData.append("isFeatured", !brand.isFeatured);
    dispatch(updateBrandAsync(formData));
  };

  if (status === "pending") {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* ✅ Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={700} color={UI.textMain}>
          Brand Manager
        </Typography>

        <Button
          variant="contained"
          component={Link}
          to="/brands/add"
          sx={{ bgcolor: UI.primary, fontWeight: 700 }}
        >
          + Add Brand
        </Button>
      </Stack>

      {/* ✅ Empty State */}
      {!brands.length ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h6" color={UI.textMuted} mb={2}>
            No brands found 🚫
          </Typography>
          <Button component={Link} to="/brands/add" variant="contained">
            Create First Brand
          </Button>
        </Box>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid container spacing={3}>
            {brands.map((brand) => (
              <Grid item xs={12} sm={6} md={4} key={brand._id}>
                <motion.div whileHover={{ y: -4 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: UI.border,
                      boxShadow: UI.shadow,
                      transition: "0.2s",
                      bgcolor: UI.cardBg,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Optional: Subtle top border color if featured */}
                    {brand.isFeatured && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          bgcolor: "#f59e0b",
                        }}
                      />
                    )}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        {/* Logo */}
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt=""
                            width={48}
                            height={48}
                            style={{ objectFit: "contain" }}
                          />
                        ) : (
                          <Avatar sx={{ bgcolor: UI.primary }}>
                            {brand.name[0]}
                          </Avatar>
                        )}

                        {/* Info */}
                        <Box>
                          <Typography fontWeight={700} color={UI.textMain}>
                            {brand.name}
                          </Typography>

                          <Stack direction="row" spacing={1} mt={0.5}>
                            <Chip
                              label={brand.isActive ? "Active" : "Inactive"}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: brand.isActive ? "#dcfce7" : "#fee2e2",
                                color: brand.isActive ? "#166534" : "#991b1b",
                              }}
                            />
                            {brand.isFeatured && (
                              <Chip
                                label="Featured"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: "#fef3c7",
                                  color: "#b45309",
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Stack>

                      {/* Actions */}
                      <Stack direction="row" spacing={0.5}>
                        {/* Quick Toggle: Featured */}
                        <Tooltip
                          title={
                            brand.isFeatured
                              ? "Remove Featured"
                              : "Mark as Featured"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleFeatured(brand)}
                          >
                            {brand.isFeatured ? (
                              <StarRoundedIcon sx={{ color: "#f59e0b" }} />
                            ) : (
                              <StarBorderRoundedIcon
                                sx={{ color: UI.textMuted }}
                              />
                            )}
                          </IconButton>
                        </Tooltip>

                        {/* Quick Toggle: Active */}
                        <Tooltip
                          title={brand.isActive ? "Deactivate" : "Activate"}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(brand)}
                          >
                            {brand.isActive ? (
                              <ToggleOnRoundedIcon color="success" />
                            ) : (
                              <ToggleOffRoundedIcon
                                sx={{ color: UI.textMuted }}
                              />
                            )}
                          </IconButton>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip title="Edit Brand">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/brands/edit/${brand._id}`)
                            }
                          >
                            <EditRoundedIcon
                              fontSize="small"
                              sx={{ color: UI.textSecondary }}
                            />
                          </IconButton>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip title="Delete Brand">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(brand._id)}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* ✅ Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete this brand?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrandManagerView;

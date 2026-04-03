import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import { motion } from "framer-motion";

import {
  fetchAllBrandsForAdminAsync,
  selectAdminBrands,
  selectBrandStatus,
  deleteBrandAsync,
  updateBrandAsync,
} from "../slice/BrandSlice";

import { UI } from "../../../theme/theme";
import { useNavigate } from "react-router-dom";

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
  const handleToggle = (brand) => {
    dispatch(
      updateBrandAsync({
        ...brand,
        isActive: !brand.isActive,
      }),
    );
  };

  if (status === "pending") {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rounded" height={120} />
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
        <Typography variant="h5" fontWeight={700}>
          Brand Manager
        </Typography>

        <Button variant="contained">+ Add Brand</Button>
      </Stack>

      {/* ✅ Empty State */}
      {!brands.length ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h6" color={UI.textMuted}>
            No brands found 🚫
          </Typography>
          <Button sx={{ mt: 2 }} variant="contained">
            Create Brand
          </Button>
        </Box>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid container spacing={3}>
            {brands.map((brand) => (
              <Grid item xs={12} sm={6} md={4} key={brand._id}>
                <motion.div whileHover={{ y: -6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: UI.border,
                      boxShadow: UI.shadow,
                      transition: "0.2s",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={2}>
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
                          <Avatar>{brand.name[0]}</Avatar>
                        )}

                        {/* Info */}
                        <Box>
                          <Typography fontWeight={700}>{brand.name}</Typography>
                          <Typography variant="caption">
                            /{brand.slug}
                          </Typography>

                          <Chip
                            label={brand.isActive ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                              mt: 1,
                              bgcolor: brand.isActive ? "#dcfce7" : "#fee2e2",
                            }}
                          />
                        </Box>
                      </Stack>

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => handleToggle(brand)}>
                          {brand.isActive ? (
                            <ToggleOffRoundedIcon />
                          ) : (
                            <ToggleOnRoundedIcon />
                          )}
                        </IconButton>

                        <IconButton
                          onClick={() =>
                            navigate(`/admin/brands/edit/${brand._id}`)
                          }
                        >
                          <EditRoundedIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => setDeleteId(brand._id)}
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
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
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrandManagerView;

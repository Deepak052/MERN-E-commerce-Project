import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Grid,
  Paper,
  Stack,
  Typography,
  IconButton,
  Box,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

// Redux
import {
  selectBanners,
  deleteBannerByIdAsync,
  fetchAllBannersAsync,
} from "../slice/BannerSlice";

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

const StatusBadge = ({ isActive }) => (
  <Box
    sx={{
      display: "inline-flex",
      px: 1.5,
      py: 0.5,
      borderRadius: "999px",
      bgcolor: isActive ? "#d1fae5" : "#f3f4f6",
      color: isActive ? "#065f46" : "#4b5563",
      fontSize: "0.75rem",
      fontWeight: 700,
    }}
  >
    {isActive ? "Active" : "Hidden"}
  </Box>
);

const BannerManagerView = () => {
  const dispatch = useDispatch();

  // Default to empty array if undefined
  const banners = useSelector(selectBanners) || [];
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Pass 'true' to fetchAllBannersAsync if your API expects admin=true to return inactive banners too
    dispatch(fetchAllBannersAsync(true));
  }, [dispatch]);

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this banner from the storefront?",
      )
    ) {
      dispatch(deleteBannerByIdAsync(id));
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      {/* --- PAGE HEADER --- */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={3}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              color={UI.textMain}
              letterSpacing="-0.02em"
            >
              Promotional Banners
            </Typography>
            <Typography variant="body2" color={UI.textSecondary} mt={0.5}>
              Manage homepage sliders, sales, and promotional graphics.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/banners/add"
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{
              bgcolor: UI.primary,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: "0 4px 6px -1px rgb(99 102 241 / 0.4)",
            }}
          >
            Add Banner
          </Button>
        </Stack>

        {/* --- SEARCH BAR --- */}
        <Box mt={4}>
          <TextField
            placeholder="Search banners by title..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 350 },
              bgcolor: UI.cardBg,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: UI.textMuted }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* --- BANNER GRID --- */}
      <Box sx={{ px: { xs: 3, md: 5 } }}>
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredBanners.length > 0 ? (
              filteredBanners.map((banner) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={banner._id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: UI.radius,
                        border: UI.border,
                        boxShadow: UI.shadow,
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          borderColor: "#d1d5db",
                          transform: "translateY(-2px)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      {/* Image Header */}
                      <Box
                        sx={{
                          width: "100%",
                          height: 160,
                          bgcolor: "#f9fafb",
                          position: "relative",
                          borderBottom: UI.border,
                        }}
                      >
                        <img
                          src={banner.image}
                          alt={banner.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                          <StatusBadge isActive={banner.isActive} />
                        </Box>
                      </Box>

                      {/* Content Body */}
                      <Box
                        sx={{
                          p: 3,
                          display: "flex",
                          flexDirection: "column",
                          flexGrow: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          color={UI.textMain}
                          mb={1}
                          noWrap
                        >
                          {banner.title}
                        </Typography>

                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mb={3}
                        >
                          <LinkRoundedIcon
                            sx={{ fontSize: 16, color: UI.textMuted }}
                          />
                          <Typography
                            variant="caption"
                            color={UI.textSecondary}
                            fontWeight={600}
                            noWrap
                          >
                            {banner.redirectUrl}
                          </Typography>
                        </Stack>

                        {/* Action Buttons Row */}
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={1}
                          mt="auto"
                        >
                          <Tooltip title="Edit Banner">
                            <IconButton
                              component={Link}
                              to={`/banners/edit/${banner._id}`}
                              size="small"
                              sx={{
                                color: UI.textSecondary,
                                bgcolor: "#f3f4f6",
                              }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hide/Delete Banner">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(banner._id)}
                              sx={{ color: "#dc2626", bgcolor: "#fee2e2" }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))
            ) : (
              /* --- EMPTY STATE --- */
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: UI.radius,
                    border: `2px dashed #d1d5db`,
                    bgcolor: "transparent",
                  }}
                >
                  <ViewCarouselRoundedIcon
                    sx={{ fontSize: 60, color: UI.textMuted, mb: 2 }}
                  />
                  <Typography variant="h6" fontWeight={700} color={UI.textMain}>
                    No banners found
                  </Typography>
                  <Typography variant="body2" color={UI.textSecondary} mb={3}>
                    {searchTerm
                      ? `We couldn't find any banners matching "${searchTerm}".`
                      : "You haven't uploaded any promotional banners yet."}
                  </Typography>
                  {!searchTerm && (
                    <Button
                      component={Link}
                      to="/banners/add"
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    >
                      Create your first banner
                    </Button>
                  )}
                </Paper>
              </Grid>
            )}
          </AnimatePresence>
        </Grid>
      </Box>
    </Box>
  );
};

export default BannerManagerView;

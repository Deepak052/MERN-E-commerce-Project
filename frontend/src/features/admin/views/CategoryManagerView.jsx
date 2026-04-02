import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  Skeleton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

import {
  fetchAllCategoriesAsync,
  deleteCategoryByIdAsync,
  selectCategories,
  selectCategoryStatus,
} from "../../categories/CategoriesSlice";
import { NoCategoriesEmptyState } from "./AddEditCategoryView";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#f8f9fc",
  card: "#ffffff",
  primary: "#4f46e5",
  primaryLight: "#eef2ff",
  success: "#10b981",
  successLight: "#f0fdf4",
  danger: "#ef4444",
  dangerLight: "#fef2f2",
  text: "#111827",
  textSub: "#374151",
  textMuted: "#9ca3af",
  border: "1.5px solid #e5e7eb",
  shadow: "0 1px 4px 0 rgba(0,0,0,0.07)",
  radius: "14px",
};

// ─── Category Row ─────────────────────────────────────────────────────────────
const CategoryRow = ({ category, isChild = false, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.18 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 2,
          gap: 2,
          ml: isChild ? 5 : 0,
          borderLeft: isChild ? `3px solid #e0e7ff` : "none",
          bgcolor: isChild ? "#fafbff" : "transparent",
          borderRadius: isChild ? "0 10px 10px 0" : 0,
          "&:hover": { bgcolor: isChild ? "#f0f4ff" : "#f8f9fc" },
          transition: "background 0.15s",
        }}
      >
        {/* Thumbnail or avatar */}
        <Avatar
          src={category.thumbnail}
          sx={{
            width: 42,
            height: 42,
            borderRadius: "10px",
            bgcolor: T.primaryLight,
            border: "1.5px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          {isChild ? (
            <AccountTreeRoundedIcon sx={{ fontSize: 18, color: T.primary }} />
          ) : (
            <LayersRoundedIcon sx={{ fontSize: 18, color: T.primary }} />
          )}
        </Avatar>

        {/* Name & slug */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" fontWeight={700} color={T.text} noWrap>
              {category.name}
            </Typography>
            {isChild && (
              <Chip
                label="Sub"
                size="small"
                sx={{
                  fontSize: 10,
                  height: 18,
                  bgcolor: "#e0e7ff",
                  color: T.primary,
                  fontWeight: 700,
                }}
              />
            )}
          </Box>
          <Typography variant="caption" color={T.textMuted} noWrap>
            /{category.slug}
          </Typography>
        </Box>

        {/* Status */}
        <Chip
          label={category.isActive ? "Active" : "Inactive"}
          size="small"
          sx={{
            bgcolor: category.isActive ? T.successLight : "#fef2f2",
            color: category.isActive ? "#166534" : T.danger,
            fontWeight: 700,
            fontSize: 11,
            height: 22,
          }}
        />

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Edit" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(category._id)}
              sx={{ borderRadius: "8px" }}
            >
              <EditRoundedIcon fontSize="small" sx={{ color: T.textMuted }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(category._id)}
              sx={{
                borderRadius: "8px",
                "&:hover": { bgcolor: T.dangerLight },
              }}
            >
              <DeleteOutlineRoundedIcon
                fontSize="small"
                sx={{ color: T.textMuted }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </motion.div>
  );
};

// ─── Main List View ───────────────────────────────────────────────────────────
const CategoryManagerView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allCategories = useSelector(selectCategories) || [];
  const status = useSelector(selectCategoryStatus);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllCategoriesAsync());
  }, [dispatch]);

  const handleEdit = (id) => navigate(`/admin/categories/edit/${id}`);
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this category? All its subcategories will also be deactivated.",
      )
    )
      return;
    await dispatch(deleteCategoryByIdAsync(id));
    toast.success("Category deleted.");
    dispatch(fetchAllCategoriesAsync());
  };

  const isLoading = status === "pending";
  const activeCategories = allCategories.filter((c) => c.isActive !== false);
  const rootCategories = activeCategories.filter((c) => !c.parentCategory);
  const subCategories = activeCategories.filter((c) => c.parentCategory);

  // Filtered by search
  const filtered = search.trim()
    ? activeCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase()),
      )
    : null;

  const stats = {
    total: activeCategories.length,
    root: rootCategories.length,
    sub: subCategories.length,
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: T.bg, minHeight: "100vh" }}>
      {/* ── Header ── */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          pt: 4,
          pb: 3,
          bgcolor: "#fff",
          borderBottom: "1.5px solid #f0f1f5",
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            color={T.text}
            letterSpacing="-0.03em"
          >
            Categories
          </Typography>
          <Typography variant="body2" color={T.textMuted} mt={0.5}>
            Manage your store's product categories and subcategories.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate("/admin/categories/add")}
          sx={{
            bgcolor: T.primary,
            borderRadius: "10px",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            py: 1.2,
            boxShadow: "none",
            "&:hover": { bgcolor: "#3730a3", boxShadow: "none" },
          }}
        >
          Add Category
        </Button>
      </Box>

      <Box sx={{ px: { xs: 3, md: 5 } }}>
        {/* ── Stats Row ── */}
        {!isLoading && activeCategories.length > 0 && (
          <Stack
            direction="row"
            spacing={2.5}
            sx={{ mb: 3.5, flexWrap: "wrap" }}
          >
            {[
              {
                label: "Total",
                value: stats.total,
                color: T.primary,
                bg: T.primaryLight,
              },
              {
                label: "Top-level",
                value: stats.root,
                color: "#0891b2",
                bg: "#e0f7fa",
              },
              {
                label: "Subcategories",
                value: stats.sub,
                color: "#059669",
                bg: "#dcfce7",
              },
            ].map((s) => (
              <Paper
                key={s.label}
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: "12px",
                  border: T.border,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    bgcolor: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography fontWeight={800} fontSize={15} color={s.color}>
                    {s.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color={T.textSub} fontWeight={600}>
                  {s.label}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: T.radius,
              border: T.border,
              overflow: "hidden",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Skeleton
                  variant="rounded"
                  width={42}
                  height={42}
                  sx={{ borderRadius: "10px" }}
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="30%" height={18} />
                  <Skeleton width="20%" height={14} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton width={60} height={22} sx={{ borderRadius: "6px" }} />
              </Box>
            ))}
          </Paper>
        )}

        {/* ── Empty state ── */}
        {!isLoading && activeCategories.length === 0 && (
          <Paper
            elevation={0}
            sx={{ borderRadius: T.radius, border: T.border }}
          >
            <NoCategoriesEmptyState
              onCreateClick={() => navigate("/admin/categories/add")}
            />
          </Paper>
        )}

        {/* ── Category List ── */}
        {!isLoading && activeCategories.length > 0 && (
          <>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search categories by name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{ color: T.textMuted, fontSize: 18 }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "#fff",
                },
              }}
            />

            <Paper
              elevation={0}
              sx={{
                borderRadius: T.radius,
                border: T.border,
                overflow: "hidden",
              }}
            >
              <AnimatePresence>
                {/* Search results */}
                {filtered ? (
                  filtered.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                      <Typography color={T.textMuted} fontWeight={600}>
                        No categories match "{search}"
                      </Typography>
                    </Box>
                  ) : (
                    filtered.map((cat, i) => (
                      <React.Fragment key={cat._id}>
                        <CategoryRow
                          category={cat}
                          isChild={!!cat.parentCategory}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                        {i < filtered.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  )
                ) : (
                  /* Grouped view: root + children */
                  rootCategories.map((root, ri) => {
                    const children = subCategories.filter(
                      (s) =>
                        s.parentCategory?._id === root._id ||
                        s.parentCategory === root._id,
                    );
                    return (
                      <React.Fragment key={root._id}>
                        <CategoryRow
                          category={root}
                          isChild={false}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                        <AnimatePresence>
                          {children.map((child) => (
                            <React.Fragment key={child._id}>
                              <Divider sx={{ ml: 5 }} />
                              <CategoryRow
                                category={child}
                                isChild={true}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                              />
                            </React.Fragment>
                          ))}
                        </AnimatePresence>
                        {ri < rootCategories.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })
                )}
              </AnimatePresence>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CategoryManagerView;

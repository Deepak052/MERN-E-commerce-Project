import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import LottieComponent from "lottie-react";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";

// Icons
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

// Redux
import {
  getAllOrdersAsync,
  resetOrderUpdateStatus,
  selectOrderUpdateStatus,
  selectOrders,
  updateOrderByIdAsync,
} from "../slice/OrderSlice";

// Assets
import { noOrdersAnimation } from "../../../assets/index";
const Lottie = LottieComponent.default || LottieComponent;

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  radius: 3,
};

const editOptions = [
  "Pending",
  "Dispatched",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

// Modern SaaS Color Palette for Statuses
const getStatusConfig = (status) => {
  switch (status) {
    case "Pending":
      return { bgcolor: "#fef3c7", color: "#d97706", border: "#fde68a" }; // Amber
    case "Dispatched":
      return { bgcolor: "#e0e7ff", color: "#4f46e5", border: "#c7d2fe" }; // Indigo
    case "Out for delivery":
      return { bgcolor: "#f3e8ff", color: "#7e22ce", border: "#e9d5ff" }; // Purple
    case "Delivered":
      return { bgcolor: "#dcfce7", color: "#15803d", border: "#bbf7d0" }; // Green
    case "Cancelled":
      return { bgcolor: "#fee2e2", color: "#b91c1c", border: "#fecaca" }; // Red
    default:
      return { bgcolor: "#f3f4f6", color: "#4b5563", border: "#e5e7eb" }; // Gray
  }
};

const OrderManagerView = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const is1200 = useMediaQuery(theme.breakpoints.down("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const orders = useSelector(selectOrders) || [];
  const orderUpdateStatus = useSelector(selectOrderUpdateStatus);

  const [editIndex, setEditIndex] = useState(-1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(getAllOrdersAsync());
  }, [dispatch]);

  useEffect(() => {
    if (orderUpdateStatus === "fulfilled") {
      toast.success("Order status updated successfully");
      setEditIndex(-1);
    } else if (orderUpdateStatus === "rejected") {
      toast.error("Failed to update order status");
    }
  }, [orderUpdateStatus]);

  useEffect(() => {
    return () => {
      dispatch(resetOrderUpdateStatus());
    };
  }, [dispatch]);

  // Handle entering edit mode & presetting the form value
  const handleEditClick = (index, currentStatus) => {
    setEditIndex(index);
    reset({ status: currentStatus }); // Reset form to current status
  };

  const handleUpdateOrder = (data) => {
    const update = { ...data, _id: orders[editIndex]._id };
    dispatch(updateOrderByIdAsync(update));
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      {/* --- PAGE HEADER --- */}
      <Box sx={{ px: { xs: 2, md: 5 }, pt: 4, pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              color={UI.textMain}
              letterSpacing="-0.02em"
            >
              Orders Management
            </Typography>
            <Typography variant="body2" color={UI.textSecondary} mt={0.5}>
              Track, update, and manage customer orders across your store.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* --- ORDERS TABLE AREA --- */}
      <Box sx={{ px: { xs: 2, md: 5 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(handleUpdateOrder)}
          >
            {orders.length > 0 ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: UI.radius,
                  border: UI.border,
                  boxShadow: UI.shadow,
                  overflowX: "auto",
                }}
              >
                <Table sx={{ minWidth: 1000 }} aria-label="orders table">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: 700, color: UI.textSecondary }}
                      >
                        Order ID
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: UI.textSecondary }}
                      >
                        Items
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: UI.textSecondary }}
                      >
                        Customer & Address
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: UI.textSecondary }}
                      >
                        Date & Payment
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, color: UI.textSecondary }}
                      >
                        Total
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, color: UI.textSecondary }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: UI.textSecondary }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <AnimatePresence>
                      {orders.map((order, index) => {
                        const isEditing = editIndex === index;
                        const statusConfig = getStatusConfig(order.status);
                        const shortId = order._id.slice(-6).toUpperCase();
                        const address =
                          order.address && order.address[0]
                            ? order.address[0]
                            : null;

                        return (
                          <TableRow
                            key={order._id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              "&:hover": { bgcolor: "#f8fafc" },
                              transition: "background-color 0.2s ease",
                              bgcolor: isEditing ? "#eff6ff" : "inherit",
                            }}
                          >
                            {/* Order ID */}
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <ReceiptLongRoundedIcon
                                  sx={{ color: UI.textMuted, fontSize: 20 }}
                                />
                                <Typography
                                  fontWeight={700}
                                  color={UI.textMain}
                                >
                                  #{shortId}
                                </Typography>
                              </Stack>
                            </TableCell>

                            {/* Items List (Compact) */}
                            <TableCell>
                              <Stack spacing={1.5}>
                                {order.item.map((cartItem, i) => (
                                  <Stack
                                    key={i}
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.5}
                                  >
                                    <Avatar
                                      src={cartItem.product.thumbnail}
                                      variant="rounded"
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: "#f3f4f6",
                                        border: UI.border,
                                      }}
                                    />
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color={UI.textMain}
                                        noWrap
                                        sx={{ maxWidth: 180 }}
                                      >
                                        {cartItem.product.title}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color={UI.textSecondary}
                                      >
                                        Qty: {cartItem.quantity}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                ))}
                              </Stack>
                            </TableCell>

                            {/* Customer Address */}
                            <TableCell>
                              {address ? (
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={UI.textMain}
                                  >
                                    {address.type || "Shipping"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color={UI.textSecondary}
                                    display="block"
                                    sx={{ mt: 0.5, lineHeight: 1.4 }}
                                  >
                                    {address.street}
                                    <br />
                                    {address.city}, {address.state}{" "}
                                    {address.postalCode}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="error">
                                  No Address
                                </Typography>
                              )}
                            </TableCell>

                            {/* Date & Payment */}
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={UI.textMain}
                              >
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </Typography>
                              <Chip
                                label={order.paymentMode}
                                size="small"
                                sx={{
                                  mt: 1,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  borderRadius: 1,
                                  bgcolor:
                                    order.paymentMode === "ONLINE"
                                      ? "#dbeafe"
                                      : "#f3f4f6",
                                  color:
                                    order.paymentMode === "ONLINE"
                                      ? "#1e40af"
                                      : "#4b5563",
                                }}
                              />
                            </TableCell>

                            {/* Total */}
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                fontWeight={800}
                                color={UI.textMain}
                              >
                                ₹{order.total?.toFixed(2)}
                              </Typography>
                            </TableCell>

                            {/* Status Column */}
                            <TableCell align="center">
                              {isEditing ? (
                                <FormControl
                                  size="small"
                                  fullWidth
                                  sx={{ minWidth: 140 }}
                                >
                                  <Select
                                    id="status-select"
                                    defaultValue={order.status}
                                    {...register("status", { required: true })}
                                    sx={{
                                      bgcolor: "white",
                                      borderRadius: 2,
                                      "& .MuiSelect-select": {
                                        py: 1,
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                      },
                                    }}
                                  >
                                    {editOptions.map((option) => (
                                      <MenuItem
                                        key={option}
                                        value={option}
                                        sx={{
                                          fontSize: "0.875rem",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {option}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : (
                                <Chip
                                  label={order.status}
                                  sx={{
                                    bgcolor: statusConfig.bgcolor,
                                    color: statusConfig.color,
                                    border: `1px solid ${statusConfig.border}`,
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                  }}
                                />
                              )}
                            </TableCell>

                            {/* Actions Column */}
                            <TableCell align="right">
                              {isEditing ? (
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  justifyContent="flex-end"
                                >
                                  <Tooltip title="Cancel">
                                    <IconButton
                                      size="small"
                                      onClick={() => setEditIndex(-1)}
                                      sx={{ color: UI.textMuted }}
                                    >
                                      <CloseRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Save Status">
                                    <IconButton
                                      type="submit"
                                      size="small"
                                      sx={{
                                        color: UI.primary,
                                        bgcolor: "#e0e7ff",
                                      }}
                                    >
                                      <CheckCircleOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              ) : (
                                <Tooltip title="Edit Status">
                                  <IconButton
                                    onClick={() =>
                                      handleEditClick(index, order.status)
                                    }
                                    size="small"
                                    sx={{
                                      color: UI.textSecondary,
                                      "&:hover": {
                                        bgcolor: "#f3f4f6",
                                        color: UI.primary,
                                      },
                                    }}
                                  >
                                    <EditOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* --- EMPTY STATE --- */
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 4, md: 8 },
                  textAlign: "center",
                  borderRadius: UI.radius,
                  border: `2px dashed #d1d5db`,
                  bgcolor: "transparent",
                }}
              >
                <Box width={150} mx="auto" mb={2}>
                  <Lottie animationData={noOrdersAnimation} />
                </Box>
                <Typography variant="h6" fontWeight={700} color={UI.textMain}>
                  No Orders Found
                </Typography>
                <Typography variant="body2" color={UI.textSecondary}>
                  When customers place orders, they will appear here.
                </Typography>
              </Paper>
            )}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default OrderManagerView;

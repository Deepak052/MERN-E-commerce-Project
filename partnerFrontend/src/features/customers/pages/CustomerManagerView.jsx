import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
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
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

// Redux
import {
  fetchAllCustomersAsync,
  updateCustomerByIdAsync,
  selectCustomers,
} from "../slice/UserSlice";

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
  border: "1px solid #e5e7eb",
  radius: 3,
};

const CustomerManagerView = () => {
  const dispatch = useDispatch();
  const customers = useSelector(selectCustomers) || [];
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllCustomersAsync());
  }, [dispatch]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleBlock = (customer) => {
    if (customer.isAdmin)
      return toast.error("You cannot block an Administrator.");
    const action = customer.isBlocked ? "Unblock" : "Block";
    if (
      window.confirm(`Are you sure you want to ${action} ${customer.name}?`)
    ) {
      dispatch(
        updateCustomerByIdAsync({
          _id: customer._id,
          isBlocked: !customer.isBlocked,
        }),
      ).then(() => toast.success(`User successfully ${action}ed.`));
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      <Box sx={{ px: { xs: 2, md: 5 }, pt: 4, pb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          color={UI.textMain}
          letterSpacing="-0.02em"
        >
          Customers
        </Typography>
        <Typography variant="body2" color={UI.textSecondary} mt={0.5}>
          Manage registered users, update details, and control account access.
        </Typography>

        <Box mt={4}>
          <TextField
            placeholder="Search by name or email..."
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
                  <SearchRoundedIcon sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 5 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {filteredCustomers.length > 0 ? (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: UI.radius,
                border: UI.border,
                overflowX: "auto",
              }}
            >
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 700, color: UI.textSecondary }}
                    >
                      Customer Details
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: UI.textSecondary }}
                    >
                      Joined
                    </TableCell>
                    <TableCell
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
                    {filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer._id}
                        sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Avatar
                              sx={{
                                bgcolor: customer.isAdmin
                                  ? "#111827"
                                  : UI.primary,
                                fontWeight: 700,
                              }}
                            >
                              {customer.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  color={UI.textMain}
                                >
                                  {customer.name}
                                </Typography>
                                {customer.isAdmin && (
                                  <Tooltip title="Administrator">
                                    <ShieldRoundedIcon
                                      sx={{ fontSize: 16, color: "#10b981" }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                              <Typography
                                variant="caption"
                                color={UI.textSecondary}
                              >
                                {customer.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={UI.textMain}
                          >
                            {new Date(
                              customer.createdAt || Date.now(),
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {customer.isBlocked ? (
                            <Chip
                              label="Blocked"
                              size="small"
                              sx={{
                                bgcolor: "#fee2e2",
                                color: "#b91c1c",
                                fontWeight: 700,
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Chip
                              label="Active"
                              size="small"
                              sx={{
                                bgcolor: "#dcfce7",
                                color: "#15803d",
                                fontWeight: 700,
                                borderRadius: 1,
                              }}
                            />
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="View Profile & Edit">
                              {/* 🔗 This redirects to the new Detail View */}
                              <IconButton
                                component={Link}
                                to={`/admin/customers/${customer._id}`}
                                size="small"
                                sx={{
                                  color: UI.primary,
                                  bgcolor: "#eff6ff",
                                  "&:hover": { bgcolor: "#dbeafe" },
                                }}
                              >
                                <RemoveRedEyeOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {!customer.isAdmin && (
                              <Tooltip
                                title={
                                  customer.isBlocked
                                    ? "Unblock User"
                                    : "Block User"
                                }
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleBlock(customer)}
                                  sx={{
                                    color: customer.isBlocked
                                      ? "#10b981"
                                      : "#dc2626",
                                    bgcolor: customer.isBlocked
                                      ? "#dcfce7"
                                      : "#fee2e2",
                                  }}
                                >
                                  {customer.isBlocked ? (
                                    <CheckCircleOutlineRoundedIcon fontSize="small" />
                                  ) : (
                                    <BlockRoundedIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
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
              <PersonOffOutlinedIcon
                sx={{ fontSize: 60, color: "#9ca3af", mb: 2 }}
              />
              <Typography variant="h6" fontWeight={700} color={UI.textMain}>
                No Customers Found
              </Typography>
            </Paper>
          )}
        </motion.div>
      </Box>
    </Box>
  );
};

export default CustomerManagerView;

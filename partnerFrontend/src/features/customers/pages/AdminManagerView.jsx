import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
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
  Button,
  TextField,
  Grid,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

// Icons
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Redux
import {
  fetchAllAdminsAsync,
  createStoreAdminAsync,
  updateCustomerByIdAsync,
  selectStoreAdmins,
} from "../slice/UserSlice";

// Helper: Extract Date from MongoDB ObjectId if createdAt is missing
const getCreationDate = (user) => {
  if (user.createdAt) {
    return new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (user._id) {
    // MongoDB _id contains the timestamp in the first 8 hex characters
    const timestamp = parseInt(user._id.substring(0, 8), 16) * 1000;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return "Unknown";
};

export const AdminManagerView = () => {
  const dispatch = useDispatch();
  const admins = useSelector(selectStoreAdmins) || [];
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchAllAdminsAsync());
  }, [dispatch]);

  const handleCreateAdmin = async (data) => {
    try {
      await dispatch(createStoreAdminAsync(data)).unwrap();
      toast.success("Store Administrator created successfully!");
      reset();
      setIsAdding(false);
      setShowPassword(false); // Reset password visibility
    } catch (error) {
      toast.error(error.message || "Failed to create administrator");
    }
  };

  const handleToggleBlock = (admin) => {
    const action = admin.isBlocked ? "Unblock" : "Revoke Access for";
    if (window.confirm(`Are you sure you want to ${action} ${admin.name}?`)) {
      dispatch(
        updateCustomerByIdAsync({
          _id: admin._id,
          isBlocked: !admin.isBlocked,
        }),
      ).then(() => toast.success(`Access updated.`));
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: "#f4f5f7", minHeight: "100vh" }}>
      <Box sx={{ px: { xs: 2, md: 5 }, pt: 4, pb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color="#111827">
              Store Administrators
            </Typography>
            <Typography variant="body2" color="#6b7280" mt={0.5}>
              Manage personnel with backend access.
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{ bgcolor: "#6366f1", fontWeight: 700 }}
            onClick={() => {
              setIsAdding(!isAdding);
              if (isAdding) reset(); // Clear form if canceling
            }}
          >
            {isAdding ? "Cancel" : "+ Add Administrator"}
          </Button>
        </Stack>

        {isAdding && (
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 4,
              borderRadius: 3,
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Create New Admin Account
            </Typography>
            <Stack
              component="form"
              noValidate
              onSubmit={handleSubmit(handleCreateAdmin)}
              spacing={3}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register("name", { required: "Name is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email format",
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Temporary Password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Box textAlign="right">
                <LoadingButton
                  type="submit"
                  variant="contained"
                  sx={{ bgcolor: "#6366f1", px: 4, fontWeight: 700, py: 1.2 }}
                >
                  Create & Send Email
                </LoadingButton>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>

      <Box sx={{ px: { xs: 2, md: 5 } }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#6b7280" }}>
                  Administrator
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#6b7280" }}>
                  Added On
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#6b7280" }}>
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: "#6b7280" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow
                  key={admin._id}
                  sx={{ "&:hover": { bgcolor: "#f9fafb" } }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: "#111827", fontWeight: 700 }}>
                        <AdminPanelSettingsRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {admin.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {admin.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {getCreationDate(admin)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {admin.isBlocked ? (
                      <Chip
                        label="Access Revoked"
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
                    <IconButton
                      size="small"
                      onClick={() => handleToggleBlock(admin)}
                      sx={{
                        color: admin.isBlocked ? "#10b981" : "#dc2626",
                        bgcolor: admin.isBlocked ? "#dcfce7" : "#fee2e2",
                      }}
                    >
                      {admin.isBlocked ? (
                        <CheckCircleOutlineRoundedIcon fontSize="small" />
                      ) : (
                        <BlockRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AdminManagerView;

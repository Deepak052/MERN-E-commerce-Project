import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Avatar,
  Button,
  Grid,
  TextField,
  Breadcrumbs,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

// Redux
import {
  fetchAllCustomersAsync,
  updateCustomerByIdAsync,
  selectCustomers,
} from "../../customers/slice/UserSlice";

const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  textMain: "#111827",
  textSecondary: "#6b7280",
  border: "1px solid #e5e7eb",
  radius: 3,
};

export const CustomerDetailView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customers = useSelector(selectCustomers) || [];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Find the specific customer
  const customer = customers.find((c) => c._id === id);

  // If customers array is empty on direct URL load, fetch them
  useEffect(() => {
    if (customers.length === 0) dispatch(fetchAllCustomersAsync());
  }, [dispatch, customers.length]);

  // Pre-fill form when customer loads
  useEffect(() => {
    if (customer) {
      reset({ name: customer.name, email: customer.email });
    }
  }, [customer, reset]);

  if (!customer)
    return (
      <Typography p={5} textAlign="center">
        Loading Customer...
      </Typography>
    );

  const handleUpdateProfile = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        updateCustomerByIdAsync({
          _id: id,
          name: data.name,
          email: data.email,
        }),
      ).unwrap();
      toast.success("Customer profile updated successfully.");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlock = () => {
    if (customer.isAdmin)
      return toast.error("You cannot block an Administrator.");
    const action = customer.isBlocked ? "Unblock" : "Block";
    if (
      window.confirm(`Are you sure you want to ${action} ${customer.name}?`)
    ) {
      dispatch(
        updateCustomerByIdAsync({ _id: id, isBlocked: !customer.isBlocked }),
      ).then(() => toast.success(`User successfully ${action}ed.`));
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 10, bgcolor: UI.bg, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ px: { xs: 2, md: 5 }, pt: 4, pb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            to="/admin/dashboard"
            style={{ textDecoration: "none", color: UI.textSecondary }}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/customers"
            style={{ textDecoration: "none", color: UI.textSecondary }}
          >
            Customers
          </Link>
          <Typography color={UI.textMain} fontWeight={600}>
            Profile
          </Typography>
        </Breadcrumbs>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={() => navigate("/admin/customers")}
            sx={{ bgcolor: UI.cardBg, border: UI.border }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={800} color={UI.textMain}>
            Customer Profile
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 5 } }}>
        <Grid container spacing={4}>
          {/* LEFT: Profile Card & Danger Zone */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: UI.radius,
                  border: UI.border,
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 2,
                    bgcolor: customer.isAdmin ? "#111827" : UI.primary,
                    fontSize: "2.5rem",
                    fontWeight: 700,
                  }}
                >
                  {customer.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight={800} color={UI.textMain}>
                  {customer.name}
                </Typography>
                <Typography variant="body2" color={UI.textSecondary} mb={2}>
                  {customer.email}
                </Typography>

                {customer.isAdmin && (
                  <Chip
                    icon={<AdminPanelSettingsRoundedIcon />}
                    label="Store Administrator"
                    color="success"
                    sx={{ fontWeight: 700, mb: 2 }}
                  />
                )}

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={UI.textSecondary}>
                    Status:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={customer.isBlocked ? "error" : "success.main"}
                  >
                    {customer.isBlocked ? "Blocked" : "Active"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Typography variant="body2" color={UI.textSecondary}>
                    Joined:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={UI.textMain}
                  >
                    {new Date(
                      customer.createdAt || Date.now(),
                    ).toLocaleDateString()}
                  </Typography>
                </Stack>
              </Paper>

              {/* Danger Zone */}
              {!customer.isAdmin && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: UI.radius,
                    border: "1px solid #fecaca",
                    bgcolor: "#fff5f5",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="#b91c1c"
                    mb={1}
                  >
                    Danger Zone
                  </Typography>
                  <Typography variant="body2" color="#7f1d1d" mb={3}>
                    {customer.isBlocked
                      ? "This user is currently blocked from accessing their account."
                      : "Blocking this user will prevent them from logging in and placing orders."}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleToggleBlock}
                    startIcon={
                      customer.isBlocked ? (
                        <CheckCircleOutlineRoundedIcon />
                      ) : (
                        <BlockRoundedIcon />
                      )
                    }
                    sx={{
                      bgcolor: customer.isBlocked ? "#10b981" : "#dc2626",
                      "&:hover": {
                        bgcolor: customer.isBlocked ? "#059669" : "#b91c1c",
                      },
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    {customer.isBlocked ? "Unblock Account" : "Block Account"}
                  </Button>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* RIGHT: Edit Form */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: UI.radius,
                border: UI.border,
              }}
            >
              <Typography variant="h6" fontWeight={800} mb={4}>
                Edit Details
              </Typography>

              <Stack
                component="form"
                noValidate
                onSubmit={handleSubmit(handleUpdateProfile)}
                spacing={3}
              >
                <TextField
                  fullWidth
                  label="Full Name"
                  {...register("name", { required: "Name is required" })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputLabelProps={{ shrink: true }}
                />

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
                  InputLabelProps={{ shrink: true }}
                />

                <Box display="flex" justifyContent="flex-end" pt={2}>
                  <LoadingButton
                    type="submit"
                    loading={isSubmitting}
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: UI.primary,
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 5,
                    }}
                  >
                    Save Changes
                  </LoadingButton>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

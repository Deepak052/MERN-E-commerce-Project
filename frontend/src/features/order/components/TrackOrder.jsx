import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Grid,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import {
  getOrderByIdAsync,
  selectCurrentOrder,
  selectOrderFetchStatus,
  clearCurrentOrder,
} from "../slice/OrderSlice";
import LottieComponent from "lottie-react";
import { loadingAnimation } from "../../../assets";

const Lottie = LottieComponent.default || LottieComponent;
const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1",
  radius: 3,
  border: "1px solid #e5e7eb",
};

const steps = ["Pending", "Dispatched", "Out for delivery", "Delivered"];

export const TrackOrder = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderFetchStatus);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (id) dispatch(getOrderByIdAsync(id));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, id]);

  if (status === "pending" || !order) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Lottie animationData={loadingAnimation} style={{ width: 150 }} />
      </Box>
    );
  }

  // Security Redirect: If order is completed or cancelled, send them to details page
  if (order.status === "Delivered" || order.status === "Cancelled") {
    return <Navigate to={`/orders/${order._id}`} replace />;
  }

  // Determine current active step
  const activeStep =
    steps.indexOf(order.status) !== -1 ? steps.indexOf(order.status) : 0;

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: "100vh", py: { xs: 3, md: 6 } }}>
      <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 2, md: 4 } }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <IconButton
            component={Link}
            to={"/orders"}
            sx={{ bgcolor: UI.cardBg, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={800}>
            Track Shipment
          </Typography>
        </Stack>

        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: UI.radius,
            border: UI.border,
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            mb={5}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                ORDER ID
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                #{order._id.slice(-8).toUpperCase()}
              </Typography>
            </Box>
            <Box textAlign={{ xs: "left", md: "right" }} mt={{ xs: 2, md: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                EXPECTED DELIVERY
              </Typography>
              <Typography variant="h6" fontWeight={800} color="success.main">
                {/* Placeholder logic for future date */}
                {new Date(
                  new Date(order.createdAt).setDate(
                    new Date(order.createdAt).getDate() + 5,
                  ),
                ).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ width: "100%", mb: 6 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: activeStep >= index ? UI.primary : "inherit",
                      },
                    }}
                  >
                    <Typography
                      fontWeight={activeStep >= index ? 700 : 500}
                      color={
                        activeStep >= index ? "text.primary" : "text.secondary"
                      }
                    >
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h6" fontWeight={800} mb={3}>
            Items in this shipment
          </Typography>
          <Stack spacing={3}>
            {order.item.map((item, idx) => (
              <Stack key={idx} direction="row" spacing={3} alignItems="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#f9fafb",
                    borderRadius: 2,
                    p: 1,
                    border: UI.border,
                  }}
                >
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {item.quantity}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

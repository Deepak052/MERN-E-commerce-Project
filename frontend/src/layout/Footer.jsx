import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { motion } from "framer-motion";

// Assets
import {
  QRCodePng,
  appStorePng,
  googlePlayPng,
  facebookPng,
  instagramPng,
  twitterPng,
  linkedinPng,
} from "../assets";

export const Footer = () => {
  const theme = useTheme();

  const linkStyles = {
    color: "#9ca3af", // text-gray-400
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.95rem",
    transition: "color 0.2s ease-in-out",
    "&:hover": {
      color: "#ffffff",
    },
  };

  const titleStyles = {
    color: "#ffffff",
    fontWeight: 700,
    letterSpacing: "0.05em",
    mb: 3,
  };

  return (
    <Box
      sx={{
        backgroundColor: "#111827", // Deep professional dark background
        color: "#ffffff",
        pt: { xs: 8, md: 10 },
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          spacing={{ xs: 6, md: 4 }}
          justifyContent="space-between"
        >
          {/* COLUMN 1: Brand & Newsletter */}
          <Grid item xs={12} sm={6} lg={3}>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
                ShopSphere
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} mt={1}>
                Subscribe
              </Typography>
              <Typography variant="body2" color="#9ca3af" mb={1}>
                Get 10% off your first order
              </Typography>
              <TextField
                variant="outlined"
                placeholder="Enter your email"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    borderRadius: 2,
                    border: "1px solid #4b5563",
                    "& fieldset": { border: "none" },
                    "&:hover": { border: "1px solid #6b7280" },
                    "&.Mui-focused": {
                      border: `1px solid ${theme.palette.primary.main}`,
                    },
                  },
                  "& input::placeholder": { color: "#6b7280", opacity: 1 },
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton edge="end" sx={{ color: "white" }}>
                      <SendRoundedIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Stack>
          </Grid>

          {/* COLUMN 2: Support */}
          <Grid item xs={12} sm={6} lg={2}>
            <Typography variant="h6" sx={titleStyles}>
              Support
            </Typography>
            <Stack spacing={2}>
              <Typography
                sx={{ color: "#9ca3af", fontSize: "0.95rem", lineHeight: 1.6 }}
              >
                11th Main Street, Dhaka, <br />
                DH 1515, California.
              </Typography>
              <Typography
                component="a"
                href="mailto:support@shopsphere.com"
                sx={linkStyles}
              >
                support@shopsphere.com
              </Typography>
              <Typography
                component="a"
                href="tel:+88015888889999"
                sx={linkStyles}
              >
                +88015-88888-9999
              </Typography>
            </Stack>
          </Grid>

          {/* COLUMN 3: Company (Replaced Account) */}
          <Grid item xs={12} sm={6} lg={2}>
            <Typography variant="h6" sx={titleStyles}>
              Company
            </Typography>
            <Stack spacing={2}>
              <Typography component={Link} to="/about" sx={linkStyles}>
                About Us
              </Typography>
              <Typography component={Link} to="/careers" sx={linkStyles}>
                Careers
              </Typography>
              <Typography component={Link} to="/stores" sx={linkStyles}>
                Our Stores
              </Typography>
              <Typography component={Link} to="/press" sx={linkStyles}>
                Press & Media
              </Typography>
            </Stack>
          </Grid>

          {/* COLUMN 4: Quick Links */}
          <Grid item xs={12} sm={6} lg={2}>
            <Typography variant="h6" sx={titleStyles}>
              Quick Links
            </Typography>
            <Stack spacing={2}>
              <Typography component={Link} to="/privacy" sx={linkStyles}>
                Privacy Policy
              </Typography>
              <Typography component={Link} to="/terms" sx={linkStyles}>
                Terms Of Use
              </Typography>
              <Typography component={Link} to="/faq" sx={linkStyles}>
                FAQ
              </Typography>
              <Typography component={Link} to="/contact" sx={linkStyles}>
                Contact
              </Typography>
            </Stack>
          </Grid>

          {/* COLUMN 5: App & Socials */}
          <Grid item xs={12} sm={12} lg={3}>
            <Typography variant="h6" sx={titleStyles}>
              Download App
            </Typography>
            <Stack spacing={2}>
              <Typography variant="caption" color="#9ca3af" fontWeight={600}>
                Save ₹300 with App New User Only
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                {/* QR Code */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "white",
                    p: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <img
                    src={QRCodePng}
                    alt="QR Code"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                {/* App Buttons */}
                <Stack spacing={1} width={120}>
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={googlePlayPng}
                    alt="Google Play"
                    style={{ cursor: "pointer", width: "100%" }}
                  />
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={appStorePng}
                    alt="App Store"
                    style={{ cursor: "pointer", width: "100%" }}
                  />
                </Stack>
              </Stack>

              {/* Social Icons */}
              <Stack direction="row" spacing={2} mt={2}>
                {[facebookPng, twitterPng, instagramPng, linkedinPng].map(
                  (icon, idx) => (
                    <motion.img
                      key={idx}
                      whileHover={{ scale: 1.2, y: -2 }}
                      src={icon}
                      alt="Social Icon"
                      style={{ cursor: "pointer", width: 24, height: 24 }}
                    />
                  ),
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* BOTTOM COPYRIGHT */}
        <Box mt={10}>
          <Divider sx={{ borderColor: "#374151", mb: 3 }} />
          <Typography variant="body2" color="#6b7280" textAlign="center">
            &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

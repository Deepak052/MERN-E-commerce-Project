import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Paper,
  Stack,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  ListItemIcon,
  Box,
} from "@mui/material";

// Icons
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BrandingWatermarkRoundedIcon from "@mui/icons-material/BrandingWatermarkRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

// Redux & Theme
import { UI } from "../theme/theme";
import {
  logoutAsync,
  selectLoggedInAdmin,
} from "../features/auth/slice/AuthSlice";

const AdminTopbar = ({ activeTab, isMobile, setSidebarOpen }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInAdmin);

  // --- Menu States ---
  const [createAnchorEl, setCreateAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // --- Menu Handlers ---
  const handleCreateClick = (event) => setCreateAnchorEl(event.currentTarget);
  const handleCreateClose = () => setCreateAnchorEl(null);

  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  // --- Logout Logic ---
  const handleLogout = () => {
    dispatch(logoutAsync());
    handleProfileClose();
    // Note: No need to manually navigate to /login here.
    // Once Redux state clears the user, your <Protected> route will automatically redirect them!
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: 70,
        borderBottom: UI.border,
        display: "flex",
        alignItems: "center",
        px: 3,
        justifyContent: "space-between",
        borderRadius: 0,
        zIndex: 10,
        bgcolor: UI.cardBg,
      }}
    >
      {/* LEFT SECTION */}
      <Stack direction="row" alignItems="center" spacing={2}>
        {isMobile && (
          <IconButton onClick={() => setSidebarOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
        )}
        <Typography variant="h5" fontWeight={700} color={UI.textMain}>
          {activeTab}
        </Typography>
      </Stack>

      {/* RIGHT SECTION */}
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Create New Button */}
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleCreateClick}
          sx={{
            display: { xs: "none", sm: "flex" }, // Hide text on very small screens
            bgcolor: UI.primary,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "none", bgcolor: "#4f46e5" },
          }}
        >
          Create
        </Button>

        {/* Notifications */}
        <IconButton sx={{ color: UI.textSecondary }}>
          <NotificationsNoneRoundedIcon />
        </IconButton>

        {/* User Profile Avatar Button */}
        <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: UI.primary,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </Avatar>
        </IconButton>

        {/* ========================================== */}
        {/* 🟢 CREATE DROPDOWN MENU */}
        {/* ========================================== */}
        <Menu
          anchorEl={createAnchorEl}
          open={Boolean(createAnchorEl)}
          onClose={handleCreateClose}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: UI.shadow,
              border: UI.border,
              minWidth: 180,
            },
          }}
        >
          <MenuItem
            component={Link}
            to="/products/add"
            onClick={handleCreateClose}
            sx={{ py: 1.5 }}
          >
            <Inventory2RoundedIcon
              fontSize="small"
              sx={{ mr: 1.5, color: UI.textMuted }}
            />{" "}
            Product
          </MenuItem>
          <MenuItem
            component={Link}
            to="/brands"
            onClick={handleCreateClose}
            sx={{ py: 1.5 }}
          >
            <BrandingWatermarkRoundedIcon
              fontSize="small"
              sx={{ mr: 1.5, color: UI.textMuted }}
            />{" "}
            Brand
          </MenuItem>
          <MenuItem
            component={Link}
            to="/categories"
            onClick={handleCreateClose}
            sx={{ py: 1.5 }}
          >
            <CategoryRoundedIcon
              fontSize="small"
              sx={{ mr: 1.5, color: UI.textMuted }}
            />{" "}
            Category
          </MenuItem>
        </Menu>

        {/* ========================================== */}
        {/* 🔴 USER PROFILE DROPDOWN MENU */}
        {/* ========================================== */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: UI.shadow,
              border: UI.border,
              minWidth: 220,
            },
          }}
        >
          {/* User Info Header */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={UI.textMain}
            >
              {user?.name || "Admin User"}
            </Typography>
            <Typography variant="body2" color={UI.textSecondary} noWrap>
              {user?.email || "admin@store.com"}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Settings / Account */}
          <MenuItem onClick={handleProfileClose} sx={{ py: 1.2 }}>
            <ListItemIcon>
              <AccountCircleRoundedIcon
                fontSize="small"
                sx={{ color: UI.textSecondary }}
              />
            </ListItemIcon>
            Account Settings
          </MenuItem>

          {/* Logout */}
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.2, color: "error.main" }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Stack>
    </Paper>
  );
};

export default AdminTopbar;

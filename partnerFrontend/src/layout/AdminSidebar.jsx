import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BrandingWatermarkRoundedIcon from "@mui/icons-material/BrandingWatermarkRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import { UI } from "../theme/theme";

// 🚨 FIX 1: Import useNavigate
import { useNavigate } from "react-router-dom";

// 🚨 FIX 2: Add the correct 'path' to every menu item
const menuItems = [
  { text: "Dashboard", icon: <DashboardRoundedIcon />, path: "/" },
  { text: "Banners", icon: <ViewCarouselRoundedIcon />, path: "/banners" },
  { text: "Orders", icon: <ShoppingCartRoundedIcon />, path: "/orders" },
  { text: "Products", icon: <Inventory2RoundedIcon />, path: "/products" },
  { text: "Brands", icon: <BrandingWatermarkRoundedIcon />, path: "/brands" },
  { text: "Categories", icon: <CategoryRoundedIcon />, path: "/categories" },
  { text: "Customers", icon: <PeopleAltRoundedIcon />, path: "/customers" },
  // { text: "Admins", icon: <BarChartRoundedIcon />, path: "/admins" }, 
];

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  isMobile,
  setSidebarOpen,
}) => {
  // 🚨 FIX 3: Initialize the navigate function
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    setActiveTab(item.text); // Keep this to update the highlighted UI tab
    if (isMobile) setSidebarOpen(false);

    // 🚨 FIX 4: Actually navigate to the new page URL!
    navigate(item.path);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        borderRight: UI.border,
      }}
    >
      <Box p={3} display="flex" alignItems="center" gap={1}>
        <Avatar
          sx={{ bgcolor: UI.primary, width: 32, height: 32, fontWeight: 800 }}
        >
          M
        </Avatar>
        <Typography
          variant="h6"
          fontWeight={800}
          color={UI.textMain}
          letterSpacing="-0.5px"
        >
          Mern Admin
        </Typography>
      </Box>
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.text;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              {/* 🚨 FIX 5: Pass the whole 'item' object into handleItemClick */}
              <ListItemButton
                onClick={() => handleItemClick(item)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? `${UI.primary}15` : "transparent",
                  color: isActive ? UI.primary : UI.textMuted,
                  "&:hover": {
                    backgroundColor: isActive ? `${UI.primary}20` : "#f3f4f6",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 2, color: UI.textMuted }}>
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default AdminSidebar;

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
import { UI } from "../theme";

const menuItems = [
  { text: "Dashboard", icon: <DashboardRoundedIcon /> },
  { text: "Orders", icon: <ShoppingCartRoundedIcon /> },
  { text: "Products", icon: <Inventory2RoundedIcon /> },
  { text: "Brands", icon: <BrandingWatermarkRoundedIcon /> },
  { text: "Categories", icon: <CategoryRoundedIcon /> },
  { text: "Customers", icon: <PeopleAltRoundedIcon /> },
  { text: "Analytics", icon: <BarChartRoundedIcon /> },
];

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  isMobile,
  setSidebarOpen,
}) => {
  const handleItemClick = (text) => {
    setActiveTab(text);
    if (isMobile) setSidebarOpen(false);
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
              <ListItemButton
                onClick={() => handleItemClick(item.text)}
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

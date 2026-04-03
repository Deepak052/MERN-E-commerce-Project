import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Paper,
  Stack,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BrandingWatermarkRoundedIcon from "@mui/icons-material/BrandingWatermarkRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { UI } from "../theme";

const AdminTopbar = ({ activeTab, isMobile, setSidebarOpen }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
      }}
    >
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
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton>
          <NotificationsNoneRoundedIcon />
        </IconButton>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleMenuClick}
          sx={{
            bgcolor: UI.primary,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "none", bgcolor: "#4f46e5" },
          }}
        >
          Create New
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
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
            onClick={handleMenuClose}
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
            to="/admin/add-brand"
            onClick={handleMenuClose}
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
            to="/admin/add-category"
            onClick={handleMenuClose}
            sx={{ py: 1.5 }}
          >
            <CategoryRoundedIcon
              fontSize="small"
              sx={{ mr: 1.5, color: UI.textMuted }}
            />{" "}
            Category
          </MenuItem>
        </Menu>
      </Stack>
    </Paper>
  );
};

export default AdminTopbar;

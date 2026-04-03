import { useState, useEffect } from "react";
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { UI } from "../features/admin/theme";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({
  children,
  activeTab = "Admin Panel", 
  setActiveTab = () => {}, 
  sidebarOpen: propSidebarOpen,
  setSidebarOpen: propSetSidebarOpen,
  isMobile: propIsMobile,
}) => {
  const theme = useTheme();

  // 1. Calculate screen size locally if App.js didn't pass it down
  const hookIsMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : hookIsMobile;

  // 2. Manage sidebar state locally if App.js didn't pass it down
  const [localSidebarOpen, setLocalSidebarOpen] = useState(!isMobile);

  const sidebarOpen =
    propSidebarOpen !== undefined ? propSidebarOpen : localSidebarOpen;
  const setSidebarOpen = propSetSidebarOpen || setLocalSidebarOpen;

  // Ensure sidebar behaves correctly on resize when using local state
  useEffect(() => {
    if (propSetSidebarOpen === undefined) {
      setLocalSidebarOpen(!isMobile);
    }
  }, [isMobile, propSetSidebarOpen]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: UI.bg }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: 260,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 260,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
        />
      </Drawer>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        
        <Box sx={{ p: { xs: 2, md: 4 }, overflowY: "auto", flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

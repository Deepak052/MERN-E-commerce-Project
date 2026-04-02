import { useState, useEffect } from "react";
import { useMediaQuery, useTheme, Paper, Typography } from "@mui/material";
import AdminLayout from "./layout/AdminLayout";
import DashboardView from "./views/DashboardView";
import ProductManagerView from "./views/ProductManagerView";
import BrandManagerView from "./views/BrandManagerView";
import OrderManagerView from "./views/OrderManagerView";
import { UI } from "./theme";
import CategoryManagerView from "./views/CategoryManagerView";

const AdminDashBoard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const renderView = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardView setActiveTab={setActiveTab} />;
      case "Products":
        return <ProductManagerView />;
      case "Brands":
        return <BrandManagerView />;
      case "Orders":
        return <OrderManagerView />;
        case "Categories":
          return <CategoryManagerView/>
      default:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: UI.radius,
              border: UI.border,
            }}
          >
            <Typography variant="h6" color={UI.textMuted}>
              The {activeTab} view is currently under construction.
            </Typography>
          </Paper>
        );
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      isMobile={isMobile}
    >
      {renderView()}
    </AdminLayout>
  );
};

export default AdminDashBoard;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid, Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // 🚨 ADDED: React Router hook

import {
  fetchDashboardStatsAsync,
  selectDashboardStats,
} from "../slice/DashboardSlice";
import StatCard from "../components/StatCard";
import StatusBadge from "../../../components/ui/StatusBadge"; // Fixed import path assuming it's a global UI component
import SalesChart from "../components/SalesChart";
import CategoryChart from "../components/CategoryChart";
import DataTable from "../../../components/ui/DataTable";
import { UI } from "../../../theme/theme";

const DashboardView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 🚨 ADDED: Initialize navigate
  const dashboardStats = useSelector(selectDashboardStats);

  useEffect(() => {
    dispatch(fetchDashboardStatsAsync());
  }, [dispatch]);

  const kpis = dashboardStats?.kpis || {
    totalRevenue: "$0.00",
    totalOrders: 0,
    activeProducts: 0,
    totalCustomers: 0,
  };
  const charts = dashboardStats?.charts || { salesData: [], categoryData: [] };
  const recentOrders = dashboardStats?.recentOrders || [];

  const orderColumns = [
    {
      label: "Order ID",
      field: "id",
      render: (row) => <Typography fontWeight={600}>{row.id}</Typography>,
    },
    { label: "Customer", field: "customer" },
    { label: "Date", field: "date", sx: { color: UI.textMuted } },
    { label: "Amount", field: "amount" },
    {
      label: "Status",
      field: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={kpis.totalRevenue}
            trend="+0"
            isPositive
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={kpis.totalOrders}
            trend="+0"
            isPositive
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Products"
            value={kpis.activeProducts}
            trend="+0"
            isPositive
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={kpis.totalCustomers}
            trend="+0"
            isPositive
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <SalesChart data={charts.salesData} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CategoryChart data={charts.categoryData} />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={700}>
            Recent Orders
          </Typography>
          {/* 🚨 FIX: Use navigate instead of setActiveTab */}
          <Button color="primary" onClick={() => navigate("/orders")}>
            View All
          </Button>
        </Box>
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          emptyMessage="No recent orders found."
        />
      </Box>
    </motion.div>
  );
};

export default DashboardView;

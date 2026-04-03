import { Paper, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UI } from "../../../theme/theme";

const SalesChart = ({ data, title = "Revenue Overview (Last 7 Days)" }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: UI.radius,
      border: UI.border,
      boxShadow: UI.shadow,
    }}
  >
    <Typography variant="h6" fontWeight={700} mb={3}>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height={300}>
      {data?.length > 0 ? (
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: UI.textMuted }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: UI.textMuted }}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: UI.shadow,
            }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke={UI.primary}
            strokeWidth={3}
            dot={{ r: 4, fill: UI.primary }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography color={UI.textMuted}>No sales data available</Typography>
        </Box>
      )}
    </ResponsiveContainer>
  </Paper>
);

export default SalesChart;

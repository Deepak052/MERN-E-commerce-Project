import { Paper, Typography, Box } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { UI } from "../../../theme/theme";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899"];

const CategoryChart = ({ data, title = "Sales by Category" }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: UI.radius,
      border: UI.border,
      boxShadow: UI.shadow,
      height: "100%",
    }}
  >
    <Typography variant="h6" fontWeight={700} mb={3}>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height={300}>
      {data?.length > 0 ? (
        <PieChart>
          <Pie
            data={data}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: UI.shadow,
            }}
          />
        </PieChart>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography color={UI.textMuted}>
            No category data available
          </Typography>
        </Box>
      )}
    </ResponsiveContainer>
  </Paper>
);

export default CategoryChart;

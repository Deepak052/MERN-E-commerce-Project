import { Paper, Typography, Stack, Chip } from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import { motion } from "framer-motion";
import { UI } from "../../../theme/theme";

const StatCard = ({ title, value, trend, isPositive }) => (
  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
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
      <Typography variant="body2" color={UI.textMuted} fontWeight={600} mb={1}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={800} color={UI.textMain} mb={2}>
        {value}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip
          icon={
            isPositive ? (
              <TrendingUpRoundedIcon fontSize="small" />
            ) : (
              <TrendingDownRoundedIcon fontSize="small" />
            )
          }
          label={`${trend}%`}
          size="small"
          sx={{
            backgroundColor: isPositive ? "#d1fae5" : "#fee2e2",
            color: isPositive ? "#065f46" : "#991b1b",
            fontWeight: 700,
          }}
        />
        <Typography variant="caption" color={UI.textMuted}>
          vs last month
        </Typography>
      </Stack>
    </Paper>
  </motion.div>
);

export default StatCard;

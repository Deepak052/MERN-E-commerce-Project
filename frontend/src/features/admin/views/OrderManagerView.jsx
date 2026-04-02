import { motion } from "framer-motion";
import { Paper, Typography } from "@mui/material";
import { UI } from "../theme";

const OrderManagerView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
        The Orders view is currently under construction.
      </Typography>
    </Paper>
  </motion.div>
);

export default OrderManagerView;

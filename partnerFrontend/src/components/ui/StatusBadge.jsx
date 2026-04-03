import { Chip } from "@mui/material";

const StatusBadge = ({ status }) => {
  const colors = {
    Delivered: { bg: "#d1fae5", text: "#065f46" },
    Pending: { bg: "#fef3c7", text: "#92400e" },
    Shipped: { bg: "#dbeafe", text: "#1e40af" },
    Cancelled: { bg: "#fee2e2", text: "#991b1b" },
    Active: { bg: "#d1fae5", text: "#065f46" },
    Inactive: { bg: "#f3f4f6", text: "#374151" },
  };
  const current = colors[status] || colors.Inactive;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: current.bg,
        color: current.text,
        fontWeight: 600,
        borderRadius: "6px",
      }}
    />
  );
};

export default StatusBadge;

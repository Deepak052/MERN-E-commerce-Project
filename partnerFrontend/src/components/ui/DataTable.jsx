import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { UI } from "../../features/admin/theme";

const DataTable = ({ columns, data, emptyMessage = "No data found." }) => (
  <TableContainer
    component={Paper}
    elevation={0}
    sx={{ border: UI.border, boxShadow: UI.shadow, overflow: "hidden" }}
  >
    <Table>
      <TableHead sx={{ backgroundColor: "#f9fafb" }}>
        <TableRow>
          {columns.map((col, idx) => (
            <TableCell key={idx} sx={{ fontWeight: 600, color: UI.textMuted }}>
              {col.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.length > 0 ? (
          data.map((row, rowIdx) => (
            <TableRow
              key={rowIdx}
              hover
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} sx={col.sx}>
                  {col.render ? col.render(row) : row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
              <Typography color={UI.textMuted}>{emptyMessage}</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

export default DataTable;

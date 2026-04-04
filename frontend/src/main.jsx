import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux"; 
import { store } from "./store/store.js" 
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./index.css";
import App from "./App.jsx";
import theme from "./theme/theme.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>  
        <CssBaseline />               
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
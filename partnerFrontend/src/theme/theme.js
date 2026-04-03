import { createTheme } from "@mui/material/styles";

// 1. ADD THIS: Export the UI object so your components can use it
export const UI = {
  bg: "#f4f5f7",
  cardBg: "#ffffff",
  primary: "#6366f1", // The Indigo color used in the sidebar
  textMain: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "1px solid #e5e7eb",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  radius: 3,
};

// 2. Keep your existing MUI theme
export const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
      light: "#ffffff",
      dark: "#DB4444",
      customBlack: "#191919",
    },
    secondary: {
      main: "#f5f5f5",
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
    h1: {
      fontSize: "6rem",
      "@media (max-width:960px)": {
        fontSize: "5rem",
      },
      "@media (max-width:600px)": {
        fontSize: "4rem",
      },
      "@media (max-width:414px)": {
        fontSize: "2.5rem",
      },
    },
    h2: {
      fontSize: "3.75rem",
      "@media (max-width:960px)": {
        fontSize: "3rem",
      },
      "@media (max-width:662px)": {
        fontSize: "2.3rem",
      },
      "@media (max-width:414px)": {
        fontSize: "2.2rem",
      },
    },
    h3: {
      fontSize: "3rem",
      "@media (max-width:960px)": {
        fontSize: "2.4rem",
      },
      "@media (max-width:662px)": {
        fontSize: "2rem",
      },
      "@media (max-width:414px)": {
        fontSize: "1.7rem",
      },
    },
    h4: {
      fontSize: "2.125rem",
      "@media (max-width:960px)": {
        fontSize: "1.5rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h5: {
      fontSize: "1.5rem",
      "@media (max-width:960px)": {
        fontSize: "1.25rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1.1rem",
      },
    },
    h6: {
      fontSize: "1.25rem",
      "@media (max-width:960px)": {
        fontSize: "1.1rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1rem",
      },
    },
    body1: {
      fontSize: "1rem",
      "@media (max-width:960px)": {
        fontSize: "1rem",
      },
      "@media (max-width:600px)": {
        fontSize: ".9rem",
      },
    },
    body2: {
      fontSize: "1rem",
      "@media (max-width:960px)": {
        fontSize: "1rem",
      },
      "@media (max-width:600px)": {
        fontSize: "1rem",
      },
      "@media (max-width:480px)": {
        fontSize: ".97rem",
      },
    },
  },
});

export default theme;

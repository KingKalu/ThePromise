import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#c90e21",
      dark: "#b80d1e",
      light: "#de2335",
      contrastText: "#fffaf4",
    },
    secondary: {
      main: "#f6c445",
      dark: "#dea31f",
      light: "#f9dc7f",
      contrastText: "#3c2400",
    },
    background: {
      default: "#fff7ea",
      paper: "#ffffff",
    },
    text: {
      primary: "#32190e",
      secondary: "#7a4e2b",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'var(--font-sora), "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at 0% 0%, #ffefca 0%, #fff7ea 38%, #fff9f1 100%)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#f6c445",
          color: "#3c2400",
          boxShadow: "0 10px 24px rgba(91, 55, 0, 0.12)",
          borderBottom: "1px solid rgba(60, 36, 0, 0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(60, 36, 0, 0.08)",
          boxShadow: "0 16px 35px rgba(60, 36, 0, 0.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});

export default theme;

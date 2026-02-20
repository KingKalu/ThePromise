import { Box } from "@mui/material";
import AppNavbar from "@/components/layout/AppNavbar";
import AppFooter from "@/components/layout/AppFooter";

export default function AppShell({ children, footerText, headerActions }) {
  return (
    <Box
      className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100"
      sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <AppNavbar headerActions={headerActions} />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <AppFooter footerText={footerText} />
    </Box>
  );
}

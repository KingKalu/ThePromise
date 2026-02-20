import Link from "next/link";
import { Box, Container, Stack, Typography } from "@mui/material";

export default function AppFooter({ footerText }) {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100"
      sx={{ borderTop: "1px solid rgba(60,36,0,0.08)", py: 3, mt: 6 }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {footerText || `The Promise - Smart Dining Platform (${year})`}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Typography component={Link} href="/order" variant="body2" sx={{ color: "text.secondary" }}>
              Order
            </Typography>
            <Typography component={Link} href="/kitchen" variant="body2" sx={{ color: "text.secondary" }}>
              Kitchen
            </Typography>
            <Typography component={Link} href="/admin" variant="body2" sx={{ color: "text.secondary" }}>
              Head Office
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

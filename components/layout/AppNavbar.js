import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/order", label: "Order" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/admin", label: "Head Office" },
];
const LOGO_RED = "#c90e21";

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppNavbar({ headerActions }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar sx={{ minHeight: 78, px: { xs: 0, md: 1 }, overflow: "visible" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.4,
              flexGrow: 1,
            }}
          >
            <Box
              component={Link}
              href="/"
              sx={{
                width: 84,
                height: 84,
                padding: "7px",
                marginBottom: "-22px",
                borderRadius: "999px",
                bgcolor: "#c90e21",
                border: "7px solid #f6c445",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 10px 22px rgba(110, 12, 12, 0.18)",
              }}
              aria-label="Go to home"
            >
              <Avatar
                variant="circular"
                src="/assets/logos/The-Promise-Logo-Small-Icon.png"
                alt="The Promise logo"
                sx={{
                  width: 58,
                  height: 58,
                  border: "none",
                }}
              />
            </Box>
            <Box sx={{ display: "none" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                The Promise
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(60, 36, 0, 0.72)" }}>
                Smart Dining Platform
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(router.pathname, item.href);
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  variant={active ? "contained" : "text"}
                  color="inherit"
                  sx={{
                    borderRadius: "999px",
                    px: 2.2,
                    color: active ? "#fff8f2" : "#6d3814",
                    bgcolor: active ? LOGO_RED : "transparent",
                    "&:hover": {
                      bgcolor: active ? "#b80d1e" : "rgba(109, 56, 20, 0.09)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              ml: 2,
              alignItems: "center",
              "& .MuiButton-contained": {
                bgcolor: LOGO_RED,
                color: "#fff8f2",
                "&:hover": {
                  bgcolor: "#b80d1e",
                },
              },
            }}
          >
            {headerActions || null}
            <Chip
              size="small"
              label="Live"
              sx={{
                ml: headerActions ? 1 : 0,
                borderRadius: "999px",
                bgcolor: LOGO_RED,
                color: "#fff8f2",
                "& .MuiChip-label": { fontWeight: 700 },
              }}
            />
          </Box>

          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "#6d3814",
            }}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 300 }} role="presentation">
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={() => setOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ pt: 0 }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(router.pathname, item.href);
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={active}
                  onClick={() => setOpen(false)}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
          <Box
            sx={{
              p: 2,
              pt: headerActions ? 1 : 2,
              "& .MuiButton-contained": {
                bgcolor: LOGO_RED,
                color: "#fff8f2",
                "&:hover": {
                  bgcolor: "#b80d1e",
                },
              },
            }}
          >
            {headerActions || null}
            <Chip
              size="small"
              label="Live Platform"
              sx={{
                mt: 1,
                bgcolor: LOGO_RED,
                color: "#fff8f2",
                "& .MuiChip-label": { fontWeight: 700 },
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}

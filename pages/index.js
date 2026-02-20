import Head from "next/head";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AppShell from "@/components/layout/AppShell";
import HeroFoodCarousel from "@/components/home/HeroFoodCarousel";

const MENU_PREVIEW = [
  {
    label: "Signature Rice Bowl",
    badge: "Best",
    price: "\u20A61500 / item",
    image: "/assets/images/riceAndChicken.jpg",
  },
  {
    label: "Grilled Kebab Platter",
    badge: "Hot",
    price: "\u20A61140 / item",
    image: "/assets/images/menu-assorted.jpg",
  },
  {
    label: "Flame Jollof Combo",
    badge: "New",
    price: "\u20A61520 / item",
    image: "/assets/images/menu-jollof.jpg",
  },
  {
    label: "Crispy Deluxe",
    badge: "Chef",
    price: "\u20A61320 / item",
    image: "/assets/images/chicken-curry.png",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>The Promise | Smart Dining Platform</title>
        <meta
          name="description"
          content="The Promise unifies customer ordering, kitchen operations, and head office analytics in one responsive platform."
        />
      </Head>

      <AppShell
        footerText="The Promise | Smart dining across ordering, kitchen, and head-office operations."
        headerActions={
          <Button component={Link} href="/order" variant="contained" size="small">
            Start Ordering
          </Button>
        }
      >
        <Box
          sx={{
            pt: { xs: 6, md: 9 },
            pb: { xs: 7, md: 10 },
            background:
              "linear-gradient(135deg, #c90e21 0%, #c90e21 56%, #f6c445 100%)",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
              <Grid size={{ xs: 12, md: 6.5 }}>
                <Chip
                  label="Fast | Fresh | Connected"
                  sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.22)", color: "#fff8ef" }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    color: "#fff7ef",
                    fontSize: { xs: "2.3rem", md: "3.7rem" },
                    lineHeight: 1.02,
                    maxWidth: 620,
                  }}
                >
                  Modern food service for every branch.
                </Typography>
                <Typography sx={{ mt: 2.2, color: "#ffe7c8", maxWidth: 560 }}>
                  Guests place orders in seconds, kitchen staff work from a live queue, and
                  head office sees clear performance metrics in real time.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5 }}>
                  <Button
                    component={Link}
                    href="/order"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ bgcolor: "#fff8ef", color: "#5d1e0e", "&:hover": { bgcolor: "#fff0dc" } }}
                  >
                    Order Now
                  </Button>
                  <Button
                    component={Link}
                    href="/admin"
                    variant="outlined"
                    size="large"
                    sx={{ borderColor: "rgba(255,240,220,0.8)", color: "#fff0dc" }}
                  >
                    View Head Office Dashboard
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5.5 }}>
                <HeroFoodCarousel />
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 7 }, pt: { xs: 3.2, md: 3.8 } }}>
          <Grid container spacing={2}>
            {MENU_PREVIEW.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
                <Card
                  sx={{
                    overflow: "hidden",
                    borderRadius: "14px",
                    bgcolor: "#f1f2f4",
                    border: "1px solid rgba(60, 36, 0, 0.06)",
                    boxShadow: "0 14px 26px rgba(46, 26, 7, 0.08)",
                  }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.label}
                    sx={{ width: "100%", height: 180, objectFit: "cover" }}
                  />
                  <CardContent sx={{ p: 1.8 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: 0.8,
                        py: 0.15,
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#c77609",
                        bgcolor: "#ffe7c2",
                      }}
                    >
                      {item.badge}
                    </Box>
                    <Typography sx={{ mt: 0.9, fontSize: 21, fontWeight: 800, color: "#2f160b" }}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#8f2517", mt: 0.65, minHeight: 70, lineHeight: 1.35, fontSize: 13 }}
                    >
                      The Promise burger experience with crisp lettuce, melted cheese, and a soft
                      sesame bun.
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.2 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 20, color: "#2b1208" }}>
                        {item.price}
                      </Typography>
                      <Button
                        component={Link}
                        href="/order"
                        variant="contained"
                        sx={{
                          minWidth: 72,
                          borderRadius: "14px",
                          bgcolor: "#c90e21",
                          color: "#fff8f2",
                          "&:hover": { bgcolor: "#b80d1e" },
                        }}
                      >
                        Order
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: { xs: 3.2, md: 4 },
              display: "grid",
              gap: 2.2,
              gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "1.65fr 1fr" },
            }}
          >
            <Card
              sx={{
                borderRadius: "26px",
                bgcolor: "#efd9ab",
                border: "1px solid rgba(106, 66, 24, 0.08)",
                overflow: "hidden",
                minHeight: { xs: 300, md: 350 },
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1.5, md: 2.8 },
                  px: { xs: 2, md: 3 },
                  py: { xs: 2.5, md: 3.5 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box
                  component="img"
                  src="/assets/images/dispatch-rider.png"
                  alt="Dispatch rider"
                  sx={{
                    width: { xs: 210, md: 320 },
                    maxWidth: "100%",
                    objectFit: "contain",
                    alignSelf: { xs: "center", sm: "flex-end" },
                  }}
                />
                <Box sx={{ flex: 1, maxWidth: 360 }}>
                  <Typography sx={{ fontSize: { xs: 33, md: 36 }, fontWeight: 800, color: "#2c1008" }}>
                    Order Your Favorites Fast.
                  </Typography>
                  <Typography sx={{ mt: 1.2, color: "#8b2b17", lineHeight: 1.4, fontSize: 17 }}>
                    <strong>Easy</strong> - Place orders in seconds from any branch.
                    <br />
                    <strong>Flexible</strong> - Add sides, combos, and extras in one flow.
                  </Typography>
                  <Button
                    component={Link}
                    href="/order"
                    variant="contained"
                    sx={{
                      mt: 2.2,
                      borderRadius: "999px",
                      px: 3.2,
                      py: 0.9,
                      bgcolor: "#c90e21",
                      color: "#fff8f2",
                      "&:hover": { bgcolor: "#b80d1e" },
                    }}
                  >
                    Order Delivery
                  </Button>
                </Box>
              </Box>
            </Card>

            <Card
              sx={{
                borderRadius: "26px",
                bgcolor: "#c90e21",
                border: "1px solid rgba(106, 10, 14, 0.15)",
                overflow: "hidden",
                minHeight: { xs: 300, md: 350 },
                p: { xs: 2.2, md: 2.4 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                component="img"
                src="/assets/images/hero-burger.png"
                alt="Hero burger"
                sx={{
                  width: "86%",
                  maxWidth: 340,
                  alignSelf: "center",
                  objectFit: "contain",
                  filter: "drop-shadow(0 14px 20px rgba(90, 5, 10, 0.3))",
                }}
              />
              <Typography sx={{ mt: 1.2, color: "#fff7ef", fontSize: 34, fontWeight: 800 }}>
                Hero Burger Special
              </Typography>
              <Typography sx={{ mt: 0.9, color: "#ffd8d8", lineHeight: 1.35, fontSize: 16 }}>
                Juicy, satisfying, and made to order. Pair it with fries or your favorite side.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  mt: "auto",
                  alignSelf: "flex-start",
                  borderRadius: "999px",
                  borderColor: "rgba(255, 223, 223, 0.4)",
                  color: "#ffe0e0",
                  px: 2.5,
                  py: 0.7,
                  "&:hover": {
                    borderColor: "#ffe0e0",
                    bgcolor: "rgba(255, 230, 230, 0.08)",
                  },
                }}
              >
                Choose Yours
              </Button>
            </Card>
          </Box>
        </Container>
      </AppShell>
    </>
  );
}

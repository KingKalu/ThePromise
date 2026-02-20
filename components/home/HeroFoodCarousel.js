import { useEffect, useMemo, useState } from "react";
import { Box, Fade, Stack, Typography } from "@mui/material";
import { getMenu } from "@/lib/api";

const IMAGE_BY_ID = {
  jollof: "/assets/images/menu-jollof.jpg",
  "grilled-chicken": "/assets/images/menu-chicken.jpg",
  suya: "/assets/images/menu-assorted.jpg",
  salad: "/assets/images/menu-salad.jpg",
  smoothie: "/assets/images/riceAndChicken.jpg",
  waffles: "/assets/images/menu-pasta.jpg",
};

const FALLBACK_IMAGE_POOL = [
  "/assets/images/menu-jollof.jpg",
  "/assets/images/menu-chicken.jpg",
  "/assets/images/menu-egusi.jpg",
  "/assets/images/menu-fries.jpg",
  "/assets/images/menu-pizza.jpg",
  "/assets/images/menu-plantain.jpg",
  "/assets/images/menu-fufu.jpg",
];

const FALLBACK_SLIDES = [
  {
    id: "fallback-jollof",
    name: "Jollof Rice",
    image: "/assets/images/menu-jollof.jpg",
  },
  {
    id: "fallback-chicken",
    name: "Grilled Chicken",
    image: "/assets/images/menu-chicken.jpg",
  },
  {
    id: "fallback-egusi",
    name: "Chef Special",
    image: "/assets/images/menu-egusi.jpg",
  },
];

export default function HeroFoodCarousel() {
  const [menuItems, setMenuItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadMenu() {
      try {
        const menu = await getMenu();
        if (!mounted) return;
        const slides = (menu || []).map((item, slideIndex) => ({
          id: item.id,
          name: item.name,
          image:
            IMAGE_BY_ID[item.id] ||
            FALLBACK_IMAGE_POOL[slideIndex % FALLBACK_IMAGE_POOL.length],
        }));
        setMenuItems(slides.length ? slides : FALLBACK_SLIDES);
      } catch {
        if (mounted) setMenuItems(FALLBACK_SLIDES);
      }
    }
    loadMenu();
    return () => {
      mounted = false;
    };
  }, []);

  const slides = useMemo(
    () => (menuItems.length ? menuItems : FALLBACK_SLIDES),
    [menuItems],
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  useEffect(() => {
    if (index < slides.length) return;
    setIndex(0);
  }, [index, slides.length]);

  const active = slides[index] || FALLBACK_SLIDES[0];

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      sx={{ width: "100%", maxWidth: 460, mx: "auto" }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: "999px",
          overflow: "hidden",
          bgcolor: "#ffe6b0",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
          aspectRatio: "1 / 1",
          border: "5px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        <Fade in key={active.id} timeout={700}>
          <Box
            component="img"
            src={active.image}
            alt={active.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Fade>
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
        {slides.map((slide, i) => (
          <Box
            key={slide.id}
            component="button"
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${slide.name}`}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              bgcolor: i === index ? "primary.main" : "rgba(127, 29, 29, 0.24)",
            }}
          />
        ))}
      </Stack>

      <Typography
        variant="subtitle1"
        sx={{ mt: 1.5, textAlign: "center", fontWeight: 700 }}
      >
        {active.name}
      </Typography>
    </Box>
  );
}

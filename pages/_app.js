import "@/styles/tailwind.css";
import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { Sora } from "next/font/google";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/lib/muiTheme";

const ChatAssistant = dynamic(() => import("@/components/ChatAssistant"), {
  ssr: false,
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={sora.variable}>
        <Component {...pageProps} />
        <ChatAssistant />
      </div>
    </ThemeProvider>
  );
}

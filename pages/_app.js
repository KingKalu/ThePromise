import "@/styles/globals.css";
import dynamic from "next/dynamic";

const ChatAssistant = dynamic(() => import("@/components/ChatAssistant"), {
  ssr: false,
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <ChatAssistant />
    </>
  );
}

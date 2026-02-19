import { useState } from "react";
import { useRouter } from "next/router";
import { sendChatMessage } from "@/lib/api";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I am the Promise Assistant. I can help you explore ordering, kitchen operations and head office analytics.",
  },
];

function roleForPath(pathname) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/kitchen")) return "staff";
  return "customer";
}

export default function ChatAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const value = input.trim();
    if (!value || sending) return;
    const userMessage = {
      id: String(Date.now()),
      role: "user",
      text: value,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    try {
      const payload = {
        role: roleForPath(router.pathname || "/"),
        message: value,
        branchId: null,
        page: router.pathname || "/",
      };
      const response = await sendChatMessage(payload);
      const assistantMessage = {
        id: String(Date.now()) + "-assistant",
        role: "assistant",
        text: response.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      const fallback = {
        id: String(Date.now()) + "-error",
        role: "assistant",
        text: "I could not reach the assistant service right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <button
        className="chat-toggle"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close Assistant" : "Ask The Promise Ai"}
      </button>
      {open && (
        <section className="chat-panel">
          <header className="chat-header">
            <div className="chat-title">Promise Assistant</div>
            <div className="chat-subtitle">
              Context-aware helper for customers, staff and head office.
            </div>
          </header>
          <div className="chat-body">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "assistant"
                    ? "chat-bubble assistant"
                    : "chat-bubble user"
                }
              >
                {message.text}
              </div>
            ))}
          </div>
          <footer className="chat-footer">
            <textarea
              className="chat-input"
              placeholder="Ask about ordering, operations or analytics..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button
              className="btn primary chat-send"
              type="button"
              disabled={sending || !input.trim()}
              onClick={handleSend}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </footer>
        </section>
      )}
    </>
  );
}

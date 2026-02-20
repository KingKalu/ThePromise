import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { sendChatMessage } from "@/lib/api";
import {
  Box,
  CircularProgress,
  Fade,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

const ASSISTANT_NAME = "Promise AI";

const COLORS = {
  primaryMain: "#c90e21",
  primaryDark: "#b80d1e",
  primaryLight: "#de2335",
  secondaryMain: "#f6c445",
  secondaryDark: "#dea31f",
  textPrimary: "#32190e",
  textSecondary: "#7a4e2b",
  warmBg: "#fff7ea",
  warmPaper: "#fffaf3",
  white: "#ffffff",
};

function makeWelcomeMessage() {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    text: "Good evening. How can I help you with your order today?",
    createdAt: Date.now(),
  };
}

function roleForPath(pathname) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/kitchen")) return "staff";
  return "customer";
}

function contextLabel(pathname) {
  if (pathname.startsWith("/admin")) return "Head Office";
  if (pathname.startsWith("/kitchen")) return "Kitchen";
  if (pathname.startsWith("/order")) return "Ordering";
  return "General";
}

export default function ChatAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [makeWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [open, messages, typing]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSend() {
    const value = input.trim();
    if (!value || sending) return;

    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${now}`,
        role: "user",
        text: value,
        createdAt: now,
      },
    ]);
    setInput("");
    setSending(true);
    setTyping(true);

    try {
      const response = await sendChatMessage({
        role: roleForPath(router.pathname || "/"),
        message: value,
        branchId: null,
        page: router.pathname || "/",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: response.reply,
          createdAt: Date.now(),
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "I could not reach the assistant service right now. Please try again in a moment.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setTyping(false);
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function formatMessageTime(value) {
    if (!value) return "";
    return timeFormatter.format(new Date(value));
  }

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 10, sm: 18 },
        bottom: { xs: 10, sm: 18 },
        zIndex: 1250,
      }}
    >
      <Fab
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        sx={{
          width: 58,
          height: 58,
          color: "#fffaf4",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          background:
            "linear-gradient(145deg, rgba(222,35,53,1) 0%, rgba(201,14,33,1) 54%, rgba(184,13,30,1) 100%)",
          boxShadow: "0 18px 36px rgba(90, 20, 20, 0.34)",
          "&:hover": {
            background:
              "linear-gradient(145deg, rgba(228,57,74,1) 0%, rgba(214,39,56,1) 54%, rgba(184,13,30,1) 100%)",
          },
        }}
      >
        <SmartToyOutlinedIcon />
      </Fab>

      <Fade in={open} timeout={180} unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            right: 0,
            bottom: 70,
            width: { xs: "calc(100vw - 20px)", sm: 360 },
            maxWidth: "100vw",
            height: {
              xs: "min(78vh, 560px)",
              sm: "min(560px, calc(100vh - 110px))",
            },
            maxHeight: "calc(100vh - 96px)",
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(122, 78, 43, 0.16)",
            boxShadow: "0 28px 56px rgba(60, 36, 0, 0.22)",
            background: COLORS.warmPaper,
          }}
        >
          <Box
            sx={{
              height: 68,
              px: 1,
              background:
                "linear-gradient(120deg, rgba(184,13,30,1) 0%, rgba(201,14,33,1) 58%, rgba(222,35,53,1) 100%)",
              color: "#fffaf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "3px solid rgba(246,196,69,0.7)",
            }}
          >
            <IconButton
              size="small"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              sx={{ color: "inherit" }}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>

            <Stack spacing={0.1} alignItems="center">
              <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                {ASSISTANT_NAME}
              </Typography>
              <Typography sx={{ fontSize: 10.5, opacity: 0.9 }}>
                {contextLabel(router.pathname || "/")} assistant
              </Typography>
            </Stack>

            <IconButton
              size="small"
              aria-label="Assistant options"
              sx={{ color: "inherit" }}
            >
              <MoreHorizRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            ref={messagesRef}
            sx={{
              flex: 1,
              px: 1.2,
              py: 1.1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              background:
                "radial-gradient(circle at 0% 0%, rgba(246,196,69,0.2) 0%, rgba(255,247,234,0.1) 40%, rgba(255,250,243,0.95) 100%)",
            }}
          >
            <Box
              sx={{
                alignSelf: "center",
                px: 1.1,
                py: 0.25,
                borderRadius: 8,
                bgcolor: "rgba(122, 78, 43, 0.12)",
                color: "#7a4e2b",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              Today
            </Box>

            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  alignSelf:
                    message.role === "assistant" ? "flex-start" : "flex-end",
                  maxWidth: "80%",
                  px: 1.2,
                  py: 0.95,
                  borderRadius:
                    message.role === "assistant"
                      ? "10px 10px 10px 4px"
                      : "10px 10px 4px 10px",
                  border:
                    message.role === "assistant"
                      ? "1px solid rgba(122, 78, 43, 0.16)"
                      : "1px solid rgba(201, 14, 33, 0.32)",
                  bgcolor:
                    message.role === "assistant" ? COLORS.white : "transparent",
                  background:
                    message.role === "assistant"
                      ? COLORS.white
                      : "linear-gradient(145deg, rgba(222,35,53,1) 0%, rgba(201,14,33,1) 58%, rgba(184,13,30,1) 100%)",
                  color:
                    message.role === "assistant"
                      ? COLORS.textPrimary
                      : "#fffaf4",
                  boxShadow:
                    message.role === "assistant"
                      ? "0 6px 12px rgba(122, 78, 43, 0.08)"
                      : "0 8px 16px rgba(201, 14, 33, 0.3)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12.6,
                    lineHeight: 1.42,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.text}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontSize: 9.8,
                    fontWeight: 600,
                    opacity: 0.72,
                    textAlign: message.role === "assistant" ? "left" : "right",
                  }}
                >
                  {formatMessageTime(message.createdAt)}
                </Typography>
              </Box>
            ))}

            {typing && (
              <Box
                sx={{
                  alignSelf: "flex-start",
                  px: 1,
                  py: 0.62,
                  borderRadius: "10px 10px 10px 4px",
                  border: "1px solid rgba(122, 78, 43, 0.16)",
                  bgcolor: COLORS.white,
                  boxShadow: "0 6px 12px rgba(122, 78, 43, 0.08)",
                }}
              >
                <Stack direction="row" spacing={0.58} alignItems="center">
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: COLORS.primaryLight,
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: COLORS.primaryMain,
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: COLORS.secondaryMain,
                    }}
                  />
                </Stack>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              p: 1.15,
              borderTop: "1px solid rgba(122, 78, 43, 0.14)",
              background: "rgba(255, 250, 243, 0.95)",
            }}
          >
            <Stack direction="row" spacing={0.65} alignItems="stretch">
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 1,
                  border: "1.5px solid rgba(122, 78, 43, 0.38)",
                  bgcolor: COLORS.white,
                  px: 1.1,
                  py: 0.55,
                  "&:focus-within": {
                    borderColor: COLORS.primaryMain,
                    boxShadow: "0 0 0 1px rgba(201, 14, 33, 0.18)",
                  },
                }}
              >
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  variant="standard"
                  multiline
                  minRows={2}
                  maxRows={5}
                  placeholder="Type a message"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: 12.7,
                      color: COLORS.textPrimary,
                      lineHeight: 1.4,
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#997257",
                      opacity: 1,
                    },
                  }}
                />
              </Box>

              <IconButton
                size="small"
                onClick={handleSend}
                disabled={sending || !input.trim()}
                aria-label="Send"
                sx={{
                  width: 58,
                  height: 58,
                  alignSelf: "stretch",
                  borderRadius: "100%",
                  border: "1px solid rgba(122, 78, 43, 0.26)",
                  color: "#fffaf4",
                  background:
                    "linear-gradient(145deg, rgba(246,196,69,1) 0%, rgba(222,163,31,1) 100%)",
                  boxShadow: "0 8px 14px rgba(222, 163, 31, 0.28)",
                  "&:hover": {
                    background:
                      "linear-gradient(145deg, rgba(250,207,96,1) 0%, rgba(231,176,44,1) 100%)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(255, 250, 244, 0.8)",
                    background: "#eacb82",
                  },
                }}
              >
                {sending ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <SendRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}

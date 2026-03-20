/**
 * components/FloatingChat.jsx
 *
 * Widget chat nổi ở góc phải màn hình — đặt trong MainLayout hoặc App.jsx
 * Chỉ hiển thị khi user đã đăng nhập.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChatSocket } from "../hooks/useChatSocket";
import axiosClient from "../services/axiosClient";

/* ── STYLES ── */
const S = {
  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 1000,
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#c8490c",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,.25)",
    transition: "transform .15s",
  },
  window: {
    position: "fixed",
    bottom: 88,
    right: 24,
    zIndex: 1000,
    width: 340,
    height: 480,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,.18)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "0.5px solid #e2ded6",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    padding: "12px 16px",
    background: "#1c1917",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(255,255,255,.3)",
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 14, fontWeight: 600, margin: 0 },
  headerStatus: { fontSize: 11, color: "rgba(255,255,255,.6)", margin: 0 },
  closeBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,.7)",
    cursor: "pointer",
    fontSize: 20,
    lineHeight: 1,
    padding: 4,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "#f5f3ef",
  },
  msgRow: (isMe) => ({
    display: "flex",
    justifyContent: isMe ? "flex-end" : "flex-start",
  }),
  bubble: (isMe) => ({
    maxWidth: "75%",
    padding: "8px 12px",
    borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
    background: isMe ? "#c8490c" : "#fff",
    color: isMe ? "#fff" : "#1c1917",
    fontSize: 13,
    lineHeight: 1.5,
    border: isMe ? "none" : "0.5px solid #e2ded6",
    wordBreak: "break-word",
  }),
  time: {
    fontSize: 10,
    color: "#a8a29e",
    textAlign: "right",
    marginTop: 2,
  },
  typingDot: {
    display: "flex",
    gap: 3,
    padding: "8px 12px",
    background: "#fff",
    borderRadius: "14px 14px 14px 4px",
    border: "0.5px solid #e2ded6",
    alignItems: "center",
  },
  footer: {
    padding: "10px 12px",
    borderTop: "0.5px solid #e2ded6",
    display: "flex",
    gap: 8,
    background: "#fff",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    border: "0.5px solid #e2ded6",
    borderRadius: 20,
    fontSize: 13,
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    lineHeight: 1.4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#c8490c",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    alignSelf: "flex-end",
  },
};

/* ── TYPING DOTS ── */
const TypingIndicator = () => (
  <div style={S.typingDot}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#a8a29e",
          animation: `chatBounce .8s ${i * 0.15}s ease-in-out infinite`,
        }}
      />
    ))}
  </div>
);

/* ── MAIN COMPONENT ── */
const FloatingChat = () => {
  const hasUserInMachine = !!localStorage.getItem("currentUser");

  // 2. CHỈ CẦN DÒNG NÀY: Nếu không có user trong máy thì mới ẩn, còn có là hiện luôn!
  if (!hasUserInMachine) return null;
  const { user, token, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState(null); // conversation object
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoad] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const hasToken = !!token || !!localStorage.getItem("token");
  const bodyRef = useRef(null);
  const typingTimer = useRef(null);

  /* ── Helper: cuộn xuống cuối ── */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current)
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 50);
  }, []);

  /* ── Socket handlers ── */
  const handleNewMessage = useCallback(
    ({ message, conversation }) => {
      setMsgs((prev) => {
        if (prev.find((m) => m._id === message._id)) return prev; // dedup
        return [...prev, message];
      });
      setConv(conversation);
      if (!open) setUnread((n) => n + 1);
      scrollToBottom();
    },
    [open, scrollToBottom],
  );

  const handleTyping = useCallback(() => setOtherTyping(true), []);
  const handleStopTyping = useCallback(() => setOtherTyping(false), []);

  const { sendMessage, emitTyping, emitStopTyping } = useChatSocket({
    token,
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
  });

  /* ── Lấy/tạo conversation khi mở lần đầu ── */
  useEffect(() => {
    if (!open || conv) return;
    (async () => {
      setLoad(true);
      try {
        const res = await axiosClient.post("/chat/conversation");
        if (res.success) {
          setConv(res.conversation);
          // Lấy lịch sử
          const hist = await axiosClient.get(
            `/chat/messages/${res.conversation._id}`,
          );
          if (hist.success) setMsgs(hist.messages);
          scrollToBottom();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoad(false);
      }
    })();
  }, [open]);

  /* ── Reset unread khi mở ── */
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  /* ── Gửi tin ── */
  const handleSend = () => {
    if (!text.trim() || !conv) return;
    sendMessage({ conversationId: conv._id, text });
    setText("");
    clearTimeout(typingTimer.current);
    // Tìm người kia trong participants
    const other = conv.participants?.find(
      (p) => p._id !== (user?.id || user?._id),
    );
    if (other)
      emitStopTyping({ conversationId: conv._id, toUserId: other._id });
  };

  /* ── Gõ phím ── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!conv) return;
    const other = conv.participants?.find(
      (p) => p._id !== (user?.id || user?._id),
    );
    if (!other) return;
    emitTyping({ conversationId: conv._id, toUserId: other._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitStopTyping({ conversationId: conv._id, toUserId: other._id });
    }, 2000);
  };

  /* ── Không render nếu chưa đăng nhập ── */
  if (authLoading && !hasToken) return null;

  // Tên admin (người còn lại trong conversation)
  const adminInfo = conv?.participants?.find(
    (p) => p._id !== (user?.id || user?._id),
  );

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
        }
        .fc-body::-webkit-scrollbar{width:4px}
        .fc-body::-webkit-scrollbar-thumb{background:#e2ded6;border-radius:2px}
      `}</style>

      {/* Floating Action Button */}
      <button
        style={S.fab}
        onClick={() => setOpen((v) => !v)}
        title="Chat với hỗ trợ"
      >
        {open ? (
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
        {unread > 0 && !open && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#dc2626",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={S.window}>
          {/* Header */}
          <div style={S.header}>
            <img
              src={adminInfo?.avatarUrl || "https://via.placeholder.com/34"}
              alt="support"
              style={S.avatar}
            />
            <div style={S.headerInfo}>
              <p style={S.headerName}>
                {adminInfo?.name || "Hỗ trợ BAO Po_Box"}
              </p>
              <p style={S.headerStatus}>
                {otherTyping ? "Đang nhập..." : "Trực tuyến"}
              </p>
            </div>
            <button style={S.closeBtn} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          {/* Body */}
          <div ref={bodyRef} style={S.body} className="fc-body">
            {loading && (
              <div
                style={{
                  textAlign: "center",
                  color: "#a8a29e",
                  fontSize: 12,
                  padding: 20,
                }}
              >
                Đang tải...
              </div>
            )}
            {msgs.map((msg) => {
              const isMe =
                msg.sender?._id === (user?.id || user?._id) ||
                msg.sender === (user?.id || user?._id);
              return (
                <div key={msg._id} style={S.msgRow(isMe)}>
                  <div>
                    <div style={S.bubble(isMe)}>{msg.text}</div>
                    <div style={S.time}>
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {otherTyping && (
              <div style={S.msgRow(false)}>
                <TypingIndicator />
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={S.footer}>
            <textarea
              style={S.input}
              rows={1}
              placeholder="Nhập tin nhắn..."
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button style={S.sendBtn} onClick={handleSend}>
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;

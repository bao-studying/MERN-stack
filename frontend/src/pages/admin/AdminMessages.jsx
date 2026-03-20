/**
 * pages/admin/AdminMessages.jsx
 *
 * Trang /admin/messages — Messenger style 2 cột
 * Thêm route vào AdminRouter:
 *   <Route path="messages" element={<AdminMessages />} />
 * Thêm vào AdminSidebar menuItems:
 *   { path: "/admin/messages", label: "Tin nhắn", icon: <FaComments />, roles: ["admin","manager","staff"] }
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useChatSocket } from "../../hooks/useChatSocket";
import axiosClient from "../../services/axiosClient";

/* ─── STYLES ─────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

  .am-root {
    --bg:     #f5f3ef;
    --surf:   #ffffff;
    --border: #e2ded6;
    --text:   #1c1917;
    --muted:  #78716c;
    --subtle: #a8a29e;
    --accent: #c8490c;
    --font:   'DM Sans', sans-serif;
    --mono:   'DM Mono', monospace;
    height: calc(100vh - 80px);
    display: flex;
    border: 0.5px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: var(--surf);
    font-family: var(--font);
    animation: amFade .25s ease;
  }
  @keyframes amFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

  /* ── LEFT LIST ── */
  .am-list {
    width: 300px;
    flex-shrink: 0;
    border-right: 0.5px solid var(--border);
    display: flex;
    flex-direction: column;
    background: var(--surf);
  }
  .am-list-hd {
    padding: 16px;
    border-bottom: 0.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .am-list-title {
    font-size: 15px; font-weight: 600;
    color: var(--text); margin: 0; letter-spacing: -.2px;
  }
  .am-list-count {
    font-size: 11px; font-family: var(--mono);
    padding: 2px 7px; border-radius: 20px;
    border: 0.5px solid var(--border);
    color: var(--muted); background: var(--bg);
  }
  .am-list-body {
    flex: 1; overflow-y: auto;
  }
  .am-list-body::-webkit-scrollbar { width: 3px; }
  .am-list-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .am-conv-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    cursor: pointer;
    border-bottom: 0.5px solid var(--border);
    transition: background .1s;
    position: relative;
  }
  .am-conv-item:hover { background: #faf9f7; }
  .am-conv-item.active { background: #fff8f5; }
  .am-conv-item.active::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--accent);
    border-radius: 0 2px 2px 0;
  }
  .am-conv-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    border: 0.5px solid var(--border);
  }
  .am-conv-info { flex: 1; min-width: 0; }
  .am-conv-name {
    font-size: 13px; font-weight: 500;
    color: var(--text); margin: 0 0 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .am-conv-preview {
    font-size: 11px; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin: 0;
  }
  .am-conv-meta {
    display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
    flex-shrink: 0;
  }
  .am-conv-time { font-size: 10px; color: var(--subtle); font-family: var(--mono); }
  .am-unread-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
  }

  .am-list-empty {
    padding: 40px 20px; text-align: center;
    font-size: 13px; color: var(--subtle);
  }

  /* ── RIGHT CHAT ── */
  .am-chat {
    flex: 1; display: flex; flex-direction: column; min-width: 0;
    background: var(--bg);
  }

  /* Header */
  .am-chat-hd {
    padding: 12px 18px;
    background: var(--surf); border-bottom: 0.5px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0;
  }
  .am-chat-hd-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    object-fit: cover; border: 0.5px solid var(--border);
  }
  .am-chat-hd-name { font-size: 14px; font-weight: 600; color: var(--text); margin: 0 0 1px; }
  .am-chat-hd-sub  { font-size: 11px; color: var(--muted); margin: 0; }

  /* Body */
  .am-chat-body {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .am-chat-body::-webkit-scrollbar { width: 4px; }
  .am-chat-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .am-msg-row { display: flex; }
  .am-msg-row.me  { justify-content: flex-end; }
  .am-msg-row.you { justify-content: flex-start; gap: 8px; align-items: flex-end; }

  .am-msg-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    object-fit: cover; flex-shrink: 0;
    border: 0.5px solid var(--border);
  }
  .am-bubble-wrap { display: flex; flex-direction: column; max-width: 68%; }
  .am-bubble {
    padding: 9px 13px; border-radius: 14px;
    font-size: 13px; line-height: 1.5; word-break: break-word;
  }
  .am-bubble.me  {
    background: var(--accent); color: #fff;
    border-radius: 14px 14px 4px 14px;
  }
  .am-bubble.you {
    background: var(--surf); color: var(--text);
    border-radius: 14px 14px 14px 4px;
    border: 0.5px solid var(--border);
  }
  .am-bubble-time { font-size: 10px; color: var(--subtle); margin-top: 3px; }
  .am-msg-row.me  .am-bubble-time { text-align: right; }

  .am-typing-bubble {
    background: var(--surf); border: 0.5px solid var(--border);
    border-radius: 14px 14px 14px 4px;
    padding: 10px 14px; display: flex; gap: 4px; align-items: center;
  }
  .am-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--subtle);
    animation: amBounce .8s ease-in-out infinite;
  }
  .am-dot:nth-child(2) { animation-delay: .15s; }
  .am-dot:nth-child(3) { animation-delay: .30s; }
  @keyframes amBounce {
    0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
  }

  .am-empty-chat {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--subtle); font-size: 13px; gap: 8px;
  }
  .am-empty-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--border); display: flex; align-items: center;
    justify-content: center; font-size: 20px; opacity: .5;
  }

  /* Footer */
  .am-chat-footer {
    padding: 12px 16px; background: var(--surf);
    border-top: 0.5px solid var(--border);
    display: flex; gap: 10px; align-items: flex-end;
    flex-shrink: 0;
  }
  .am-footer-input {
    flex: 1; padding: 9px 14px;
    border: 0.5px solid var(--border); border-radius: 20px;
    font-size: 13px; font-family: var(--font);
    color: var(--text); outline: none; resize: none;
    background: var(--bg); line-height: 1.5;
    max-height: 100px; overflow-y: auto;
    transition: border-color .15s;
  }
  .am-footer-input:focus { border-color: var(--accent); }
  .am-footer-send {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--accent); border: none; color: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
    transition: background .12s, transform .1s;
  }
  .am-footer-send:hover  { background: #a83a08; }
  .am-footer-send:active { transform: scale(.95); }
  .am-footer-send:disabled { opacity: .4; cursor: not-allowed; }
`;

/* ─── HELPER ─────────────────────────────────────────────────── */
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

/* ─── MAIN ───────────────────────────────────────────────────── */
const AdminMessages = () => {
  const { user, token } = useAuth();
  const myId = user?.id || user?._id;

  const [convs, setConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [loadingHist, setLoadingHist] = useState(false);

  const bodyRef = useRef(null);
  const typingTimer = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current)
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 50);
  }, []);

  /* ── Socket ── */
  const handleNewMessage = useCallback(
    ({ message, conversation }) => {
      // Cập nhật lastMessage trong danh sách
      setConvs((prev) =>
        prev
          .map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );
      // Nếu đang xem đúng conversation này thì thêm tin vào
      setActiveConv((cur) => {
        if (cur?._id === conversation._id) {
          setMsgs((prev) => {
            if (prev.find((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
          scrollToBottom();
        }
        return cur;
      });
    },
    [scrollToBottom],
  );

  const handleTyping = useCallback(
    ({ conversationId }) => {
      if (activeConv?._id === conversationId) setOtherTyping(true);
    },
    [activeConv],
  );

  const handleStopTyping = useCallback(
    ({ conversationId }) => {
      if (activeConv?._id === conversationId) setOtherTyping(false);
    },
    [activeConv],
  );

  const { sendMessage, emitTyping, emitStopTyping } = useChatSocket({
    token,
    onNewMessage: handleNewMessage,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
  });

  /* ── Load danh sách conversations ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get("/chat/admin/conversations");
        if (res.success) setConvs(res.conversations);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* ── Chọn conversation ── */
  const handleSelectConv = async (conv) => {
    setActiveConv(conv);
    setMsgs([]);
    setOtherTyping(false);
    setLoadingHist(true);
    try {
      const res = await axiosClient.get(`/chat/messages/${conv._id}`);
      if (res.success) setMsgs(res.messages);
      scrollToBottom();
      // Đánh dấu đã đọc
      await axiosClient.put(`/chat/admin/conversations/${conv._id}/seen`);
      setConvs((prev) =>
        prev.map((c) =>
          c._id === conv._id
            ? { ...c, lastMessage: { ...c.lastMessage, seenByAdmin: true } }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHist(false);
    }
  };

  /* ── Gửi tin ── */
  const handleSend = () => {
    if (!text.trim() || !activeConv) return;
    const customer = activeConv.participants?.find((p) => p._id !== myId);
    sendMessage({ conversationId: activeConv._id, text });
    setText("");
    clearTimeout(typingTimer.current);
    if (customer)
      emitStopTyping({
        conversationId: activeConv._id,
        toUserId: customer._id,
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!activeConv) return;
    const customer = activeConv.participants?.find((p) => p._id !== myId);
    if (!customer) return;
    emitTyping({ conversationId: activeConv._id, toUserId: customer._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitStopTyping({
        conversationId: activeConv._id,
        toUserId: customer._id,
      });
    }, 2000);
  };

  /* ── Customer info helper ── */
  const getCustomer = (conv) =>
    conv?.participants?.find((p) => p._id !== myId) || {};

  /* ─── RENDER ───────────────────────────────────────────────── */
  return (
    <div className="am-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── LEFT: conversation list ── */}
      <div className="am-list">
        <div className="am-list-hd">
          <p className="am-list-title">Tin nhắn</p>
          <span className="am-list-count">{convs.length}</span>
        </div>

        <div className="am-list-body">
          {convs.length === 0 ? (
            <div className="am-list-empty">Chưa có hội thoại nào</div>
          ) : (
            convs.map((conv) => {
              const customer = getCustomer(conv);
              const isActive = activeConv?._id === conv._id;
              const hasUnread =
                !conv.lastMessage?.seenByAdmin &&
                conv.lastMessage?.senderId !== myId;

              return (
                <div
                  key={conv._id}
                  className={`am-conv-item${isActive ? " active" : ""}`}
                  onClick={() => handleSelectConv(conv)}
                >
                  <img
                    src={customer.avatarUrl || "https://via.placeholder.com/40"}
                    alt={customer.name}
                    className="am-conv-avatar"
                  />
                  <div className="am-conv-info">
                    <p className="am-conv-name">
                      {customer.name || "Khách vãng lai"}
                    </p>
                    <p className="am-conv-preview">
                      {conv.lastMessage?.text || "Bắt đầu hội thoại"}
                    </p>
                  </div>
                  <div className="am-conv-meta">
                    <span className="am-conv-time">
                      {new Date(conv.updatedAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    {hasUnread && <div className="am-unread-dot" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: chat window ── */}
      <div className="am-chat">
        {!activeConv ? (
          <div className="am-empty-chat">
            <div className="am-empty-icon">💬</div>
            <span>Chọn một hội thoại để bắt đầu</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="am-chat-hd">
              {(() => {
                const c = getCustomer(activeConv);
                return (
                  <>
                    <img
                      src={c.avatarUrl || "https://via.placeholder.com/36"}
                      alt={c.name}
                      className="am-chat-hd-avatar"
                    />
                    <div>
                      <p className="am-chat-hd-name">
                        {c.name || "Khách vãng lai"}
                      </p>
                      <p className="am-chat-hd-sub">
                        {otherTyping ? "Đang nhập..." : c.email || ""}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Body */}
            <div ref={bodyRef} className="am-chat-body">
              {loadingHist && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#a8a29e",
                    fontSize: 12,
                    padding: 16,
                  }}
                >
                  Đang tải lịch sử...
                </div>
              )}

              {msgs.map((msg) => {
                const isMe = msg.sender?._id === myId || msg.sender === myId;
                return (
                  <div
                    key={msg._id}
                    className={`am-msg-row ${isMe ? "me" : "you"}`}
                  >
                    {!isMe && (
                      <img
                        src={
                          msg.sender?.avatarUrl ||
                          "https://via.placeholder.com/26"
                        }
                        alt=""
                        className="am-msg-avatar"
                      />
                    )}
                    <div className="am-bubble-wrap">
                      <div className={`am-bubble ${isMe ? "me" : "you"}`}>
                        {msg.text}
                      </div>
                      <div className="am-bubble-time">
                        {fmtTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {otherTyping && (
                <div className="am-msg-row you">
                  <img
                    src={
                      getCustomer(activeConv).avatarUrl ||
                      "https://via.placeholder.com/26"
                    }
                    alt=""
                    className="am-msg-avatar"
                  />
                  <div className="am-typing-bubble">
                    <div className="am-dot" />
                    <div className="am-dot" />
                    <div className="am-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="am-chat-footer">
              <textarea
                className="am-footer-input"
                rows={1}
                placeholder="Nhập tin nhắn... (Enter để gửi)"
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button
                className="am-footer-send"
                onClick={handleSend}
                disabled={!text.trim()}
              >
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;

/**
 * hooks/useChatSocket.js
 * Quản lý kết nối Socket bằng cách lấy Token từ state hoặc trực tiếp từ currentUser trong LocalStorage
 */
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useChatSocket = ({
  token, // Token từ AuthContext
  onNewMessage,
  onTyping,
  onStopTyping,
}) => {
  const socketRef = useRef(null);

  // 1. Hàm bổ trợ: Tìm mọi cách để lấy được Token (từ state hoặc từ LocalStorage)
  const getActiveToken = useCallback(() => {
    if (token) return token;

    const rawUser = localStorage.getItem("currentUser");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        // Vì trong log của Bảo không có 'token', mình dùng tạm '_id'
        // để xem Server có chịu nhận diện không nhé.
        return parsed.token || parsed.accessToken || parsed._id;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [token]);

  const activeToken = getActiveToken();

  /* ── 2. Kết nối Socket khi có activeToken ── */
  useEffect(() => {
    if (!activeToken) {
      console.warn(
        "[Socket] Không tìm thấy token trong máy, chưa thể kết nối.",
      );
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: activeToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Kết nối thành công! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Lỗi kết nối:", err.message);
    });

    /* Nhận tin nhắn mới */
    socket.on("new_message", (payload) => {
      onNewMessage?.(payload);
    });

    /* Typing indicators */
    socket.on("user_typing", (data) => onTyping?.(data));
    socket.on("user_stop_typing", (data) => onStopTyping?.(data));

    return () => {
      console.log("[Socket] Đang ngắt kết nối...");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeToken, onNewMessage, onTyping, onStopTyping]);

  /* ── 3. Các hàm gửi dữ liệu ── */
  const sendMessage = useCallback(({ conversationId, text }, callback) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.error("[Socket] Chưa kết nối, không thể gửi tin.");
      return;
    }
    socketRef.current.emit("send_message", { conversationId, text }, callback);
  }, []);

  const emitTyping = useCallback(({ conversationId, toUserId }) => {
    socketRef.current?.emit("typing", { conversationId, toUserId });
  }, []);

  const emitStopTyping = useCallback(({ conversationId, toUserId }) => {
    socketRef.current?.emit("stop_typing", { conversationId, toUserId });
  }, []);

  return { sendMessage, emitTyping, emitStopTyping };
};

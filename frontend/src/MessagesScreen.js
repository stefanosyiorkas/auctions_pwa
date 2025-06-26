import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api/messages";

export default function MessagesScreen() {
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Fetch all messages (inbox + sent)
        const [inboxRes, sentRes] = await Promise.all([
          fetch(`${API_BASE}/inbox`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch(`${API_BASE}/sent`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);
        const inboxData = await inboxRes.json();
        const sentData = await sentRes.json();
        // Build conversation map: { auctionId, otherUser, lastMessage, unreadCount }
        const map = new Map();
        const currentUser = localStorage.getItem("username") || "";
        const all = [...inboxData, ...sentData];
        all.forEach((msg) => {
          const otherUser =
            msg.sender === currentUser ? msg.recipient : msg.sender;
          const key = `${msg.auctionId}|${otherUser}`;
          if (!map.has(key)) {
            map.set(key, {
              auctionId: msg.auctionId,
              otherUser,
              lastMessage: msg,
              unreadCount: 0,
            });
          }
          // Count unread only for inbox messages
          if (!msg.isRead && msg.recipient === currentUser) {
            map.get(key).unreadCount++;
          }
          // Update lastMessage if newer
          if (msg.timestamp > map.get(key).lastMessage.timestamp) {
            map.get(key).lastMessage = msg;
          }
        });
        setConversations(
          Array.from(map.values()).sort((a, b) =>
            b.lastMessage.timestamp.localeCompare(a.lastMessage.timestamp)
          )
        );
        setNewCount(
          Array.from(map.values()).reduce((sum, c) => sum + c.unreadCount, 0)
        );
      } catch (err) {
        toast.error("Failed to fetch conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="fw-bold mb-4">Messages</h2>
      {loading ? (
        <div>Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div>No conversations.</div>
      ) : (
        <ul className="list-group">
          {conversations.map((conv) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center list-group-item-action"
              key={conv.auctionId + "|" + conv.otherUser}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/messages/compose/${conv.otherUser}/${conv.auctionId}`
                )
              }
            >
              <div>
                <b>{conv.otherUser}</b>{" "}
                <span className="text-muted small">
                  Auction #{conv.auctionId}
                </span>
                <div>{conv.lastMessage.content}</div>
                <div className="small text-muted">
                  {conv.lastMessage.timestamp}
                </div>
              </div>
              {conv.unreadCount > 0 && (
                <span className="badge bg-danger ms-1">{conv.unreadCount}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

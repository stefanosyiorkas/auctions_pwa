import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api/messages";

export default function MessagesScreen() {
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
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
        setInbox(
          inboxData.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        );
        setSent(
          sentData.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        );
      } catch (err) {
        toast.error("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  const renderMessages = (messages, isInbox) => (
    <ul className="list-group">
      {messages.map((msg) => (
        <li
          className="list-group-item d-flex justify-content-between align-items-center list-group-item-action"
          key={msg.id}
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(
              `/messages/compose/${isInbox ? msg.sender : msg.recipient}/${
                msg.auctionId
              }`
            )
          }
        >
          <div>
            <b>{isInbox ? msg.sender : msg.recipient}</b>{" "}
            <span className="text-muted small">Auction #{msg.auctionId}</span>
            <div>{msg.content}</div>
            <div className="small text-muted">{msg.timestamp}</div>
          </div>
          {isInbox && !msg.isRead && (
            <span className="badge bg-danger ms-1">New</span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="fw-bold mb-4">Messages</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link${activeTab === "inbox" ? " active" : ""}`}
            onClick={() => setActiveTab("inbox")}
          >
            Inbox
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link${activeTab === "sent" ? " active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent
          </button>
        </li>
      </ul>
      {loading ? (
        <div>Loading messages...</div>
      ) : activeTab === "inbox" ? (
        inbox.length === 0 ? (
          <div>No inbox messages.</div>
        ) : (
          renderMessages(inbox, true)
        )
      ) : sent.length === 0 ? (
        <div>No sent messages.</div>
      ) : (
        renderMessages(sent, false)
      )}
    </div>
  );
}

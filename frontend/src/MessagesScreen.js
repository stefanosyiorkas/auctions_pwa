import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api/messages";

export default function MessagesScreen() {
  const [tab, setTab] = useState("inbox");
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [tab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (tab === "inbox") {
        const res = await fetch(`${API_BASE}/inbox`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data = await res.json();
        setInbox(data);
        setNewCount(data.filter((m) => !m.isRead).length);
      } else {
        const res = await fetch(`${API_BASE}/sent`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data = await res.json();
        setSent(data);
      }
    } catch (err) {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchMessages();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="fw-bold mb-4">Messages</h2>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link${tab === "inbox" ? " active" : ""}`} onClick={() => setTab("inbox")}>Inbox {newCount > 0 && <span className="badge bg-danger ms-1">{newCount}</span>}</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link${tab === "sent" ? " active" : ""}`} onClick={() => setTab("sent")}>Sent</button>
        </li>
      </ul>
      {loading ? (
        <div>Loading messages...</div>
      ) : tab === "inbox" ? (
        <ul className="list-group">
          {inbox.length === 0 && <li className="list-group-item">No messages.</li>}
          {inbox.map((msg) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center list-group-item-action"
              key={msg.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/messages/compose/${msg.sender}/${msg.auctionId}`)}
            >
              <div>
                <b>From:</b> {msg.sender} <span className="text-muted small">Auction #{msg.auctionId}</span>
                <div>{msg.content}</div>
                <div className="small text-muted">{msg.timestamp}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); handleDelete(msg.id); }}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="list-group">
          {sent.length === 0 && <li className="list-group-item">No messages.</li>}
          {sent.map((msg) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center list-group-item-action"
              key={msg.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/messages/compose/${msg.recipient}/${msg.auctionId}`)}
            >
              <div>
                <b>To:</b> {msg.recipient} <span className="text-muted small">Auction #{msg.auctionId}</span>
                <div>{msg.content}</div>
                <div className="small text-muted">{msg.timestamp}</div>
              </div>
              <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); handleDelete(msg.id); }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

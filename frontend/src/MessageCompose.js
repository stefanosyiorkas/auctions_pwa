import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const API_BASE = "/api/messages";

export default function AuctionChat() {
  const { recipient, auctionId } = useParams();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [canSend, setCanSend] = useState(false);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Helper to get cookie value by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }
  const currentUser = getCookie("username");

  // Fetch conversation
  useEffect(() => {
    fetchMessages();
    // Optionally, poll for new messages every 10s
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [recipient, auctionId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/thread?auctionId=${auctionId}&user=${recipient}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setMessages([]);
    } finally {
      setLoading(false);
      // Scroll to bottom
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }
  };

  // Fetch auction details and bids
  useEffect(() => {
    const fetchAuctionAndBids = async () => {
      try {
        const auctionRes = await fetch(`/api/auctions/${auctionId}`);
        if (!auctionRes.ok) throw new Error("Failed to fetch auction");
        const auctionData = await auctionRes.json();
        setAuction(auctionData);
        const bidsRes = await fetch(`/api/auctions/${auctionId}/bids`);
        if (!bidsRes.ok) throw new Error("Failed to fetch bids");
        const bidsData = await bidsRes.json();
        setBids(bidsData);
        // Check if auction is closed
        let endsDate;
        if (auctionData.ends) {
          if (/Z$|[+-]\d{2}:?\d{2}$/.test(auctionData.ends)) {
            endsDate = new Date(auctionData.ends);
          } else if (
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(auctionData.ends)
          ) {
            endsDate = new Date(auctionData.ends + "Z");
          } else {
            endsDate = new Date(auctionData.ends);
          }
        }
        const isClosed = endsDate && Date.now() > endsDate.getTime();
        // Find winner and seller
        let winnerUsername = null;
        if (isClosed && bidsData.length > 0) {
          let maxBid = bidsData[0];
          bidsData.forEach((b) => {
            if (b.amount > maxBid.amount) maxBid = b;
          });
          winnerUsername = maxBid.bidderUsername;
        }
        const sellerUsername = auctionData.sellerUserId;
        // Allow both winner and seller to message each other after auction ends
        const isWinner = currentUser === winnerUsername;
        const isSeller = currentUser === sellerUsername;
        const validDirection =
          (isWinner && recipient === sellerUsername) ||
          (isSeller && recipient === winnerUsername);
        setCanSend(isClosed && winnerUsername && validDirection);
      } catch (err) {
        setCanSend(false);
      }
    };
    fetchAuctionAndBids();
    // eslint-disable-next-line
  }, [auctionId, currentUser]);

  // Mark all unread messages as read when viewing the chat
  useEffect(() => {
    const markAllAsRead = async () => {
      const token = localStorage.getItem("token");
      for (const msg of messages) {
        if (!msg.isRead && msg.recipient === currentUser) {
          await fetch(`/api/messages/${msg.id}/read`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        }
      }
    };
    if (messages.length > 0) markAllAsRead();
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    return () => {
      toast.dismiss(); // Clear all toasts on unmount
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          recipient,
          auctionId: Number(auctionId),
          content,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to send message");
        setSending(false);
        return;
      }
      setContent("");
      fetchMessages(); // Don't await, so toast shows immediately
      toast.success("Message sent!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="fw-bold mb-4">Auction Chat</h2>
      <div className="card mb-3" style={{ maxHeight: 400, overflowY: "auto" }}>
        <div className="card-body p-3">
          {loading ? (
            <div>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-muted">No messages yet.</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 d-flex ${
                  msg.sender === currentUser
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded ${
                    msg.sender === currentUser
                      ? "bg-primary text-white"
                      : "bg-light border"
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  <div className="small fw-bold mb-1">
                    {msg.sender === currentUser ? "You" : msg.sender}
                  </div>
                  <div>{msg.content}</div>
                  <div className="small text-end text-muted mt-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <form onSubmit={handleSend} className="d-flex gap-2">
        <textarea
          className="form-control"
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={sending || !canSend}
          placeholder={
            canSend
              ? "Type your message..."
              : "You can only message the seller if you are the winner and the auction has ended."
          }
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={sending || !content || !canSend}
        >
          Send
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => navigate(-1)}
          disabled={sending}
        >
          Back
        </button>
      </form>
      {!canSend && (
        <div className="alert alert-warning mt-3">
          You can only message the other party if you are the winner or seller
          and the auction has ended.
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "/api/auctions";

export default function AuctionDetails({ isAuthenticated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchAuction();
    fetchBids();
    // eslint-disable-next-line
  }, [id]);

  const fetchAuction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch auction");
      const data = await res.json();
      setAuction(data);
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const res = await fetch(`${API_BASE}/${id}/bids`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBids(data);
    } catch {
      setBids([]);
    }
  };

  const getCurrentPrice = () => {
    if (!auction) return 0;
    let price = auction.startingPrice || 0;
    bids.forEach((b) => {
      if (b.amount > price) price = b.amount;
    });
    return price;
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const currentPrice = getCurrentPrice();
    if (parseFloat(bidAmount) <= currentPrice) {
      toast.error("Bid must be higher than current price");
      return;
    }
    setShowConfirm(true);
  };

  const confirmBid = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/${id}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: bidAmount }),
      });
      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to submit bid");
        setSubmitting(false);
        setShowConfirm(false);
        return;
      }
      toast.success("Bid submitted successfully!");
      setBidAmount("");
      setShowConfirm(false);
      await fetchBids();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to check if auction is expired
  const isAuctionClosed = () => {
    if (!auction || !auction.ends) return false;
    let endsDate;
    try {
      if (/Z$|[+-]\d{2}:?\d{2}$/.test(auction.ends)) {
        // Already has timezone info
        endsDate = new Date(auction.ends);
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(auction.ends)) {
        // No timezone, treat as UTC
        endsDate = new Date(auction.ends + "Z");
      } else {
        // Fallback: try native parsing
        endsDate = new Date(auction.ends);
      }
      // Debug info for troubleshooting end time parsing
      console.log(
        "[DEBUG] AuctionDetails:",
        auction.id,
        "ends:",
        auction.ends,
        "parsed:",
        endsDate,
        "now:",
        new Date(),
        "isClosed:",
        Date.now() > endsDate.getTime()
      );
      return Date.now() > endsDate.getTime();
    } catch {
      return false;
    }
  };

  // Helper to get cookie value by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Get current user from cookies (assumes username is stored in cookie after login)
  const currentUser = getCookie("username");
  const isOwnAuction =
    auction && currentUser && auction.sellerUserId === currentUser;

  // Find winner after auction ends
  const getWinnerUsername = () => {
    if (!isAuctionClosed() || bids.length === 0) return null;
    let maxBid = null;
    bids.forEach((b) => {
      if (!maxBid || b.amount > maxBid.amount) maxBid = b;
    });
    return maxBid ? maxBid.bidderUsername : null;
  };

  const winnerUsername = getWinnerUsername();
  const canContactSeller =
    isAuctionClosed() && winnerUsername && currentUser === winnerUsername;

  if (loading)
    return <div className="container py-5">Loading auction details...</div>;
  if (!auction) return <div className="container py-5">Auction not found.</div>;

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" autoClose={3000} />
      <button className="btn btn-link mb-3" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <div className="card shadow-sm mb-4 position-relative">
        {isAuctionClosed() && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              background: "#dc3545",
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              padding: "0.5rem",
              borderTopLeftRadius: "0.5rem",
              borderTopRightRadius: "0.5rem",
              zIndex: 2,
            }}
          >
            CLOSED
          </div>
        )}
        <div
          className="card-body"
          style={{ paddingTop: isAuctionClosed() ? "2.5rem" : undefined }}
        >
          <h2 className="fw-bold mb-2">{auction.name}</h2>
          <div className="mb-2 text-muted small">
            Categories:{" "}
            {Array.isArray(auction.categories)
              ? auction.categories.join(", ")
              : auction.categories}
          </div>
          <div>
            Current Price: <b>{getCurrentPrice()}</b>
          </div>
          <div>
            Location: {auction.location}, {auction.country}
          </div>
          <div>Seller: {auction.sellerUserId}</div>
          <div className="mt-2">{auction.description}</div>
          <div className="mt-2 small text-muted">
            Started: {auction.started} | Ends: {auction.ends}
          </div>
        </div>
      </div>
      <h4>Bids</h4>
      {bids.length === 0 ? (
        <div className="mb-4">No bids yet.</div>
      ) : (
        <ul className="list-group mb-4">
          {bids.map((bid) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center"
              key={bid.id}
            >
              <span>Bidder: {bid.bidderUsername}</span>
              <span>
                Amount: <b>{bid.amount}</b>
              </span>
              <span className="text-muted small">{bid.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
      {isAuthenticated && !isAuctionClosed() && !isOwnAuction ? (
        <div className="mb-4">
          <h5>Submit a Bid</h5>
          <form
            onSubmit={handleBidSubmit}
            className="row g-2 align-items-center"
          >
            <div className="col-auto">
              <input
                type="number"
                className="form-control"
                placeholder="Your bid amount"
                value={bidAmount}
                min={getCurrentPrice() + 0.01}
                step="0.01"
                onChange={(e) => setBidAmount(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className="col-auto">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !bidAmount}
              >
                Submit Bid
              </button>
            </div>
          </form>
          {showConfirm && (
            <div className="alert alert-warning mt-3">
              <div>
                Are you sure you want to submit this bid? This action cannot be
                undone.
              </div>
              <button
                className="btn btn-success me-2 mt-2"
                onClick={confirmBid}
                disabled={submitting}
              >
                Yes, Submit
              </button>
              <button
                className="btn btn-secondary mt-2"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : isAuctionClosed() ? (
        <div className="alert alert-secondary">
          Bidding is closed for this auction.
        </div>
      ) : isOwnAuction ? (
        <div className="alert alert-warning">
          You cannot bid on your own auction.
        </div>
      ) : (
        <div className="alert alert-info">
          You must be logged in to submit a bid. Please log in or register.
        </div>
      )}
      {canContactSeller && (
        <div className="mb-4">
          <button
            className="btn btn-success"
            onClick={() =>
              navigate(
                `/messages/compose/${auction.sellerUserId}/${auction.id}`
              )
            }
          >
            Contact Seller
          </button>
        </div>
      )}
    </div>
  );
}

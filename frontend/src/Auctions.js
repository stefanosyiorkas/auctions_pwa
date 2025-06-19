import React, { useState, useEffect } from "react";
import AuctionForm from "./AuctionForm";
import { useNavigate } from "react-router-dom";
import { fetchBidsForAuction } from "./apiService";
import { ToastContainer } from "react-toastify";

// Helper to get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
const currentUser = getCookie("username");
const API_BASE = "/api/auctions";

export default function Auctions({ canCreate }) {
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auctionPrices, setAuctionPrices] = useState({});
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [auctionBids, setAuctionBids] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const fetchAllBids = async () => {
      const prices = {};
      const bidsMap = {};
      await Promise.all(
        auctions.map(async (auction) => {
          try {
            const bids = await fetchBidsForAuction(auction.id);
            let price = auction.startingPrice || 0;
            bids.forEach((b) => {
              if (b.amount > price) price = b.amount;
            });
            prices[auction.id] = price;
            bidsMap[auction.id] = bids;
          } catch {
            prices[auction.id] = auction.startingPrice || 0;
            bidsMap[auction.id] = [];
          }
        })
      );
      setAuctionPrices(prices);
      setAuctionBids(bidsMap);
    };
    if (auctions.length > 0) fetchAllBids();
  }, [auctions]);

  useEffect(() => {
    if (currentUser) fetchNewMsgCount();
    // Optionally, poll for new messages every 30s
    const interval = setInterval(() => {
      if (currentUser) fetchNewMsgCount();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  const fetchNewMsgCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/messages/inbox", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      setNewMsgCount(data.filter((m) => !m.isRead).length);
    } catch {}
  };

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch auctions");
      const data = await res.json();
      setAuctions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter((a) => {
    const nameMatch = a.name?.toLowerCase().includes(search.toLowerCase());
    let categoriesText = "";
    if (Array.isArray(a.categories)) {
      categoriesText = a.categories.join(", ");
    } else if (typeof a.categories === "string") {
      categoriesText = a.categories;
    }
    const categoryMatch = categoriesText
      .toLowerCase()
      .includes(search.toLowerCase());
    return nameMatch || categoryMatch;
  });

  const handleCreateAuction = async (auction) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(auction),
      });
      if (!res.ok) throw new Error("Failed to create auction");
      await fetchAuctions();
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Auctions</h2>
        <div className="d-flex gap-2 align-items-center">
          {currentUser && (
            <button
              className="btn btn-outline-info position-relative"
              onClick={() => navigate("/messages")}
            >
              Messages
              {newMsgCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {newMsgCount}
                </span>
              )}
            </button>
          )}
          {canCreate && (
            <button
              className="btn btn-success"
              onClick={() => setShowForm((f) => !f)}
            >
              {showForm ? "Cancel" : "Create Auction"}
            </button>
          )}
        </div>
      </div>
      {showForm && canCreate && (
        <div className="mb-4">
          <AuctionForm onSubmit={handleCreateAuction} />
        </div>
      )}
      <div className="mb-4">
        <input
          className="form-control form-control-lg"
          placeholder="Search auctions by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Loading auctions...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <div className="row g-4">
          {filteredAuctions.length === 0 && (
            <div className="col-12 text-center">No auctions found.</div>
          )}
          {filteredAuctions.map((auction) => {
            // Robustly parse auction.ends for timezone issues
            let endsDate;
            if (auction.ends) {
              if (/Z$|[+-]\d{2}:?\d{2}$/.test(auction.ends)) {
                // Already has timezone info
                endsDate = new Date(auction.ends);
              } else if (
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(auction.ends)
              ) {
                // No timezone, treat as UTC
                endsDate = new Date(auction.ends + "Z");
              } else {
                // Fallback: try native parsing
                endsDate = new Date(auction.ends);
              }
            }
            const isClosed = endsDate && Date.now() > endsDate.getTime();
            // Find winner username using auctionBids
            let winnerUsername = null;
            const bids = auctionBids[auction.id] || [];
            if (isClosed && bids.length > 0) {
              let maxBid = bids[0];
              bids.forEach((b) => {
                if (b.amount > maxBid.amount) maxBid = b;
              });
              winnerUsername = maxBid.bidderUsername;
            }
            // Debug info for troubleshooting end time parsing
            if (auction.ends) {
              console.log(
                "[DEBUG] Auction:",
                auction.id,
                "ends:",
                auction.ends,
                "parsed:",
                endsDate,
                "now:",
                new Date(),
                "isClosed:",
                isClosed,
                "winner:",
                winnerUsername
              );
            }
            return (
              <div className="col-md-6 col-lg-4" key={auction.id}>
                <div className="card h-100 shadow-sm position-relative">
                  {isClosed && (
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
                  {/* Winner badge */}
                  {isClosed &&
                    winnerUsername &&
                    currentUser &&
                    winnerUsername === currentUser && (
                      <span
                        style={{
                          position: "absolute",
                          top: isClosed ? "2.2rem" : "0.5rem",
                          right: "0.5rem",
                          background: "#198754",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "1rem",
                          fontWeight: "bold",
                          zIndex: 3,
                          fontSize: "0.95rem",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        You Won
                      </span>
                    )}
                  <div
                    className="card-body"
                    style={{ paddingTop: isClosed ? "2.5rem" : undefined }}
                  >
                    <h5 className="card-title fw-bold">{auction.name}</h5>
                    <div className="mb-2 text-muted small">
                      Categories:{" "}
                      {Array.isArray(auction.categories)
                        ? auction.categories.join(", ")
                        : auction.categories}
                    </div>
                    <div>
                      Current Price:{" "}
                      <b>
                        {auctionPrices[auction.id] ??
                          auction.startingPrice ??
                          "-"}
                      </b>
                    </div>
                    <div>
                      Location: {auction.location}, {auction.country}
                    </div>
                    <div>Seller: {auction.sellerUserId}</div>
                    <div className="mt-2">{auction.description}</div>
                    <div className="mt-2 small text-muted">
                      Started: {auction.started} | Ends: {auction.ends}
                    </div>
                    <button
                      className="btn btn-outline-primary mt-3"
                      onClick={() => navigate(`/auctions/${auction.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api/auctions";

export default function ManageAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE + "/my", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch your auctions");
      const data = await res.json();
      setAuctions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Only allow delete if auction has not started
  const canDelete = (auction) => !auction.started;

  const handleDelete = async () => {
    if (selected.length === 0) return;
    // Check if any selected auction cannot be deleted
    const undeletable = auctions.filter((a) => selected.includes(a.id) && !canDelete(a));
    if (undeletable.length > 0) {
      alert("You cannot delete auctions that have started.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete the selected auction(s)?")) return;
    try {
      const token = localStorage.getItem("token");
      for (const id of selected) {
        await fetch(`${API_BASE}/${id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      }
      setSelected([]);
      await fetchMyAuctions();
    } catch (err) {
      alert("Failed to delete auction(s)");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Manage My Auctions</h2>
      <button
        className="btn btn-danger mb-3"
        onClick={handleDelete}
        disabled={selected.length === 0}
      >
        Delete Selected
      </button>
      {loading ? (
        <div>Loading your auctions...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <div className="row g-4">
          {auctions.length === 0 && <div className="col-12 text-center">No auctions found.</div>}
          {auctions.map((auction) => (
            <div className="col-md-6 col-lg-4" key={auction.id}>
              <div className={`card h-100 shadow-sm${selected.includes(auction.id) ? " border-danger" : ""}`}>
                <div className="card-body">
                  <div className="form-check float-end">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selected.includes(auction.id)}
                      onChange={() => handleSelect(auction.id)}
                      id={`select-auction-${auction.id}`}
                    />
                  </div>
                  <h5 className="card-title fw-bold">{auction.name}</h5>
                  <div className="mb-2 text-muted small">
                    Categories: {Array.isArray(auction.categories) ? auction.categories.join(", ") : auction.categories}
                  </div>
                  <div>Current Price: <b>{auction.startingPrice ?? '-'}</b></div>
                  <div>Location: {auction.location}, {auction.country}</div>
                  <div>Seller: {auction.sellerUserId}</div>
                  <div className="mt-2">{auction.description}</div>
                  <div className="mt-2 small text-muted">Started: {auction.started} | Ends: {auction.ends}</div>
                  <button className="btn btn-outline-primary mt-3" onClick={() => navigate(`/auctions/${auction.id}`)}>
                    View Details
                  </button>
                  {!canDelete(auction) && (
                    <div className="text-success fw-bold mt-2">Auction active</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

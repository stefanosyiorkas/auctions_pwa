import React, { useState, useEffect } from "react";
import AuctionForm from "./AuctionForm";
import { useNavigate } from "react-router-dom";
import { fetchBidsForAuction } from "./apiService";

const API_BASE = "/api/auctions";

export default function Auctions({ canCreate }) {
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auctionPrices, setAuctionPrices] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    const fetchAllBids = async () => {
      const prices = {};
      await Promise.all(
        auctions.map(async (auction) => {
          try {
            const bids = await fetchBidsForAuction(auction.id);
            let price = auction.startingPrice || 0;
            bids.forEach((b) => {
              if (b.amount > price) price = b.amount;
            });
            prices[auction.id] = price;
          } catch {
            prices[auction.id] = auction.startingPrice || 0;
          }
        })
      );
      setAuctionPrices(prices);
    };
    if (auctions.length > 0) fetchAllBids();
  }, [auctions]);

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
    const categoryMatch = categoriesText.toLowerCase().includes(search.toLowerCase());
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
        {canCreate && (
          <button className="btn btn-success" onClick={() => setShowForm((f) => !f)}>
            {showForm ? "Cancel" : "Create Auction"}
          </button>
        )}
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
          {filteredAuctions.length === 0 && <div className="col-12 text-center">No auctions found.</div>}
          {filteredAuctions.map((auction) => {
            const isClosed = auction.ends && new Date() > new Date(auction.ends);
            return (
              <div className="col-md-6 col-lg-4" key={auction.id}>
                <div className="card h-100 shadow-sm position-relative">
                  {isClosed && (
                    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', background: '#dc3545', color: 'white', textAlign: 'center', fontWeight: 'bold', padding: '0.5rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem', zIndex: 2}}>
                      CLOSED
                    </div>
                  )}
                  <div className="card-body" style={{paddingTop: isClosed ? '2.5rem' : undefined}}>
                    <h5 className="card-title fw-bold">{auction.name}</h5>
                    <div className="mb-2 text-muted small">
                      Categories: {Array.isArray(auction.categories) ? auction.categories.join(", ") : auction.categories}
                    </div>
                    <div>Current Price: <b>{auctionPrices[auction.id] ?? auction.startingPrice ?? '-'}</b></div>
                    <div>Location: {auction.location}, {auction.country}</div>
                    <div>Seller: {auction.sellerUserId}</div>
                    <div className="mt-2">{auction.description}</div>
                    <div className="mt-2 small text-muted">Started: {auction.started} | Ends: {auction.ends}</div>
                    <button className="btn btn-outline-primary mt-3" onClick={() => navigate(`/auctions/${auction.id}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

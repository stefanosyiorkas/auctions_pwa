import React from "react";
import { useNavigate } from "react-router-dom";
import AuctionForm from "./AuctionForm";

const API_BASE = "/api/auctions";

export default function CreateAuction() {
  const navigate = useNavigate();
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
      const data = await res.json();
      navigate(`/auctions/${data.id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Create Auction</h2>
      <AuctionForm onSubmit={handleCreateAuction} />
    </div>
  );
}

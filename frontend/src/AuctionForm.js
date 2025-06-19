import React, { useState } from "react";

export default function AuctionForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    categories: "",
    startingPrice: "",
    started: "",
    ends: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert startingPrice to number
    onSubmit({ ...form, startingPrice: parseFloat(form.startingPrice) });
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-md-6">
        <input name="name" className="form-control" placeholder="Name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="col-md-6">
        <input name="categories" className="form-control" placeholder="Categories (comma separated)" value={form.categories} onChange={handleChange} required />
      </div>
      <div className="col-md-6">
        <input name="startingPrice" type="number" step="0.01" min="0" className="form-control" placeholder="Starting Price" value={form.startingPrice} onChange={handleChange} required />
      </div>
      <div className="col-md-3">
        <input name="started" type="datetime-local" className="form-control" placeholder="Start Date" value={form.started} onChange={handleChange} required />
      </div>
      <div className="col-md-3">
        <input name="ends" type="datetime-local" className="form-control" placeholder="End Date" value={form.ends} onChange={handleChange} required />
      </div>
      <div className="col-12">
        <textarea name="description" className="form-control" placeholder="Description" value={form.description} onChange={handleChange} required />
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-success w-100">Create Auction</button>
      </div>
    </form>
  );
}

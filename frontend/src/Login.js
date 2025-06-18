import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login({ onGuest }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
      } else {
        toast.error("Invalid username or password");
      }
    } catch (err) {
      toast.error("Login failed. Please try again later.");
    }
  };

  const handleGuest = (e) => {
    e.preventDefault();
    if (onGuest) onGuest();
    toast.info("Continuing as guest");
    // Optionally, set a guest flag in localStorage or context here
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4">
        <h2 className="mb-4 text-center fw-bold">Login</h2>
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-lg rounded-3"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control form-control-lg rounded-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-100 rounded-3 shadow-sm fw-semibold mb-2">
          Login
        </button>
        <button onClick={handleGuest} className="btn btn-outline-secondary btn-lg w-100 rounded-3 shadow-sm fw-semibold" type="button">
          Continue as Guest
        </button>
      </form>
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

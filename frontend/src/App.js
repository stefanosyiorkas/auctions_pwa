import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Simulate guest login by setting a guest flag in localStorage and updating state
  const handleGuestLogin = () => {
    localStorage.setItem("guest", "true");
    setIsGuest(true);
  };

  // If guest, show a welcome message or redirect to main app (replace below as needed)
  if (isGuest || localStorage.getItem("guest") === "true") {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-0">
        <div className="w-100" style={{ maxWidth: 480 }}>
          <div className="p-4 rounded-4 shadow-sm bg-white border border-0 text-center">
            <h2 className="fw-bold mb-3">Welcome, Guest!</h2>
            <p className="mb-4">
              You are now browsing as a guest. Some features may be limited.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                localStorage.removeItem("guest");
                setIsGuest(false);
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-0">
      <div className="w-100" style={{ maxWidth: 480 }}>
        <div className="p-0 rounded-4 shadow-sm bg-white border border-0">
          <ul className="nav nav-tabs nav-justified mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link${showLogin ? " active" : ""}`}
                onClick={() => setShowLogin(true)}
                type="button"
                role="tab"
              >
                Login
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link${!showLogin ? " active" : ""}`}
                onClick={() => setShowLogin(false)}
                type="button"
                role="tab"
              >
                Register
              </button>
            </li>
          </ul>
          <div className="tab-content">
            {showLogin ? <Login onGuest={handleGuestLogin} /> : <Register />}
          </div>
        </div>
      </div>
    </div>
  );
}

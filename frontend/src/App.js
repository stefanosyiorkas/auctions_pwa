import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Auctions from "./Auctions";
import ManageAuctions from "./ManageAuctions";
import CreateAuction from "./CreateAuction";
import AuctionDetails from "./AuctionDetails";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

function MainApp({ role, handleLogout }) {
  const navigate = useNavigate();
  return (
    <div className="container-fluid min-vh-100 bg-light p-0">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
        <div className="container">
          <span
            className="navbar-brand fw-bold"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Auction PWA
          </span>
          <div>
            {role === "user" && (
              <>
                <button
                  className="btn btn-outline-primary me-2"
                  onClick={() => navigate("/manage")}
                >
                  Manage Auctions
                </button>
                <button
                  className="btn btn-outline-success me-2"
                  onClick={() => navigate("/create")}
                >
                  Create Auction
                </button>
              </>
            )}
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate("/")}
            >
              Browse Auctions
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Auctions canCreate={false} />} />
          <Route
            path="/auctions/:id"
            element={<AuctionDetails isAuthenticated={role === "user"} />}
          />
          <Route path="/manage" element={<ManageAuctions />} />
          <Route path="/create" element={<CreateAuction />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // 'guest', 'user', etc.
  const [screen, setScreen] = useState("auth"); // 'auth', 'auctions', 'manage'

  // Persist login state on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const guest = localStorage.getItem("guest");
    if (token) {
      setIsLoggedIn(true);
      setRole("user");
      setScreen("auctions");
    } else if (guest) {
      setIsGuest(true);
      setRole("guest");
      setIsLoggedIn(true);
      setScreen("auctions");
    }
  }, []);

  // Simulate guest login by setting a guest flag in localStorage and updating state
  const handleGuestLogin = () => {
    localStorage.setItem("guest", "true");
    setIsGuest(true);
    setRole("guest");
    setIsLoggedIn(true);
    setScreen("auctions");
  };

  // Simulate user login (should be replaced with real logic)
  const handleUserLogin = () => {
    localStorage.removeItem("guest");
    setIsGuest(false);
    setRole("user");
    setIsLoggedIn(true);
    setScreen("auctions");
  };

  // Simulate logout
  const handleLogout = () => {
    localStorage.removeItem("guest");
    setIsGuest(false);
    setIsLoggedIn(false);
    setRole(null);
    setScreen("auth");
  };

  // Auth screens
  if (!isLoggedIn && !isGuest && screen === "auth") {
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
              {showLogin ? (
                <Login
                  onGuest={handleGuestLogin}
                  onUserLogin={handleUserLogin}
                />
              ) : (
                <Register onUserLogin={handleUserLogin} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main navigation for logged-in/guest users
  return (
    <Router>
      <MainApp role={role} handleLogout={handleLogout} />
    </Router>
  );
}

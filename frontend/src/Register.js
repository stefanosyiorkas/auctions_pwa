import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register({ onUserLogin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    location: "",
    vatNumber: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          location: form.location,
          vatNumber: form.vatNumber,
        }),
      });
      if (res.ok) {
        // Auto-login after successful registration
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
          }),
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          localStorage.setItem("token", data.token);
          document.cookie = `username=${encodeURIComponent(
            form.username
          )}; path=/;`; // Store username in cookie
          toast.success("Registration & login successful!");
          if (onUserLogin) onUserLogin();
        } else {
          toast.success("Registration successful! Please log in.");
        }
      } else {
        const data = await res.json();
        setErrors(data);
        toast.error("Registration failed. Please check your input.");
      }
    } catch (err) {
      toast.error("Registration failed. Please try again later.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4">
        <h2 className="mb-4 text-center fw-bold">Register</h2>
        <div className="row g-3">
          <div className="col-12">
            <input
              name="username"
              className="form-control form-control-lg rounded-3"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <div className="text-danger small ms-1 mt-1">
                {errors.username}
              </div>
            )}
          </div>
          <div className="col-md-6">
            <input
              name="password"
              type="password"
              className="form-control form-control-lg rounded-3"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              name="confirmPassword"
              type="password"
              className="form-control form-control-lg rounded-3"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <div className="text-danger small ms-1 mt-1">
                {errors.confirmPassword}
              </div>
            )}
          </div>
          <div className="col-md-6">
            <input
              name="firstName"
              className="form-control form-control-lg rounded-3"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              name="lastName"
              className="form-control form-control-lg rounded-3"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12">
            <input
              name="email"
              type="email"
              className="form-control form-control-lg rounded-3"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="text-danger small ms-1 mt-1">{errors.email}</div>
            )}
          </div>
          <div className="col-md-6">
            <input
              name="phone"
              className="form-control form-control-lg rounded-3"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              name="address"
              className="form-control form-control-lg rounded-3"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              name="location"
              className="form-control form-control-lg rounded-3"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              name="vatNumber"
              className="form-control form-control-lg rounded-3"
              placeholder="VAT Number"
              value={form.vatNumber}
              onChange={handleChange}
              required
            />
            {errors.vatNumber && (
              <div className="text-danger small ms-1 mt-1">
                {errors.vatNumber}
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-success btn-lg w-100 rounded-3 shadow-sm fw-semibold mt-4"
        >
          Register
        </button>
      </form>
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

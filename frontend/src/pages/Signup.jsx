// src/pages/Signup.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Login.css"; // Reuse same CSS for consistency

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/signup",
        form,
        { withCredentials: true }
      );

      setMessage(res.data.message);

      if (res.status === 201) {
        // Signup successful, redirect to login
        navigate("/login");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <h2 className="login-title">Create an Account ✨</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>

        <p className="message">{message}</p>

        <hr className="divider" />

        {/* Google Login */}
        <button className="btn-google" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">Login</Link>
        </p>
      </div>
    </>
  );
}

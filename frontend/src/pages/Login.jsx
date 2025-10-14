import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", form, { withCredentials: true });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "admin") navigate("/admin");
      else navigate("/user");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <h2 className="login-title">Welcome Back 👋</h2>

        {/* Manual Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>

        <p className="message">{message}</p>

        <hr className="divider" />

        {/* Google Login */}
        <button className="btn-google" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <p className="signup-text">
          Don’t have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
        </p>
      </div>
    </>
  );
}

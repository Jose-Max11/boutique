import React from "react";
import { FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import "./Footer.css";
import SearchHistory from "./SearchHistory";


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
           <SearchHistory />
        {/* Logo & Boutique Name */}
        <div className="footer-section">
          <a href="/" className="footer-logo">Jose Boutique</a>
          <p className="footer-tagline">Elegance for Every Girl 💖</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/designs">Shop</a></li>
            <li><a href="/customize">Customize</a></li>
            <li><a href="/designs">Designs</a></li>
            <li><a href="/designers">Designers</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/review">Reviews</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>

        {/* Shop Categories */}
        <div className="footer-section">
          <h4>Shop Categories</h4>
          <ul>
            <li><a href="/category/68c9a1357572af9e063616c8">Sarees</a></li>
            <li><a href="/category/68c9a2ae7572af9e063616dc">Kurtis</a></li>
            <li><a href="/category/68c9a518d96bea6cc783e4f5">Lehanga</a></li>
            <li><a href="/category/68ce727fdc5cb9ee98c7b2fa">Bridal Silks</a></li>
            <li><a href="/category/68d2474175ae29326c7dff2d">Party Dresses</a></li>
            <li><a href="/category/68de8891cc1d3a0407291cd2">Casual</a></li>
            <li><a hred="/category/68ef6e48ed677702d7dc391f">Kurtas</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:info@joseboutique.com">info@joseboutique.com</a></p>
          <p>Phone: +91 98765 43210</p>
          <p>Chennai, India</p>
          <div className="social-icons">
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaPinterestP /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Jose Boutique | Designed with 💕</p>
      </div>
    </footer>
  );
}

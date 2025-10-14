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
            <li><a href="/shop">Shop</a></li>
            <li><a href="/customize">Customize</a></li>
            <li><a href="/design">Designs</a></li>
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
            <li><a href="/shop?sarees">Sarees</a></li>
            <li><a href="/shop?kurtis">Kurtis</a></li>
            <li><a href="/shop?gowns">Gowns</a></li>
            <li><a href="/shop?bridal">Bridal Wear</a></li>
            <li><a href="/shop?accessories">Accessories</a></li>
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

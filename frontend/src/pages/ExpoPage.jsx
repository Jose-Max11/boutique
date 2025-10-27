// src/pages/ExpoPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import "./ExpoPage.css";

const BACKEND_URL = "http://localhost:5000";

export default function ExpoPage() {
  const [expos, setExpos] = useState([]);

  useEffect(() => {
    // Fetch all visible expos
    const fetchExpos = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/expos?visible=true`);
        setExpos(res.data);
      } catch (err) {
        console.error("Error fetching expos:", err);
      }
    };
    fetchExpos();
  }, []);

  return (
    <>
      <Navbar />
      <div className="expo-page">
        <h1 className="expo-title">✨ Upcoming Expos & Showcases ✨</h1>
        <div className="expo-cards-container">
          {expos.length === 0 ? (
            <p>No expos found!</p>
          ) : (
            expos.map((expo) => (
              <div key={expo._id} className="expo-card">
                <img
                  src={`${BACKEND_URL}/uploads/${expo.bannerImage}`}
                  alt={expo.title}
                  className="expo-banner"
                />
                <h2>{expo.title}</h2>
                <p><strong>Date:</strong> {new Date(expo.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {expo.time}</p>
                <p><strong>Venue:</strong> {expo.venue}</p>
                <p>{expo.description}</p>
                {expo.registrationLink && (
                  <a href={expo.registrationLink} target="_blank" rel="noreferrer" className="register-btn">
                    Register Now
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

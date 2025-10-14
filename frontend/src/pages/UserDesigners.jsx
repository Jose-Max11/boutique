import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./UserDesigners.css";

function UserDesigners() {
  const [designers, setDesigners] = useState([]);

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/designers");
        setDesigners(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDesigners();
  }, []);

  return (
    <div className="user-designers-page">
      <Navbar />

      <div className="designers-container">
        <div className="designers-header">
          <h2><center>Our Designers</center></h2>
        </div>

        {designers.length === 0 ? (
          <p className="text-center" style={{ color: "#fff" }}>
            No designers available yet.
          </p>
        ) : (
          designers.map((d, index) => (
            <div
              className={`designer-card ${index % 2 !== 0 ? "reverse" : ""}`}
              key={d._id}
            >
              {d.profile_image && (
                <div className="designer-image">
                  <img
                    src={`http://localhost:5000/${d.profile_image}`}
                    alt={d.name}
                  />
                  {/* 👇 Overlay for name + speciality */}
                  <div className="designer-overlay">
                    <h3>{d.name}</h3>
                    <p>{d.speciality}</p>
                  </div>
                </div>
              )}
              <div className="designer-details">
                <h3>{d.name}</h3>
                <p>
                  <strong>Speciality:</strong> {d.speciality}
                </p>
                <p>
                  <strong>Experience:</strong> {d.experience} years
                </p>
                <p>
                  <strong>Status:</strong> {d.status}
                </p>
                <p>
                  <strong>Bio:</strong> {d.bio}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}

export default UserDesigners;

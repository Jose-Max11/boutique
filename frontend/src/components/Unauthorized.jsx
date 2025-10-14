// src/components/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <>
      <style>{`
        .unauthorized-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #001f54, #003366);
          color: white;
          text-align: center;
          font-family: "Poppins", sans-serif;
        }
        .unauthorized-card {
          background: white;
          color: #001f54;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          max-width: 400px;
        }
        .unauthorized-title {
          font-size: 2rem;
          margin-bottom: 20px;
        }
        .unauthorized-message {
          font-size: 1.1rem;
          margin-bottom: 30px;
        }
        .back-link {
          display: inline-block;
          padding: 12px 24px;
          background: #001f54;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.3s;
        }
        .back-link:hover {
          background: #003366;
        }
      `}</style>
      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <h1 className="unauthorized-title">🚫 Access Denied</h1>
          <p className="unauthorized-message">
            You don't have permission to access this page.
          </p>
          <Link to="/" className="back-link">
            Go Back Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;

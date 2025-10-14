import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Customize.css";

function Customize() {
  const [sareeImage, setSareeImage] = useState(null);
  const [blouseImage, setBlouseImage] = useState(null);

  const handleSareeUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSareeImage(URL.createObjectURL(file));
  };

  const handleBlouseUpload = (e) => {
    const file = e.target.files[0];
    if (file) setBlouseImage(URL.createObjectURL(file));
  };

  const handleShare = (e) => {
    e.preventDefault();
    alert("Your design has been shared!");
    // Here you can add backend API call to save the design
  };

  return (
    <>
      <Navbar />
      <div className="customize-page">
        <h1>Customize Your Dress</h1>
        <p>Upload your fabric and blouse design to create your unique style!</p>

        <form className="customize-form" onSubmit={handleShare}>
          <div className="upload-group">
            <label>Saree / Fabric Image</label>
            <input type="file" accept="image/*" onChange={handleSareeUpload} />
            {sareeImage && <img src={sareeImage} alt="Saree" className="preview" />}
          </div>

          <div className="upload-group">
            <label>Blouse / Design Image</label>
            <input type="file" accept="image/*" onChange={handleBlouseUpload} />
            {blouseImage && <img src={blouseImage} alt="Blouse" className="preview" />}
          </div>

          <div className="preview-section">
            <h2>Preview Your Design</h2>
            <div className="preview-combo">
              {sareeImage && <img src={sareeImage} alt="Saree" />}
              {blouseImage && <img src={blouseImage} alt="Blouse" className="blouse-overlay" />}
            </div>
          </div>

          <button type="submit" className="share-btn">Share Design</button>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Customize;

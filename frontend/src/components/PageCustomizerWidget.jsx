import React, { useState, useEffect } from "react";

const PageCustomizerWidget = () => {
  const [open, setOpen] = useState(false);
  const [font, setFont] = useState("Poppins");
  const [primaryColor, setPrimaryColor] = useState("#c95f7b");
  const [theme, setTheme] = useState("light");

  // Apply styles globally
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.body.style.fontFamily = font;
    document.body.style.backgroundColor = theme === "light" ? "#fff" : "#1e1e2f";
    document.body.style.color = theme === "light" ? "#000" : "#f5f5f5";

    // Save preferences in localStorage
    localStorage.setItem("pageCustomizer", JSON.stringify({ font, primaryColor, theme }));
  }, [font, primaryColor, theme]);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem("pageCustomizer");
    if (saved) {
      const { font, primaryColor, theme } = JSON.parse(saved);
      setFont(font);
      setPrimaryColor(primaryColor);
      setTheme(theme);
    }
  }, []);

  return (
    <div className="customizer-widget">
      <button className="widget-toggle" onClick={() => setOpen(!open)}>
        ⚙️
      </button>

      {open && (
        <div className="widget-panel">
          <h3>Customize Page</h3>

          <label>
            Font:
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Arial">Arial</option>
            </select>
          </label>

          <label>
            Primary Color:
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
          </label>

          <label>
            Theme:
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      )}

      <style>{`
        .customizer-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999;
          font-family: "Poppins", sans-serif;
        }

        .widget-toggle {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .widget-toggle:hover {
          transform: scale(1.1);
        }

        .widget-panel {
          background: white;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 12px;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 200px;
          animation: slideIn 0.3s ease;
        }

        .widget-panel h3 {
          margin: 0;
          font-size: 1.1rem;
          text-align: center;
        }

        .widget-panel label {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }

        .widget-panel select,
        .widget-panel input[type="color"] {
          margin-top: 4px;
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          cursor: pointer;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PageCustomizerWidget;

import React, { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HOW THE FIX WORKS:
//  1. Font  → inject a <style id="pcw-font"> tag into <head> with
//             `* { font-family: ... !important }` so it beats every component's
//             inline / scoped styles on EVERY page.
//  2. Theme → set `data-theme="dark"` on <html> and define all colours as
//             CSS variables in :root / [data-theme="dark"] blocks inside the
//             same injected style tag. Components that already use
//             var(--primary-color) will pick it up automatically.
//  3. Persist → localStorage so prefs survive refresh / navigation.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pageCustomizer_v2";

const FONTS = [
  { label: "Poppins",           value: "Poppins",           url: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" },
  { label: "Roboto",            value: "Roboto",            url: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" },
  { label: "Montserrat",        value: "Montserrat",        url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" },
  { label: "Playfair Display",  value: "Playfair Display",  url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" },
  { label: "Nunito",            value: "Nunito",            url: "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" },
  { label: "DM Sans",           value: "DM Sans",           url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" },
  { label: "Georgia (serif)",   value: "Georgia",           url: null },
  { label: "Arial",             value: "Arial",             url: null },
];

const PRESET_COLORS = [
  { label: "Rose",    value: "#c95f7b" },
  { label: "Indigo",  value: "#6366f1" },
  { label: "Teal",    value: "#0d9488" },
  { label: "Amber",   value: "#d97706" },
  { label: "Fuchsia", value: "#a21caf" },
  { label: "Sky",     value: "#0284c7" },
  { label: "Coral",   value: "#f43f5e" },
  { label: "Emerald", value: "#059669" },
];

// ── Inject / update the single global <style> tag ───────────────────────────
function applyGlobalStyles({ font, primaryColor, theme }) {
  // 1️⃣  Ensure Google Font is loaded
  const fontObj = FONTS.find(f => f.value === font);
  const linkId = "pcw-gfont";
  let link = document.getElementById(linkId);
  if (fontObj?.url) {
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = fontObj.url;
  } else if (link) {
    link.href = ""; // no external font needed
  }

  // 2️⃣  Derive dark-mode palette from primary color
  const styleId = "pcw-global";
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  // Light backgrounds / text
  const lightBg   = "#ffffff";
  const lightBg2  = "#fdf8f5";
  const lightText = "#1a1a2e";
  const lightSub  = "#6b7280";
  const lightBord = "#e5e7eb";

  // Dark backgrounds / text
  const darkBg    = "#ffffff";
  const darkBg2   = "#ffffff";
  const darkText  = "#1a1a2e";
  const darkSub   = "#1a1a2e";
  const darkBord  = "#1a1a2e";

  styleTag.textContent = `
    /* ── FONT: applied globally with !important to beat all component styles ── */
    *, *::before, *::after {
      font-family: '${font}', sans-serif !important;
    }

    /* ── CSS VARIABLES: light (default) ── */
    :root {
      --primary-color:  ${primaryColor};
      --primary-deep:   ${shadeColor(primaryColor, -20)};
      --primary-pale:   ${shadeColor(primaryColor, 85)};
      --bg:             ${lightBg};
      --bg2:            ${lightBg2};
      --text:           ${lightText};
      --text-sub:       ${lightSub};
      --border:         ${lightBord};
      --card-bg:        ${lightBg};
      --nav-bg:         ${lightBg};
      --input-bg:       ${lightBg};
      --shadow:         rgba(0,0,0,0.08);
    }

    /* ── CSS VARIABLES: dark ── */
    html[data-theme="dark"] {
      --primary-color:  ${primaryColor};
      --primary-deep:   ${shadeColor(primaryColor, -20)};
      --primary-pale:   ${shadeColor(primaryColor, -60)}33;
      --bg:             ${darkBg};
      --bg2:            ${darkBg2};
      --text:           ${darkText};
      --text-sub:       ${darkSub};
      --border:         ${darkBord};
      --card-bg:        ${darkBg2};
      --nav-bg:         ${darkBg2};
      --input-bg:       #ffffff;
      --shadow:         rgba(255, 255, 255, 0.35);
    }

    /* ── BASE ELEMENT OVERRIDES (light) ── */
    html, body {
      background-color: var(--bg) !important;
      color: var(--text) !important;
    }

    /* ── BASE ELEMENT OVERRIDES (dark) ── */
    html[data-theme="dark"] body,
    html[data-theme="dark"] {
      background-color: ${darkBg} !important;
      color: ${darkText} !important;
    }

    /* Dark: common UI surfaces */
    html[data-theme="dark"] .card,
    html[data-theme="dark"] [class*="card"],
    html[data-theme="dark"] [class*="-card"] {
      background-color: ${darkBg2} !important;
      border-color: ${darkBord} !important;
      color: ${darkText} !important;
    }

    html[data-theme="dark"] nav,
    html[data-theme="dark"] header,
    html[data-theme="dark"] footer,
    html[data-theme="dark"] [class*="nav"],
    html[data-theme="dark"] [class*="header"],
    html[data-theme="dark"] [class*="footer"] {
      background-color: ${darkBg2} !important;
      border-color: ${darkBord} !important;
      color: ${darkText} !important;
    }

    html[data-theme="dark"] input,
    html[data-theme="dark"] select,
    html[data-theme="dark"] textarea {
      background-color: #ffffff !important;
      color: ${darkText} !important;
      border-color: ${darkBord} !important;
    }

    html[data-theme="dark"] table,
    html[data-theme="dark"] th,
    html[data-theme="dark"] td {
      background-color: ${darkBg2} !important;
      color: ${darkText} !important;
      border-color: ${darkBord} !important;
    }

    html[data-theme="dark"] a { color: ${primaryColor}; }

    html[data-theme="dark"] [class*="modal"],
    html[data-theme="dark"] [class*="overlay"],
    html[data-theme="dark"] [class*="-panel"] {
      background-color: ${darkBg2} !important;
      color: ${darkText} !important;
    }

    /* Smooth theme transition */
    *, *::before, *::after {
      transition: background-color 0.3s ease, color 0.25s ease, border-color 0.25s ease !important;
    }
  `;

  // 3️⃣  Set data-theme on <html> (this triggers all CSS variable switches)
  document.documentElement.setAttribute("data-theme", theme);
}

// Simple color shade helper: amount -100 (darker) to +100 (lighter)
function shadeColor(hex, amount) {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount * 2.55));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount * 2.55));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount * 2.55));
    return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  } catch {
    return hex;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PageCustomizerWidget = () => {
  const [open, setOpen]               = useState(false);
  const [font, setFont]               = useState("Poppins");
  const [primaryColor, setPrimaryColor] = useState("#c95f7b");
  const [theme, setTheme]             = useState("light");
  const [saved, setSaved]             = useState(false);
  const panelRef                      = useRef(null);

  // ── Load prefs on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const prefs = JSON.parse(raw);
        if (prefs.font)         setFont(prefs.font);
        if (prefs.primaryColor) setPrimaryColor(prefs.primaryColor);
        if (prefs.theme)        setTheme(prefs.theme);
        // Apply immediately on mount so every page load picks up saved prefs
        applyGlobalStyles(prefs);
      } catch { /* ignore */ }
    } else {
      // Apply defaults on first load
      applyGlobalStyles({ font: "Poppins", primaryColor: "#c95f7b", theme: "light" });
    }
  }, []);

  // ── Apply whenever any pref changes ──────────────────────────────────────
  useEffect(() => {
    applyGlobalStyles({ font, primaryColor, theme });
  }, [font, primaryColor, theme]);

  // ── Save to localStorage ─────────────────────────────────────────────────
  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ font, primaryColor, theme }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Reset to defaults ────────────────────────────────────────────────────
  const handleReset = () => {
    setFont("Poppins");
    setPrimaryColor("#c95f7b");
    setTheme("light");
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── Close panel on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isDark = theme === "dark";

  return (
    <div ref={panelRef} style={styles.wrapper}>

      {/* ── FLOATING TOGGLE BUTTON ── */}
      <button
        style={{
          ...styles.toggleBtn,
          background: `linear-gradient(135deg, ${primaryColor}, ${shadeColor(primaryColor, -20)})`,
          transform: open ? "rotate(90deg) scale(1.08)" : "rotate(0deg) scale(1)",
        }}
        onClick={() => setOpen(o => !o)}
        title="Customize Page"
      >
        ⚙️
      </button>

      {/* ── PANEL ── */}
      {open && (
        <div style={{
          ...styles.panel,
          background: isDark ? "#1e1e30" : "#ffffff",
          color: isDark ? "#f1f5f9" : "#1a1a2e",
          boxShadow: isDark
            ? "0 8px 32px rgba(255, 255, 255, 0.55)"
            : "0 8px 32px rgba(0,0,0,0.14)",
        }}>

          {/* Header */}
          <div style={styles.panelHeader}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>🎨 Customize</span>
            <button
              style={styles.closeBtn}
              onClick={() => setOpen(false)}
            >✕</button>
          </div>

          <div style={{
            height: 1,
            background: isDark ? "#ffffff" : "#f0f0f0",
            margin: "8px 0 14px",
          }} />

          {/* ── FONT ── */}
          <div style={styles.section}>
            <label style={{ ...styles.label, color: isDark ? "#ffffff" : "#6b7280" }}>
              FONT FAMILY
            </label>
            <select
              value={font}
              onChange={e => setFont(e.target.value)}
              style={{
                ...styles.select,
                background: isDark ? "#ffffff" : "#f9fafb",
                color: isDark ? "#f1f5f9" : "#1a1a2e",
                borderColor: isDark ? "#ffffff" : "#e5e7eb",
              }}
            >
              {FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <div style={{
              marginTop: 8, padding: "8px 12px",
              background: isDark ? "#ffffff" : "#f9fafb",
              borderRadius: 8, fontSize: 13,
              fontFamily: `'${font}', sans-serif`,
              color: isDark ? "#ffffff" : "#6b7280",
              border: `1px solid ${isDark ? "#ffffff" : "#e5e7eb"}`,
            }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>

          {/* ── PRIMARY COLOR ── */}
          <div style={styles.section}>
            <label style={{ ...styles.label, color: isDark ? "#ffffff" : "#6b7280" }}>
              PRIMARY COLOR
            </label>
            {/* Preset swatches */}
            <div style={styles.swatches}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setPrimaryColor(c.value)}
                  style={{
                    ...styles.swatch,
                    background: c.value,
                    outline: primaryColor === c.value
                      ? `3px solid ${c.value}`
                      : "3px solid transparent",
                    outlineOffset: 2,
                    transform: primaryColor === c.value ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
            {/* Custom color picker */}
            <div style={styles.colorPickerRow}>
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={styles.colorInput}
              />
              <span style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                color: isDark ? "#ffffff" : "#6b7280",
              }}>
                {primaryColor.toUpperCase()}
              </span>
              <div style={{
                flex: 1, height: 28, borderRadius: 6,
                background: `linear-gradient(135deg, ${primaryColor}, ${shadeColor(primaryColor, -20)})`,
              }} />
            </div>
          </div>

          {/* ── THEME ── */}
          <div style={styles.section}>
            <label style={{ ...styles.label, color: isDark ? "#94a3b8" : "#6b7280" }}>
              THEME
            </label>
            <div style={styles.themeRow}>
              {["light", "dark"].map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    ...styles.themeBtn,
                    background: theme === t
                      ? `linear-gradient(135deg, ${primaryColor}, ${shadeColor(primaryColor, -20)})`
                      : isDark ? "#22223a" : "#f3f4f6",
                    color: theme === t ? "#fff" : isDark ? "#94a3b8" : "#6b7280",
                    border: theme === t ? "none" : `1px solid ${isDark ? "#2d2d42" : "#e5e7eb"}`,
                    fontWeight: theme === t ? 700 : 400,
                    boxShadow: theme === t ? `0 4px 12px ${primaryColor}44` : "none",
                  }}
                >
                  {t === "light" ? "☀️ Light" : "🌙 Dark"}
                </button>
              ))}
            </div>
          </div>

          {/* ── FOOTER BUTTONS ── */}
          <div style={styles.footer}>
            <button
              onClick={handleReset}
              style={{
                ...styles.footerBtn,
                background: isDark ? "#22223a" : "#f3f4f6",
                color: isDark ? "#94a3b8" : "#6b7280",
                border: `1px solid ${isDark ? "#2d2d42" : "#e5e7eb"}`,
              }}
            >
              ↺ Reset
            </button>
            <button
              onClick={handleSave}
              style={{
                ...styles.footerBtn,
                background: saved
                  ? "#059669"
                  : `linear-gradient(135deg, ${primaryColor}, ${shadeColor(primaryColor, -20)})`,
                color: "#fff",
                border: "none",
                boxShadow: saved ? "0 4px 12px #05996944" : `0 4px 12px ${primaryColor}44`,
              }}
            >
              {saved ? "✓ Saved!" : "💾 Save"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INLINE STYLES (widget-only, not global)
// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 10,
  },
  toggleBtn: {
    width: 52, height: 52, borderRadius: "50%",
    border: "none", cursor: "pointer",
    fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
    transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease",
  },
  panel: {
    width: 280, borderRadius: 18,
    padding: "16px 16px 14px",
    animation: "pcw_slideUp 0.25s cubic-bezier(.34,1.56,.64,1)",
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  closeBtn: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 14, color: "#94a3b8", padding: "2px 6px",
    borderRadius: 6, transition: "background 0.2s",
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", display: "block", marginBottom: 7,
  },
  select: {
    width: "100%", padding: "8px 12px", borderRadius: 10,
    border: "1.5px solid", cursor: "pointer", fontSize: 13,
    outline: "none", appearance: "auto",
  },
  swatches: {
    display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10,
  },
  swatch: {
    width: 24, height: 24, borderRadius: "50%",
    border: "none", cursor: "pointer",
    transition: "transform 0.2s, outline 0.2s",
  },
  colorPickerRow: {
    display: "flex", alignItems: "center", gap: 8,
  },
  colorInput: {
    width: 36, height: 36, borderRadius: 8,
    border: "2px solid #e5e7eb", cursor: "pointer",
    padding: 2, background: "none",
  },
  themeRow: {
    display: "flex", gap: 8,
  },
  themeBtn: {
    flex: 1, padding: "9px 0", borderRadius: 10,
    cursor: "pointer", fontSize: 13,
    transition: "all 0.22s",
  },
  footer: {
    display: "flex", gap: 8, marginTop: 4,
  },
  footerBtn: {
    flex: 1, padding: "9px 0", borderRadius: 10,
    cursor: "pointer", fontSize: 13, fontWeight: 600,
    transition: "all 0.22s",
  },
};

// Inject widget animation keyframe
if (typeof document !== "undefined" && !document.getElementById("pcw-anim")) {
  const s = document.createElement("style");
  s.id = "pcw-anim";
  s.textContent = `
    @keyframes pcw_slideUp {
      from { opacity: 0; transform: translateY(16px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
  `;
  document.head.appendChild(s);
}

export default PageCustomizerWidget;
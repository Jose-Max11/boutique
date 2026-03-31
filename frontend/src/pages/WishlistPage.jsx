// src/pages/WishlistPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Heart, X, ShoppingBag, ArrowLeft, Star,
  Sparkles, Trophy, TrendingUp, FileText, Check, Copy, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartWishlist } from "./CartWishlistContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BACKEND_URL = "http://localhost:5000";

// ─── GOOGLE DRIVE CONFIG ─────────────────────────────────────────────────────
// Replace with your actual Google OAuth2 Client ID from Google Cloud Console
// Steps to get it:
//   1. Go to https://console.cloud.google.com/
//   2. Create a project → Enable "Google Docs API" and "Google Drive API"
//   3. OAuth 2.0 → Create credentials → Web Application
//   4. Add your domain to Authorized JS Origins (e.g. http://localhost:3000)
//   5. Copy the Client ID below
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_SCOPES = "https://www.googleapis.com/auth/drive.file";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --rose:       #e05c7a;
  --rose-deep:  #b8405e;
  --rose-pale:  #fff5f7;
  --gold:       #d4a853;
  --teal:       #0d9488;
  --teal-deep:  #0f766e;
  --teal-pale:  #f0fdfa;
  --cream:      #fafafa;
  --ink:        #1a1a2e;
  --muted:      #7a7a8a;
  --border:     #ebebf0;
  --white:      #ffffff;
  --shadow:     0 2px 16px rgba(0,0,0,0.07);
  --shadow-hover: 0 8px 32px rgba(224,92,122,0.18);
  --gdrive:     #4285F4;
  --gdrive-deep:#2c5ecc;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; }

.wlp { min-height: 100vh; background: var(--cream); }

/* HERO */
.wlp-hero {
  background: linear-gradient(135deg, #16001c 0%, #2d0a1e 50%, #16001c 100%);
  padding: 52px 40px 44px;
  position: relative; overflow: hidden;
}
.wlp-hero::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 55% 70% at 70% 40%, rgba(224,92,122,0.22) 0%, transparent 65%);
}
.wlp-hero::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,168,83,0.35), transparent);
}
.wlp-hero-inner { max-width: 1300px; margin: 0 auto; position: relative; z-index: 1; }

.wlp-back {
  display: inline-flex; align-items: center; gap: 7px;
  color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 500;
  cursor: pointer; letter-spacing: 0.1em; text-transform: uppercase;
  background: none; border: none; margin-bottom: 24px;
  font-family: 'Inter', sans-serif; transition: color 0.2s;
}
.wlp-back:hover { color: var(--gold); }

.wlp-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(34px, 5vw, 58px);
  font-weight: 400; color: #fff; line-height: 1.1; margin-bottom: 6px;
}
.wlp-hero-title em { color: var(--gold); font-style: italic; }

.wlp-hero-sub {
  color: rgba(255,255,255,0.35); font-size: 12px;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 28px;
}

.wlp-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

.btn-compare-open {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: 8px;
  background: rgba(13,148,136,0.15); border: 1px solid rgba(13,148,136,0.35);
  color: #5eead4; font-size: 12px; font-weight: 500;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
}
.btn-compare-open:hover { background: var(--teal); border-color: var(--teal); color: #fff; }

.btn-share {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 22px; border-radius: 8px;
  background: linear-gradient(135deg, var(--gold), #c8922a);
  border: none; color: #1a1a2e; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
}
.btn-share:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,168,83,0.4); }

/* ── GOOGLE DRIVE BUTTON ─────────────────────────────────────────────────── */
.btn-gdrive {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 8px;
  background: rgba(66,133,244,0.15); border: 1px solid rgba(66,133,244,0.35);
  color: #74b3ff; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
}
.btn-gdrive:hover { background: var(--gdrive); border-color: var(--gdrive); color: #fff; }
.btn-gdrive.loading { opacity: 0.65; pointer-events: none; }

/* CONTENT */
.wlp-content { max-width: 1300px; margin: 0 auto; padding: 40px 32px; }

/* GRID */
.wlp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 24px;
}

/* CARD */
.wlp-card {
  background: var(--white); border-radius: 16px; overflow: hidden;
  box-shadow: var(--shadow); border: 1px solid var(--border);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: cardIn 0.4s ease both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.wlp-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-hover); }

.wlp-disc-badge {
  position: absolute; top: 12px; left: 12px; z-index: 3;
  background: var(--rose); color: #fff; font-size: 10px; font-weight: 700;
  padding: 3px 9px; border-radius: 6px; letter-spacing: 0.06em;
}

.wlp-img-box { height: 260px; position: relative; overflow: hidden; background: var(--rose-pale); cursor: pointer; }
.wlp-slider { width: 100%; height: 100%; position: relative; }
.wlp-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.5s ease; }
.wlp-slide.active { opacity: 1; }
.wlp-slide img { width: 100%; height: 100%; object-fit: cover; }
.wlp-dots { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; z-index: 4; }
.wlp-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.45); transition: all 0.2s; }
.wlp-dot.active { background: #fff; width: 14px; border-radius: 3px; }

.wlp-body { padding: 16px 16px 14px; }
.wlp-name { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 400; color: var(--ink); margin-bottom: 10px; line-height: 1.35; }
.wlp-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.wlp-price { font-size: 20px; font-weight: 700; color: var(--rose); }
.wlp-mrp { font-size: 13px; color: #c5b0b7; text-decoration: line-through; }
.wlp-disc-pill { font-size: 11px; font-weight: 600; color: #1d8a4a; background: #eafaf1; padding: 2px 8px; border-radius: 20px; }
.wlp-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
.wlp-chip { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 6px; background: var(--rose-pale); color: var(--rose-deep); border: 1px solid #ffd6e0; }
.wlp-status { display: flex; gap: 7px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.wlp-stock { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 6px; }
.wlp-stock.in  { background: #eafaf1; color: #1d8a4a; }
.wlp-stock.out { background: #fdf0f0; color: #c0392b; }
.wlp-rating-badge { display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; color: #856404; background: #fff8e1; padding: 3px 9px; border-radius: 6px; }
.wlp-actions { display: flex; gap: 7px; }
.wlp-btn-rm { padding: 9px 11px; border-radius: 9px; background: #fff5f7; border: 1.5px solid #fad4de; color: var(--rose); cursor: pointer; display: flex; align-items: center; transition: all 0.2s; }
.wlp-btn-rm:hover { background: var(--rose); color: #fff; border-color: var(--rose); }
.wlp-btn-cart { flex: 1; padding: 9px 14px; border-radius: 9px; background: linear-gradient(135deg, var(--rose), var(--rose-deep)); border: none; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.wlp-btn-cart:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(224,92,122,0.35); }
.wlp-btn-cmp { padding: 9px 11px; border-radius: 9px; background: var(--teal-pale); border: 1.5px solid rgba(13,148,136,0.25); color: var(--teal); cursor: pointer; font-size: 14px; display: flex; align-items: center; transition: all 0.2s; }
.wlp-btn-cmp:hover { border-color: var(--teal); }
.wlp-btn-cmp.active { background: var(--teal); color: #fff; border-color: var(--teal); }

.wlp-empty { text-align: center; padding: 80px 20px; }
.wlp-empty-icon { width: 80px; height: 80px; border-radius: 50%; background: var(--rose-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; animation: pulse 2.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(224,92,122,0.2); } 50% { box-shadow: 0 0 0 12px rgba(224,92,122,0); } }
.wlp-empty h2 { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 400; margin-bottom: 8px; color: var(--ink); }
.wlp-empty p { color: var(--muted); font-size: 14px; margin-bottom: 24px; }
.wlp-empty-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 10px; background: linear-gradient(135deg, var(--rose), var(--rose-deep)); border: none; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.wlp-empty-btn:hover { transform: translateY(-1px); }

/* ── COMPARE MODAL ───────────────────────────────────────────────────────── */
.cmp-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(10,0,15,0.78); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.cmp-modal { width: 96%; max-width: 1360px; max-height: 92vh; background: var(--white); border-radius: 20px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.4); animation: slideUp 0.25s ease; display: flex; flex-direction: column; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.cmp-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: linear-gradient(135deg, #16001c, #2d0a1e); flex-shrink: 0; }
.cmp-head-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 400; color: #fff; }
.cmp-head-title em { color: var(--gold); font-style: italic; }
.cmp-head-sub { font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 0.08em; margin-top: 2px; }
.cmp-head-actions { display: flex; gap: 8px; align-items: center; }
.btn-suggest { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; background: linear-gradient(135deg, var(--teal), var(--teal-deep)); border: none; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-suggest:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(13,148,136,0.4); }
.btn-suggest.loading { opacity: 0.65; pointer-events: none; }
.btn-cmp-clear { padding: 7px 15px; border-radius: 8px; background: rgba(220,53,69,0.1); border: 1px solid rgba(220,53,69,0.22); color: #ff6b7a; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-cmp-clear:hover { background: #dc3545; color: #fff; }
.btn-cmp-close { padding: 7px 15px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.75); font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-cmp-close:hover { background: rgba(255,255,255,0.16); }

.cmp-suggestion { padding: 14px 24px; background: linear-gradient(135deg, #f0fdfa, #e6faf8); border-bottom: 1px solid rgba(13,148,136,0.15); flex-shrink: 0; animation: slideDown 0.25s ease; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.cmp-sug-inner { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.cmp-sug-trophy { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), #c8922a); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 14px rgba(212,168,83,0.3); }
.cmp-sug-text { flex: 1; }
.cmp-sug-label { font-size: 10px; font-weight: 700; color: var(--teal-deep); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
.cmp-sug-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--ink); }
.cmp-sug-reason { font-size: 12px; color: var(--muted); margin-top: 2px; }
.cmp-sug-scores { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.cmp-score-pill { font-size: 11px; font-weight: 600; padding: 3px 11px; border-radius: 20px; background: rgba(13,148,136,0.1); color: var(--teal-deep); border: 1px solid rgba(13,148,136,0.18); }
.cmp-score-pill.best { background: linear-gradient(135deg, var(--teal), var(--teal-deep)); color: #fff; border: none; }
.cmp-sug-loading { padding: 12px 24px; background: #f0fdfa; border-bottom: 1px solid rgba(13,148,136,0.12); display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.spin { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(13,148,136,0.2); border-top-color: var(--teal); animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.cmp-sug-loading span { font-size: 13px; color: var(--teal-deep); }

.cmp-table-wrap { flex: 1; overflow-y: auto; padding: 0; }
.cmp-table-wrap::-webkit-scrollbar { width: 4px; }
.cmp-table-wrap::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.cmp-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.cmp-th-feat { text-align: left; padding: 13px 16px; background: #fafafa; border-bottom: 1.5px solid var(--border); border-right: 1px solid var(--border); font-size: 11px; font-weight: 700; color: var(--rose-deep); text-transform: uppercase; letter-spacing: 0.07em; min-width: 150px; position: sticky; left: 0; z-index: 2; }
.cmp-th-prod { text-align: center; padding: 13px 12px; background: #fafafa; border-bottom: 1.5px solid var(--border); min-width: 200px; transition: background 0.3s; }
.cmp-th-prod.winner { background: #f0fdfa; }
.cmp-th-img-wrap { display: flex; justify-content: center; margin-bottom: 7px; position: relative; }
.cmp-th-img { width: 64px; height: 64px; object-fit: cover; border-radius: 10px; border: 2px solid var(--border); transition: border-color 0.3s; }
.cmp-th-prod.winner .cmp-th-img { border-color: var(--teal); }
.cmp-winner-crown { position: absolute; top: -8px; right: calc(50% - 42px); font-size: 16px; animation: float 2s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.cmp-th-name { font-size: 12px; font-weight: 600; color: var(--ink); line-height: 1.3; }
.cmp-td-feat { padding: 11px 16px; background: #fafafa; font-size: 11px; font-weight: 700; color: var(--rose-deep); text-transform: uppercase; letter-spacing: 0.06em; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); position: sticky; left: 0; z-index: 1; }
.cmp-td { padding: 11px 12px; font-size: 13px; text-align: center; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--ink); background: var(--white); transition: background 0.3s; }
.cmp-td.best   { background: #f5fff8; }
.cmp-td.winner { background: #f0fdfa; }
.cmp-td.note   { font-size: 12px; color: var(--muted); line-height: 1.5; vertical-align: top; text-align: left; }
.cmp-best-tag { display: inline-block; margin-top: 3px; font-size: 10px; font-weight: 700; color: #1d8a4a; background: #eafaf1; padding: 2px 7px; border-radius: 20px; }
.cmp-win-tag { display: inline-block; margin-top: 3px; font-size: 10px; font-weight: 700; color: var(--teal-deep); background: rgba(13,148,136,0.1); padding: 2px 7px; border-radius: 20px; }
.cmp-stock-pill { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.cmp-size-list { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; }
.cmp-size-chip { padding: 2px 7px; font-size: 11px; font-weight: 600; background: var(--rose-pale); color: var(--rose-deep); border-radius: 5px; border: 1px solid #ffd6e0; }
.cmp-color-list { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; }
.cmp-color-chip { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); }
.cmp-color-dot  { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid #ccc; flex-shrink: 0; }

/* ══════════════════════════════════════════════════════════
   GOOGLE DRIVE SHARE MODAL
══════════════════════════════════════════════════════════ */
.gdrive-overlay {
  position: fixed; inset: 0; z-index: 20000;
  background: rgba(10,0,20,0.82); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: fadeIn 0.2s ease;
}
.gdrive-modal {
  width: 96%; max-width: 560px;
  background: var(--white); border-radius: 22px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.45);
  overflow: hidden; animation: slideUp 0.3s ease;
}

.gdrive-modal-head {
  padding: 28px 28px 20px;
  background: linear-gradient(135deg, #0a1628 0%, #1a2e52 100%);
  position: relative; overflow: hidden;
}
.gdrive-modal-head::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(66,133,244,0.25) 0%, transparent 65%);
}
.gdrive-modal-head-inner { position: relative; z-index: 1; display: flex; align-items: flex-start; gap: 16px; }
.gdrive-modal-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.gdrive-modal-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 400; color: #fff; margin-bottom: 4px; }
.gdrive-modal-title em { color: #74b3ff; font-style: italic; }
.gdrive-modal-sub { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }

.gdrive-modal-body { padding: 24px 28px 28px; }

/* Step indicator */
.gdrive-steps { display: flex; gap: 0; margin-bottom: 24px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
.gdrive-step { flex: 1; padding: 10px 8px; text-align: center; font-size: 11px; font-weight: 600; color: var(--muted); background: #fafafa; border-right: 1px solid var(--border); transition: all 0.3s; }
.gdrive-step:last-child { border-right: none; }
.gdrive-step.active { background: rgba(66,133,244,0.08); color: var(--gdrive); }
.gdrive-step.done   { background: rgba(13,148,136,0.08); color: var(--teal); }
.gdrive-step-num { display: block; width: 20px; height: 20px; border-radius: 50%; background: var(--border); color: var(--muted); font-size: 10px; font-weight: 700; line-height: 20px; margin: 0 auto 4px; }
.gdrive-step.active .gdrive-step-num { background: var(--gdrive); color: #fff; }
.gdrive-step.done   .gdrive-step-num { background: var(--teal); color: #fff; }

/* Options */
.gdrive-options { margin-bottom: 20px; }
.gdrive-option-label { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.07em; }
.gdrive-radio-group { display: flex; flex-direction: column; gap: 8px; }
.gdrive-radio { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 10px; border: 1.5px solid var(--border); cursor: pointer; transition: all 0.2s; }
.gdrive-radio:hover { border-color: rgba(66,133,244,0.4); background: rgba(66,133,244,0.03); }
.gdrive-radio.selected { border-color: var(--gdrive); background: rgba(66,133,244,0.06); }
.gdrive-radio input { margin-top: 2px; accent-color: var(--gdrive); flex-shrink: 0; }
.gdrive-radio-text strong { font-size: 13px; color: var(--ink); display: block; margin-bottom: 2px; }
.gdrive-radio-text span { font-size: 11px; color: var(--muted); }

/* Permission */
.gdrive-perm { margin-bottom: 20px; }
.gdrive-perm-label { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.07em; }
.gdrive-perm-row { display: flex; gap: 8px; }
.gdrive-perm-btn { flex: 1; padding: 9px; border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif; border: 1.5px solid var(--border); background: #fafafa; color: var(--muted); transition: all 0.2s; text-align: center; }
.gdrive-perm-btn.active { border-color: var(--gdrive); background: rgba(66,133,244,0.08); color: var(--gdrive); }

/* Action buttons */
.gdrive-actions { display: flex; gap: 10px; }
.btn-gdrive-upload { flex: 1; padding: 12px; border-radius: 11px; background: linear-gradient(135deg, var(--gdrive), var(--gdrive-deep)); border: none; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
.btn-gdrive-upload:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(66,133,244,0.4); }
.btn-gdrive-upload:disabled { opacity: 0.6; pointer-events: none; }
.btn-gdrive-cancel { padding: 12px 18px; border-radius: 11px; background: #fafafa; border: 1.5px solid var(--border); color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-gdrive-cancel:hover { border-color: #ccc; color: var(--ink); }

/* Progress */
.gdrive-progress { margin: 16px 0; }
.gdrive-progress-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.gdrive-progress-bar { height: 6px; border-radius: 10px; background: var(--border); overflow: hidden; }
.gdrive-progress-fill { height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--gdrive), #74b3ff); transition: width 0.4s ease; }

/* Success */
.gdrive-success { text-align: center; padding: 8px 0 4px; animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes popIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
.gdrive-success-icon { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #eafaf1, #d4f5e3); border: 2px solid rgba(29,138,74,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.gdrive-success h3 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 400; color: var(--ink); margin-bottom: 6px; }
.gdrive-success p { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.5; }
.gdrive-link-box { display: flex; align-items: center; gap: 8px; background: #f5f7fa; border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 12px; margin-bottom: 16px; }
.gdrive-link-url { flex: 1; font-size: 12px; color: var(--gdrive); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; }
.btn-copy-link { padding: 6px 12px; border-radius: 7px; background: var(--gdrive); border: none; color: #fff; font-size: 11px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 4px; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
.btn-copy-link:hover { background: var(--gdrive-deep); }
.btn-copy-link.copied { background: var(--teal); }
.gdrive-success-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.btn-open-doc { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; background: var(--gdrive); border: none; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; text-decoration: none; transition: all 0.2s; }
.btn-open-doc:hover { background: var(--gdrive-deep); transform: translateY(-1px); }
.btn-done-close { padding: 10px 20px; border-radius: 10px; background: #fafafa; border: 1.5px solid var(--border); color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
.btn-done-close:hover { border-color: #ccc; color: var(--ink); }

/* Error */
.gdrive-error { background: #fff8f8; border: 1.5px solid rgba(220,53,69,0.2); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 12px; color: #c0392b; line-height: 1.5; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .wlp-hero { padding: 36px 20px 28px; }
  .wlp-content { padding: 28px 16px; }
  .wlp-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .cmp-head { padding: 14px 18px; flex-wrap: wrap; gap: 10px; }
  .gdrive-modal-body { padding: 18px 18px 22px; }
}
@media (max-width: 480px) {
  .wlp-grid { grid-template-columns: 1fr; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("wlp-styles-clean")) {
  const tag = document.createElement("style");
  tag.id = "wlp-styles-clean";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

// ─── SCORING ─────────────────────────────────────────────────────────────────
function scoreProduct(p) {
  let score = 0;
  const fp = p.finalPrice || p.price || 9999;
  score += Math.max(0, 40 - fp / 100);
  if (p.averageRating)  score += p.averageRating * 8;
  if (p.totalReviews)   score += Math.min(p.totalReviews / 5, 10);
  if (p.discount)       score += p.discount * 0.5;
  if (p.stock > 0)      score += 10;
  if (Array.isArray(p.sizes))  score += Math.min(p.sizes.length * 1.5, 9);
  if (Array.isArray(p.color))  score += Math.min(p.color.length, 5);
  return Math.round(score * 10) / 10;
}

function buildSuggestionReason(winner, all) {
  const fp = winner.finalPrice || winner.price;
  const reasons = [];
  const minPrice = Math.min(...all.map(p => p.finalPrice || p.price));
  if (fp === minPrice) reasons.push("best price");
  if (winner.averageRating >= 4) reasons.push(`top-rated at ${winner.averageRating}★`);
  if (winner.discount >= 20)     reasons.push(`${winner.discount}% discount`);
  if (winner.stock > 10)         reasons.push("well stocked");
  if (Array.isArray(winner.sizes) && winner.sizes.length >= 5)
    reasons.push(`${winner.sizes.length} size options`);
  return reasons.length > 0
    ? `Recommended for: ${reasons.join(", ")}.`
    : "Best overall value across all compared metrics.";
}

// ─── IMAGE SLIDER ─────────────────────────────────────────────────────────────
function ImageSlider({ images, productName, onClick }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const startSlider = useCallback(() => {
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % images.length), 1000);
  }, [images.length]);
  const stopSlider = useCallback(() => clearInterval(timerRef.current), []);
  useEffect(() => () => clearInterval(timerRef.current), []);
  return (
    <div className="wlp-slider" onMouseEnter={startSlider} onMouseLeave={() => { stopSlider(); setIdx(0); }} onClick={onClick}>
      {images.map((src, i) => (
        <div key={i} className={`wlp-slide ${i === idx ? "active" : ""}`}>
          <img src={src} alt={`${productName} ${i + 1}`} />
        </div>
      ))}
      {images.length > 1 && (
        <div className="wlp-dots">
          {images.map((_, i) => <div key={i} className={`wlp-dot ${i === idx ? "active" : ""}`} />)}
        </div>
      )}
    </div>
  );
}

// ─── GOOGLE DRIVE LOGO SVG ────────────────────────────────────────────────────
function GDriveLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );
}

// ─── GOOGLE DRIVE SHARE MODAL ─────────────────────────────────────────────────
function GDriveShareModal({ products, onClose, backendUrl }) {
  const [step, setStep]               = useState("options"); // options | uploading | success | error
  const [docFormat, setDocFormat]     = useState("google_doc");
  const [permission, setPermission]   = useState("anyone");
  const [progress, setProgress]       = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [docUrl, setDocUrl]           = useState("");
  const [copied, setCopied]           = useState(false);
  const [error, setError]             = useState("");
  const [gToken, setGToken]           = useState(null);

  const getStepState = (n) => {
    if (step === "options")   return n === 1 ? "active" : "";
    if (step === "uploading") return n <= 2 ? (n === 2 ? "active" : "done") : "";
    if (step === "success")   return "done";
    return "";
  };

  // Load Google Identity Services script dynamically
  const loadGIS = () => new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load Google Identity Services. Check your internet connection."));
    document.head.appendChild(s);
  });

  // OAuth2 sign-in → returns access token
  const signInGoogle = async () => {
    await loadGIS();
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: (resp) => {
          if (resp.error) reject(new Error(resp.error_description || resp.error));
          else resolve(resp.access_token);
        },
      });
      client.requestAccessToken({ prompt: "consent" });
    });
  };

  // Build Google Docs batchUpdate requests from product list
  const buildDocRequests = (prods) => {
    const requests = [];
    let idx = 1;

    const ins = (text) => {
      requests.push({ insertText: { location: { index: idx }, text } });
      idx += text.length;
    };
    const style = (start, end, namedStyleType, extra = {}) => {
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: start, endIndex: end },
          paragraphStyle: { namedStyleType, ...extra },
          fields: Object.keys({ namedStyleType, ...extra }).join(","),
        },
      });
    };

    // Title
    const titleStart = idx;
    ins("My Wishlist\n");
    style(titleStart, titleStart + 11, "HEADING_1", { alignment: "CENTER" });

    // Subtitle
    ins(`${prods.length} items · Shared from My Fashion App\n\n`);

    prods.forEach((prod, i) => {
      const fp = prod.finalPrice || prod.sellingPrice || prod.price;
      const sizeList = Array.isArray(prod.sizes)
        ? prod.sizes.map(s => s.size || s).join(", ")
        : "—";
      const colorText = Array.isArray(prod.colorLabels) && prod.colorLabels.length
        ? prod.colorLabels.join(", ")
        : Array.isArray(prod.color) ? prod.color.join(", ") : "—";

      const hStart = idx;
      const hText = `${i + 1}. ${prod.name}\n`;
      ins(hText);
      style(hStart, hStart + hText.length - 1, "HEADING_2");

      const rows = [
        `💰 Price: ₹${fp?.toLocaleString() || "N/A"}${prod.mrp ? `  (MRP: ₹${prod.mrp.toLocaleString()})` : ""}${prod.discount > 0 ? `  🏷 ${prod.discount}% OFF` : ""}`,
        `📦 Stock: ${prod.stock > 0 ? `${prod.stock} in stock` : "Out of stock"}`,
        prod.averageRating ? `⭐ Rating: ${prod.averageRating}/5 (${prod.totalReviews || 0} reviews)` : null,
        `🗂 Category: ${prod.categoryName || "—"}`,
        (prod.fabric || prod.fabricType) ? `🧵 Fabric: ${prod.fabric || prod.fabricType}` : null,
        `📐 Sizes: ${sizeList}`,
        `🎨 Colors: ${colorText}`,
        prod.dressType    ? `👗 Dress Type: ${prod.dressType}` : null,
        prod.neckType     ? `🔵 Neck Type: ${prod.neckType}` : null,
        prod.sleeveType   ? `👕 Sleeve: ${prod.sleeveType}` : null,
        prod.sleeveLength ? `📏 Sleeve Length: ${prod.sleeveLength}` : null,
        prod.pattern      ? `🌀 Pattern: ${prod.pattern}` : null,
        prod.occasion     ? `🎉 Occasion: ${prod.occasion}` : null,
        `↩️ Return Policy: ${prod.returnPolicy || "7 Days"}`,
        prod.description  ? `📝 Description: ${prod.description.substring(0, 200)}${prod.description.length > 200 ? "…" : ""}` : null,
      ].filter(Boolean);

      ins(rows.join("\n") + "\n\n");
    });

    return requests;
  };

  // Set file share permissions
  const setFilePermissions = async (fileId, token) => {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    });

    // Optionally save to backend for "app users only" gating
    if (permission === "appusers") {
      try {
        await fetch(`${backendUrl}/api/shared-wishlist/drive`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fileId,
            fileUrl: `https://docs.google.com/document/d/${fileId}/edit`,
            visibility: "appusers",
          }),
        });
      } catch (_) { /* non-critical */ }
    }
  };

  // ── MAIN UPLOAD HANDLER ───────────────────────────────────────────────────
  const handleUpload = async () => {
    setStep("uploading");
    setProgress(5);
    setProgressLabel("Connecting to Google…");
    setError("");

    try {
      // Step 1: Auth
      const token = gToken || await signInGoogle();
      setGToken(token);
      setProgress(25);
      setProgressLabel("Authenticated ✓  Creating document…");

      let fileId;

      if (docFormat === "google_doc") {
        // Create empty Google Doc via Docs API
        const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ title: "My Wishlist – Fashion App" }),
        });
        if (!createRes.ok) {
          const err = await createRes.json();
          throw new Error(err.error?.message || "Failed to create Google Doc");
        }
        const doc = await createRes.json();
        fileId = doc.documentId;
        setProgress(50);
        setProgressLabel("Writing product details…");

        // Insert all content via batchUpdate
        const requests = buildDocRequests(products);
        const updateRes = await fetch(
          `https://docs.googleapis.com/v1/documents/${fileId}:batchUpdate`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ requests }),
          }
        );
        if (!updateRes.ok) {
          const err = await updateRes.json();
          throw new Error(err.error?.message || "Failed to write document content");
        }

      } else {
        // Upload HTML → Google Drive (auto-converts to Google Doc)
        setProgress(35);
        setProgressLabel("Building document…");

        const htmlContent = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#1a1a2e;">
          <h1 style="color:#e05c7a;font-size:36px;margin-bottom:4px;">My Wishlist</h1>
          <p style="color:#888;font-size:13px;margin-bottom:32px;">${products.length} items · Shared from My Fashion App</p>
          ${products.map((p, i) => {
            const fp = p.finalPrice || p.sellingPrice || p.price;
            const sizeList = Array.isArray(p.sizes) ? p.sizes.map(s => s.size || s).join(", ") : "—";
            const colorText = Array.isArray(p.colorLabels) && p.colorLabels.length
              ? p.colorLabels.join(", ")
              : Array.isArray(p.color) ? p.color.join(", ") : "—";
            return `<div style="border:1px solid #eee;border-radius:12px;padding:24px;margin:20px 0;page-break-inside:avoid;">
              <h2 style="font-size:20px;margin-bottom:14px;color:#1a1a2e;">${i+1}. ${p.name}</h2>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:5px 10px;color:#888;width:160px;border-bottom:1px solid #f5f5f5;">💰 Price</td><td style="padding:5px 10px;font-weight:700;color:#e05c7a;border-bottom:1px solid #f5f5f5;">₹${fp?.toLocaleString() || "N/A"}${p.discount > 0 ? ` (${p.discount}% OFF)` : ""}</td></tr>
                ${p.mrp ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">🏷 MRP</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;text-decoration:line-through;">₹${p.mrp.toLocaleString()}</td></tr>` : ""}
                <tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">📦 Stock</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</td></tr>
                ${p.averageRating ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">⭐ Rating</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.averageRating}/5 (${p.totalReviews || 0} reviews)</td></tr>` : ""}
                <tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">🗂 Category</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.categoryName || "—"}</td></tr>
                ${p.fabric || p.fabricType ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">🧵 Fabric</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.fabric || p.fabricType}</td></tr>` : ""}
                <tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">📐 Sizes</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${sizeList}</td></tr>
                <tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">🎨 Colors</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${colorText}</td></tr>
                ${p.dressType ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">👗 Dress Type</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.dressType}</td></tr>` : ""}
                ${p.neckType ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">🔵 Neck Type</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.neckType}</td></tr>` : ""}
                ${p.sleeveType || p.sleeveLength ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">👕 Sleeve</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.sleeveType || p.sleeveLength}</td></tr>` : ""}
                ${p.pattern ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">🌀 Pattern</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.pattern}</td></tr>` : ""}
                ${p.occasion ? `<tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">🎉 Occasion</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.occasion}</td></tr>` : ""}
                <tr><td style="padding:5px 10px;color:#888;border-bottom:1px solid #f5f5f5;">↩️ Return</td><td style="padding:5px 10px;border-bottom:1px solid #f5f5f5;">${p.returnPolicy || "7 Days"}</td></tr>
                ${p.description ? `<tr><td style="padding:5px 10px;color:#888;vertical-align:top;">📝 Description</td><td style="padding:5px 10px;">${p.description.substring(0, 250)}${p.description.length > 250 ? "…" : ""}</td></tr>` : ""}
              </table>
            </div>`;
          }).join("")}
        </body></html>`;

        setProgress(55);
        setProgressLabel("Uploading to Google Drive…");

        const boundary = "wl_boundary_314159";
        const metadata = {
          name: "My Wishlist – Fashion App",
          mimeType: "application/vnd.google-apps.document",
        };
        const body =
          `--${boundary}\r\n` +
          `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
          `${JSON.stringify(metadata)}\r\n` +
          `--${boundary}\r\n` +
          `Content-Type: text/html\r\n\r\n` +
          `${htmlContent}\r\n` +
          `--${boundary}--`;

        const uploadRes = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": `multipart/related; boundary="${boundary}"`,
            },
            body,
          }
        );
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error?.message || "Drive upload failed");
        }
        const file = await uploadRes.json();
        fileId = file.id;
      }

      setProgress(78);
      setProgressLabel("Setting share permissions…");
      await setFilePermissions(fileId, token);

      setProgress(100);
      setProgressLabel("Done!");
      setDocUrl(`https://docs.google.com/document/d/${fileId}/edit?usp=sharing`);
      setTimeout(() => setStep("success"), 400);

    } catch (err) {
      console.error("Google Drive share error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setStep("options");
      setProgress(0);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(docUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = docUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="gdrive-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="gdrive-modal">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="gdrive-modal-head">
          <div className="gdrive-modal-head-inner">
            <div className="gdrive-modal-icon">
              <GDriveLogo size={28} />
            </div>
            <div>
              <div className="gdrive-modal-title">Share to <em>Google Drive</em></div>
              <div className="gdrive-modal-sub">
                Export your wishlist as a Google Doc — viewable by anyone you share it with.
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="gdrive-modal-body">

          {/* Step tracker */}
          <div className="gdrive-steps">
            {["Configure", "Upload", "Share"].map((label, i) => (
              <div key={i} className={`gdrive-step ${getStepState(i + 1)}`}>
                <span className="gdrive-step-num">
                  {getStepState(i + 1) === "done" ? "✓" : i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          {/* ── OPTIONS ──────────────────────────────────────────────────── */}
          {step === "options" && (
            <>
              {error && <div className="gdrive-error">⚠️ {error}</div>}

              {/* Format chooser */}
              <div className="gdrive-options">
                <div className="gdrive-option-label">Export Method</div>
                <div className="gdrive-radio-group">
                  {[
                    {
                      val: "google_doc",
                      title: "Google Docs API (Recommended)",
                      desc: "Creates a native Google Doc with full headings, structure and clean formatting.",
                    },
                    {
                      val: "html_upload",
                      title: "HTML Upload to Drive",
                      desc: "Uploads an HTML file that Drive auto-converts to a Google Doc. Use as fallback.",
                    },
                  ].map(opt => (
                    <label
                      key={opt.val}
                      className={`gdrive-radio ${docFormat === opt.val ? "selected" : ""}`}
                    >
                      <input
                        type="radio" name="docFormat" value={opt.val}
                        checked={docFormat === opt.val}
                        onChange={() => setDocFormat(opt.val)}
                      />
                      <div className="gdrive-radio-text">
                        <strong>{opt.title}</strong>
                        <span>{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div className="gdrive-perm">
                <div className="gdrive-perm-label">Who Can View?</div>
                <div className="gdrive-perm-row">
                  <button
                    className={`gdrive-perm-btn ${permission === "anyone" ? "active" : ""}`}
                    onClick={() => setPermission("anyone")}
                  >
                    🌐 Anyone with link
                  </button>
                  <button
                    className={`gdrive-perm-btn ${permission === "appusers" ? "active" : ""}`}
                    onClick={() => setPermission("appusers")}
                  >
                    👥 App users only
                  </button>
                </div>
              </div>

              {/* Summary info box */}
              <div style={{
                fontSize: 11, color: "var(--muted)", marginBottom: 20, lineHeight: 1.7,
                background: "#fafafa", padding: "10px 14px", borderRadius: 10,
                border: "1px solid var(--border)"
              }}>
                📋 <strong>{products.length} item{products.length !== 1 ? "s" : ""}</strong> will be exported with full details:<br />
                name, price, discount, stock, rating, category, fabric, sizes, colors, dress type, neck type, sleeve, pattern, occasion, return policy & description.
              </div>

              <div className="gdrive-actions">
                <button className="btn-gdrive-cancel" onClick={onClose}>Cancel</button>
                <button className="btn-gdrive-upload" onClick={handleUpload}>
                  <GDriveLogo size={16} />
                  Sign in &amp; Export to Drive
                </button>
              </div>
            </>
          )}

          {/* ── UPLOADING ────────────────────────────────────────────────── */}
          {step === "uploading" && (
            <div style={{ padding: "16px 0" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "rgba(66,133,244,0.08)",
                  border: "2px solid rgba(66,133,244,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px"
                }}>
                  <div className="spin" style={{
                    borderColor: "rgba(66,133,244,0.15)",
                    borderTopColor: "var(--gdrive)",
                    width: 26, height: 26
                  }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 5 }}>
                  Exporting to Google Drive…
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Please keep this window open
                </div>
              </div>
              <div className="gdrive-progress">
                <div className="gdrive-progress-label">
                  <span>{progressLabel}</span>
                  <span>{progress}%</span>
                </div>
                <div className="gdrive-progress-bar">
                  <div className="gdrive-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* ── SUCCESS ──────────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="gdrive-success">
              <div className="gdrive-success-icon">
                <Check size={30} color="#1d8a4a" strokeWidth={2.5} />
              </div>
              <h3>Wishlist Exported! 🎉</h3>
              <p>
                Your <strong>{products.length} item{products.length !== 1 ? "s" : ""}</strong> wishlist has been saved to Google Drive.{" "}
                {permission === "anyone"
                  ? "Anyone with the link can view it."
                  : "Only app users with the link can view it."}
              </p>

              {/* Link copy box */}
              <div className="gdrive-link-box">
                <span className="gdrive-link-url">{docUrl}</span>
                <button
                  className={`btn-copy-link ${copied ? "copied" : ""}`}
                  onClick={handleCopyLink}
                >
                  {copied
                    ? <><Check size={11} /> Copied!</>
                    : <><Copy size={11} /> Copy</>
                  }
                </button>
              </div>

              <div className="gdrive-success-actions">
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-open-doc"
                >
                  <ExternalLink size={14} /> Open in Google Docs
                </a>
                <button className="btn-done-close" onClick={onClose}>Done</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCartWishlist();
  const [products, setProducts]           = useState([]);
  const [categories, setCategories]       = useState([]);
  const [compareList, setCompareList]     = useState([]);
  const [showCompare, setShowCompare]     = useState(false);
  const [suggestionResult, setSuggestionResult] = useState(null);
  const [suggestLoading, setSuggestLoading]     = useState(false);
  const [winnerId, setWinnerId]           = useState(null);
  const [showGDrive, setShowGDrive]       = useState(false); // ← NEW
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/categories`)
      .then(r => r.json())
      .then(data => { if (data.length) setCategories(data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetch(`${BACKEND_URL}/api/compare`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(r => r.json())
        .then(d => { if (d.success) setCompareList(d.products); })
        .catch(console.error);
    }
  }, []);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    if (typeof categoryId === "object" && categoryId.name) return categoryId.name;
    const cat = categories.find(c => c._id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  const cleanColorLabels = (labels) => {
    if (!labels) return [];
    if (typeof labels === "string") {
      try {
        const p = JSON.parse(labels);
        if (Array.isArray(p)) return p.filter(l => l?.trim());
      } catch {
        return labels.split(",").map(l => l.replace(/[[\]"]/g, "").trim()).filter(Boolean);
      }
    }
    return Array.isArray(labels)
      ? labels.map(l => String(l).replace(/[[\]"]/g, "").trim()).filter(Boolean)
      : [];
  };

  useEffect(() => {
    setProducts(wishlist.map(p => ({
      ...p,
      categoryName: getCategoryName(p.category),
      colorLabels: cleanColorLabels(p.colorLabels),
      images: Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : [p.image, p.referenceImage, p.materialImage].filter(Boolean),
      sizesCount: Array.isArray(p.sizes) ? p.sizes.length : 0,
      colorsCount: Array.isArray(p.color) ? p.color.length : 0,
      finalPrice: p.sellingPrice || (p.price * (1 - (p.discount || 0) / 100)) || p.price,
    })));
  }, [wishlist, categories]);

  const resolveImg = (img) => img?.startsWith("http") ? img : `${BACKEND_URL}/${img}`;

  const getFirstImage = (product) => {
    const raw = Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : [product.image, product.referenceImage, product.materialImage].filter(Boolean)[0];
    if (!raw) return "https://via.placeholder.com/300x300?text=No+Image";
    return resolveImg(raw);
  };

  const saveCompare = async (list) => {
    try {
      await fetch(`${BACKEND_URL}/api/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ products: list.map(p => p._id) }),
      });
    } catch (e) { console.error(e); }
  };

  const toggleCompare = (product) => {
    const exists = compareList.find(p => p._id === product._id);
    if (!exists && compareList.length >= 4) { alert("Maximum 4 items!"); return; }
    const updated = exists
      ? compareList.filter(p => p._id !== product._id)
      : [...compareList, product];
    setCompareList(updated);
    saveCompare(updated);
    setSuggestionResult(null);
    setWinnerId(null);
  };

  const clearCompare = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/compare`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (e) { console.error(e); }
    setCompareList([]);
    setSuggestionResult(null);
    setWinnerId(null);
  };

  const handleShareWishlist = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/shared-wishlist/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        await navigator.clipboard.writeText(data.shareLink);
        alert("🔗 Link copied!\n" + data.shareLink);
      } else {
        alert("Failed to create link.");
      }
    } catch { alert("Error sharing wishlist."); }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`🛒 ${product.name} added to cart!`);
  };

  const handleSuggest = () => {
    if (compareList.length < 2) { alert("Add at least 2 items to compare first!"); return; }
    setSuggestLoading(true);
    setSuggestionResult(null);
    setWinnerId(null);
    setTimeout(() => {
      const scored = compareList.map(p => ({ ...p, _score: scoreProduct(p) }));
      scored.sort((a, b) => b._score - a._score);
      const winner = scored[0];
      setSuggestionResult({ winner, scores: scored, reason: buildSuggestionReason(winner, compareList) });
      setWinnerId(winner._id);
      setSuggestLoading(false);
    }, 1400);
  };

  return (
    <div className="wlp">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="wlp-hero">
        <div className="wlp-hero-inner">
          <button className="wlp-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={13} /> Continue Shopping
          </button>
          <h1 className="wlp-hero-title">My <em>Wishlist</em></h1>
          <p className="wlp-hero-sub">
            {wishlist.length} {wishlist.length === 1 ? "piece" : "pieces"} saved
          </p>
          <div className="wlp-hero-actions">
            {compareList.length >= 2 && (
              <button className="btn-compare-open" onClick={() => setShowCompare(true)}>
                ⚖️ Compare ({compareList.length}/4)
              </button>
            )}

            {/* ── Google Drive Share Button (shown when wishlist has items) ── */}
            {products.length > 0 && (
              <button className="btn-gdrive" onClick={() => setShowGDrive(true)}>
                <GDriveLogo size={15} />
                Save to Google Drive
              </button>
            )}

            <button className="btn-share" onClick={handleShareWishlist}>
              🔗 Share Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ─────────────────────────────────────────────────── */}
      <div className="wlp-content">
        {products.length === 0 ? (
          <div className="wlp-empty">
            <div className="wlp-empty-icon"><Heart size={36} color="#e05c7a" /></div>
            <h2>Your wishlist is empty</h2>
            <p>Save your favourite designs to revisit them anytime 💖</p>
            <button className="wlp-empty-btn" onClick={() => navigate("/user")}>
              <ShoppingBag size={16} /> Start Shopping
            </button>
          </div>
        ) : (
          <div className="wlp-grid">
            {products.map((prod, cardIdx) => {
              const rawImages = prod.images?.length > 0 ? prod.images : [];
              const images = rawImages.map(resolveImg).filter(Boolean);
              if (!images.length) images.push(getFirstImage(prod));
              const inCompare = !!compareList.find(p => p._id === prod._id);
              return (
                <div key={prod._id} className="wlp-card" style={{ animationDelay: `${cardIdx * 0.05}s` }}>
                  {prod.discount > 0 && (
                    <div className="wlp-disc-badge">{prod.discount}% OFF</div>
                  )}
                  <div className="wlp-img-box">
                    <ImageSlider images={images} productName={prod.name} onClick={() => navigate(`/designs/${prod._id}`)} />
                  </div>
                  <div className="wlp-body">
                    <div className="wlp-name">{prod.name}</div>
                    <div className="wlp-price-row">
                      <span className="wlp-price">₹{(prod.finalPrice || prod.price)?.toLocaleString()}</span>
                      {prod.mrp && prod.mrp > (prod.finalPrice || prod.price) && (
                        <span className="wlp-mrp">₹{prod.mrp.toLocaleString()}</span>
                      )}
                      {prod.discount > 0 && <span className="wlp-disc-pill">{prod.discount}% OFF</span>}
                    </div>
                    <div className="wlp-meta">
                      <span className="wlp-chip">{prod.categoryName}</span>
                      {(prod.fabric || prod.fabricType) && <span className="wlp-chip">{prod.fabric || prod.fabricType}</span>}
                      {prod.sizesCount > 0 && <span className="wlp-chip">{prod.sizesCount} Sizes</span>}
                      {prod.colorsCount > 0 && <span className="wlp-chip">{prod.colorsCount} Colors</span>}
                      {prod.occasion && <span className="wlp-chip">{prod.occasion}</span>}
                      {prod.dressType && <span className="wlp-chip">{prod.dressType}</span>}
                    </div>
                    <div className="wlp-status">
                      {prod.stock !== undefined && (
                        <span className={`wlp-stock ${prod.stock > 0 ? "in" : "out"}`}>
                          {prod.stock > 0 ? "● In Stock" : "● Out of Stock"}
                        </span>
                      )}
                      {prod.averageRating > 0 && (
                        <span className="wlp-rating-badge">
                          <Star size={11} fill="currentColor" />
                          {prod.averageRating}{prod.totalReviews ? ` (${prod.totalReviews})` : ""}
                        </span>
                      )}
                    </div>
                    <div className="wlp-actions">
                      <button className="wlp-btn-rm" onClick={() => removeFromWishlist(prod._id)} title="Remove">
                        <X size={14} />
                      </button>
                      <button className="wlp-btn-cart" onClick={() => handleAddToCart(prod)}>
                        <ShoppingBag size={13} /> Add to Cart
                      </button>
                      <button
                        className={`wlp-btn-cmp ${inCompare ? "active" : ""}`}
                        onClick={() => toggleCompare(prod)}
                        title={inCompare ? "Remove from compare" : "Add to compare"}
                      >
                        {inCompare ? "✅" : "⚖️"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── COMPARE MODAL ────────────────────────────────────────────────── */}
      {showCompare && compareList.length > 0 && (
        <div className="cmp-overlay" onClick={e => e.target === e.currentTarget && setShowCompare(false)}>
          <div className="cmp-modal">
            <div className="cmp-head">
              <div>
                <div className="cmp-head-title">Product <em>Comparison</em></div>
                <div className="cmp-head-sub">{compareList.length} items compared</div>
              </div>
              <div className="cmp-head-actions">
                <button className={`btn-suggest ${suggestLoading ? "loading" : ""}`} onClick={handleSuggest}>
                  <Sparkles size={13} />
                  {suggestLoading ? "Analysing…" : "Suggest Best"}
                </button>
                <button className="btn-cmp-clear" onClick={clearCompare}>Clear</button>
                <button className="btn-cmp-close" onClick={() => setShowCompare(false)}>✕ Close</button>
              </div>
            </div>

            {suggestLoading && (
              <div className="cmp-sug-loading">
                <div className="spin" />
                <span>Analysing price, rating, stock and variety…</span>
              </div>
            )}

            {suggestionResult && !suggestLoading && (
              <div className="cmp-suggestion">
                <div className="cmp-sug-inner">
                  <div className="cmp-sug-trophy"><Trophy size={20} color="#fff" /></div>
                  <div className="cmp-sug-text">
                    <div className="cmp-sug-label">Our Recommendation</div>
                    <div className="cmp-sug-name">{suggestionResult.winner.name}</div>
                    <div className="cmp-sug-reason">{suggestionResult.reason}</div>
                    <div className="cmp-sug-scores">
                      {suggestionResult.scores.map((p, i) => (
                        <span key={p._id} className={`cmp-score-pill ${i === 0 ? "best" : ""}`}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}{" "}
                          {p.name.length > 18 ? p.name.substring(0, 18) + "…" : p.name} — {p._score} pts
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="cmp-table-wrap">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th className="cmp-th-feat">Feature</th>
                    {compareList.map(p => (
                      <th key={p._id} className={`cmp-th-prod ${winnerId === p._id ? "winner" : ""}`}>
                        <div className="cmp-th-img-wrap">
                          {winnerId === p._id && <div className="cmp-winner-crown">👑</div>}
                          <img src={getFirstImage(p)} className="cmp-th-img" alt={p.name} />
                        </div>
                        <div className="cmp-th-name">{p.name.length > 26 ? p.name.substring(0, 26) + "…" : p.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="cmp-td-feat">Final Price</td>
                    {compareList.map(p => {
                      const fp = p.finalPrice || p.price;
                      const minFp = Math.min(...compareList.map(x => x.finalPrice || x.price));
                      const isWin = winnerId === p._id;
                      return (
                        <td key={p._id} className={`cmp-td ${fp === minFp ? "best" : ""} ${isWin ? "winner" : ""}`}>
                          <strong>₹{fp?.toLocaleString()}</strong>
                          {fp === minFp && <div className="cmp-best-tag">✅ Lowest</div>}
                          {isWin && <div className="cmp-win-tag">👑 Winner</div>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr><td className="cmp-td-feat">MRP</td>{compareList.map(p => (<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.mrp?`₹${p.mrp.toLocaleString()}`:"—"}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Discount</td>{compareList.map(p => { const mx=Math.max(...compareList.map(x=>x.discount||0)); return (<td key={p._id} className={`cmp-td ${(p.discount||0)===mx&&mx>0?"best":""} ${winnerId===p._id?"winner":""}`}>{p.discount>0?`${p.discount}% OFF`:"—"}</td>); })}</tr>
                  <tr><td className="cmp-td-feat">Ratings</td>{compareList.map(p => { const mx=Math.max(...compareList.map(x=>x.averageRating||0)); return (<td key={p._id} className={`cmp-td ${p.averageRating===mx&&mx>0?"best":""} ${winnerId===p._id?"winner":""}`}>{p.averageRating?`${p.averageRating}/5 (${p.totalReviews||0})`:"No ratings"}</td>); })}</tr>
                  <tr><td className="cmp-td-feat">Stock</td>{compareList.map(p => (<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}><span className="cmp-stock-pill" style={{background:p.stock>0?"#eafaf1":"#fdf0f0",color:p.stock>0?"#1d8a4a":"#c0392b"}}>{p.stock||0} {p.unit||"pcs"}</span></td>))}</tr>
                  <tr><td className="cmp-td-feat">Category</td>{compareList.map(p => (<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.categoryName||getCategoryName(p.category)}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Fabric</td>{compareList.map(p => (<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.fabric||p.fabricType||"—"}</td>))}</tr>
                  <tr>
                    <td className="cmp-td-feat">Colors</td>
                    {compareList.map(p => (
                      <td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>
                        {Array.isArray(p.color)&&p.color.length>0?(
                          <div className="cmp-color-list">
                            {p.color.slice(0,4).map((hex,i)=>(<div key={i} className="cmp-color-chip"><div className="cmp-color-dot" style={{backgroundColor:hex}}/><span>{(p.colorLabels||[])[i]||hex}</span></div>))}
                            {p.color.length>4&&<span style={{fontSize:10,color:"#aaa"}}>+{p.color.length-4} more</span>}
                          </div>
                        ):"—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="cmp-td-feat">Sizes</td>
                    {compareList.map(p => (
                      <td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>
                        {Array.isArray(p.sizes)&&p.sizes.length>0?(
                          <div className="cmp-size-list">
                            {p.sizes.slice(0,4).map((s,i)=>(<span key={i} className="cmp-size-chip">{s.size}</span>))}
                            {p.sizes.length>4&&<span style={{fontSize:11}}>+{p.sizes.length-4}</span>}
                          </div>
                        ):"—"}
                      </td>
                    ))}
                  </tr>
                  <tr><td className="cmp-td-feat">Dress Type</td>{compareList.map(p=>(<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.dressType||"—"}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Neck Type</td>{compareList.map(p=>(<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.neckType||"—"}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Sleeve</td>{compareList.map(p=>(<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.sleeveType||p.sleeveLength||"—"}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Pattern</td>{compareList.map(p=>(<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.pattern||"—"}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Occasion</td>{compareList.map(p=>(<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.occasion||"—"}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Return Policy</td>{compareList.map(p=>(<td key={p._id} className={`cmp-td ${winnerId===p._id?"winner":""}`}>{p.returnPolicy||"7 Days"}</td>))}</tr>
                  <tr><td className="cmp-td-feat">Description</td>{compareList.map(p=>(<td key={p._id} className={`cmp-td note ${winnerId===p._id?"winner":""}`}>{p.description?p.description.substring(0,120)+"…":"No description"}</td>))}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── GOOGLE DRIVE SHARE MODAL ─────────────────────────────────────── */}
      {showGDrive && (
        <GDriveShareModal
          products={products}
          onClose={() => setShowGDrive(false)}
          backendUrl={BACKEND_URL}
        />
      )}

      <Footer />
    </div>
  );
}
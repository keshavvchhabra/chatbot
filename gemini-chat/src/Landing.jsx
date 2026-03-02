import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const cursorRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const current = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef = useRef(null);
  const chatRef = useRef(null);
  const launchRef = useRef(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [launchVisible, setLaunchVisible] = useState(false);

  // Smooth cursor
  const animate = useCallback(() => {
    current.current.x += (mouse.current.x - current.current.x) * 0.08;
    current.current.y += (mouse.current.y - current.current.y) * 0.08;
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${current.current.x - 10}px, ${current.current.y - 10}px)`;
    }
    if (cursorGlowRef.current) {
      cursorGlowRef.current.style.transform = `translate(${current.current.x - 200}px, ${current.current.y - 200}px)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // Intersection observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === chatRef.current && entry.isIntersecting) setChatVisible(true);
          if (entry.target === launchRef.current && entry.isIntersecting) setLaunchVisible(true);
        });
      },
      { threshold: 0.2 }
    );
    if (chatRef.current) observer.observe(chatRef.current);
    if (launchRef.current) observer.observe(launchRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; overflow: hidden; cursor: none; }

        /* ── CUSTOM CURSOR ── */
        .cursor-dot {
          position: fixed; width: 20px; height: 20px;
          border-radius: 50%; pointer-events: none; z-index: 9999;
          background: white; mix-blend-mode: difference;
          will-change: transform;
        }
        .cursor-glow {
          position: fixed; width: 400px; height: 400px;
          border-radius: 50%; pointer-events: none; z-index: 1;
          background: radial-gradient(circle, rgba(60,120,255,0.18) 0%, rgba(30,60,200,0.08) 40%, transparent 70%);
          will-change: transform; filter: blur(2px);
        }

        /* ── MAIN SCROLL WRAPPER ── */
        .page-scroll {
          position: fixed; inset: 0; z-index: 10;
          overflow-y: scroll; overflow-x: hidden;
          scrollbar-width: none;
          font-family: 'DM Sans', sans-serif;
          color: white;
        }
        .page-scroll::-webkit-scrollbar { display: none; }

        /* ── FIXED BG (behind scroll) ── */
        .bg-fixed {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 120% 80% at 20% 20%, #0c1a6e 0%, #03030f 55%),
                      radial-gradient(ellipse 80% 60% at 80% 80%, #071060 0%, transparent 60%);
        }
        .grid-fixed {
          position: fixed; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%);
        }
        .noise-fixed {
          position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px;
        }
        .orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .orb1 {
          width: 900px; height: 900px; z-index: 1;
          background: radial-gradient(circle, rgba(30,80,255,0.28) 0%, transparent 60%);
          top: -320px; left: -260px;
          animation: orbA 12s ease-in-out infinite alternate;
        }
        .orb2 {
          width: 600px; height: 600px; z-index: 1;
          background: radial-gradient(circle, rgba(80,40,255,0.22) 0%, transparent 65%);
          bottom: -180px; right: -120px;
          animation: orbB 15s ease-in-out infinite alternate;
        }
        .orb3 {
          width: 400px; height: 400px; z-index: 1;
          background: radial-gradient(circle, rgba(0,180,255,0.12) 0%, transparent 65%);
          top: 20%; right: 10%;
          animation: orbA 18s ease-in-out infinite alternate-reverse;
        }
        .orb4 {
          width: 300px; height: 300px; z-index: 1;
          background: radial-gradient(circle, rgba(100,60,255,0.15) 0%, transparent 65%);
          top: 60%; left: 40%;
          animation: orbB 10s ease-in-out infinite alternate;
        }
        @keyframes orbA {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(50px,35px) scale(1.1); }
        }
        @keyframes orbB {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-40px,-30px) scale(1.08); }
        }
        .particles-fixed { position: fixed; inset: 0; z-index: 2; pointer-events: none; overflow: hidden; }
        .particle {
          position: absolute; border-radius: 50%;
          background: rgba(120,180,255,0.6);
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-100vh) translateX(30px) scale(0.5); opacity: 0; }
        }
        .scanline-fixed {
          position: fixed; inset: 0; z-index: 3; pointer-events: none;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px
          );
        }

        /* ── NAV (sticky inside scroll) ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 48px;
          animation: fadeDown 0.8s ease both;
          background: transparent;
        }
        .nav-logo {
          font-weight: 800; font-size: 20px; color: white;
          letter-spacing: 0.2em; text-transform: uppercase;
        }
        .nav-logo .x { color: #4a90ff; text-shadow: 0 0 20px rgba(74,144,255,0.8); }
        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a {
          color: rgba(255,255,255,0.45); text-decoration: none;
          font-size: 14px; font-weight: 400; letter-spacing: 0.03em;
          transition: color 0.2s; position: relative;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
          height: 1px; background: rgba(74,144,255,0.6);
          transform: scaleX(0); transition: transform 0.25s; transform-origin: left;
        }
        .nav-links a:hover { color: rgba(255,255,255,0.9); }
        .nav-links a:hover::after { transform: scaleX(1); }
        .nav-cta {
          background: rgba(255,255,255,0.06); color: white;
          border: 1px solid rgba(255,255,255,0.2); border-radius: 100px;
          padding: 10px 26px; font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.25s; letter-spacing: 0.03em;
          backdrop-filter: blur(12px);
        }
        .nav-cta:hover {
          background: white; color: #02020c; border-color: white;
          box-shadow: 0 0 30px rgba(255,255,255,0.2); transform: scale(1.04);
        }

        /* ── HERO SECTION ── */
        .hero-section {
          position: relative; z-index: 10;
          height: calc(100vh - 88px);
          display: flex; flex-direction: column;
          justify-content: flex-end;
          padding: 0 48px 56px;
          margin-top: -88px; /* pull up behind sticky nav */
        }

        /* BIG TITLE */
        .title-wrap {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          text-align: center; pointer-events: none; user-select: none; width: 100%;
        }
        .title-blur {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(72px, 12.5vw, 168px);
          color: transparent;
          -webkit-text-stroke: 1px rgba(80,150,255,0.15);
          line-height: 1; white-space: nowrap;
          position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
          filter: blur(6px); animation: fadeIn 1.8s ease 0.1s both;
        }
        .title-glow {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(72px, 12.5vw, 168px);
          color: rgba(100,160,255,0.08);
          line-height: 1; white-space: nowrap; position: relative;
          text-shadow:
            0 0 40px rgba(60,120,255,0.6), 0 0 100px rgba(40,80,255,0.35),
            0 0 200px rgba(20,60,255,0.2), 0 0 400px rgba(10,40,200,0.1);
          animation: fadeIn 1s ease 0.3s both;
        }
        .title-solid {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(72px, 12.5vw, 168px);
          color: rgba(200,225,255,0.5); line-height: 1; white-space: nowrap;
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          animation: fadeIn 0.9s ease 0.5s both; mix-blend-mode: screen;
        }
        .title-stroke {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(72px, 12.5vw, 168px);
          color: transparent; -webkit-text-stroke: 1px rgba(150,200,255,0.25);
          line-height: 1; white-space: nowrap;
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          animation: fadeIn 0.9s ease 0.7s both;
        }
        .title-sub-line {
          position: absolute;
          top: calc(50% + clamp(40px,7vw,90px));
          left: 50%; transform: translateX(-50%);
          font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase;
          color: rgba(100,160,255,0.5); white-space: nowrap;
          pointer-events: none; user-select: none; z-index: 10;
          animation: fadeIn 1s ease 1s both; font-weight: 400;
        }
        .title-sub-line::before, .title-sub-line::after {
          content: ''; display: inline-block; width: 40px; height: 1px;
          background: rgba(100,160,255,0.3); vertical-align: middle; margin: 0 16px;
        }

        /* BOTTOM */
        .hero-bottom {
          display: flex; align-items: flex-end; justify-content: space-between;
          position: relative; z-index: 10;
        }
        .tagline {
          font-size: clamp(26px, 3.2vw, 44px); font-weight: 600;
          color: white; line-height: 1.18;
          animation: fadeUp 0.9s ease 0.5s both; letter-spacing: -0.02em;
        }
        .tagline em {
          font-style: normal;
          background: linear-gradient(90deg, #6ab0ff, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .tagline-meta { margin-top: 14px; animation: fadeUp 0.9s ease 0.65s both; }
        .tagline-sub {
          font-size: 13.5px; color: rgba(255,255,255,0.32);
          font-weight: 300; letter-spacing: 0.03em; margin-bottom: 14px;
        }
        .badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge {
          border: 1px solid rgba(255,255,255,0.1); border-radius: 100px;
          padding: 5px 14px; font-size: 11px; color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.04); letter-spacing: 0.04em;
          backdrop-filter: blur(8px);
        }
        .cta-group {
          display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
          animation: fadeUp 0.9s ease 0.72s both;
        }
        .cta-main {
          background: white; color: #02020c; border: none; border-radius: 100px;
          padding: 18px 38px; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          transition: all 0.25s; letter-spacing: 0.01em;
          box-shadow: 0 4px 40px rgba(255,255,255,0.1);
        }
        .cta-main:hover {
          background: #ddeeff; transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 50px rgba(100,180,255,0.25), 0 0 0 4px rgba(255,255,255,0.06);
        }
        .arrow { font-size: 18px; transition: transform 0.25s; display: inline-block; }
        .cta-main:hover .arrow { transform: translate(4px, -4px); }
        .cta-note { font-size: 11.5px; color: rgba(255,255,255,0.2); letter-spacing: 0.04em; }
        .hero-line {
          position: absolute; bottom: 0; left: 48px; right: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(80,140,255,0.3), rgba(150,100,255,0.2), transparent);
          z-index: 10;
        }

        /* Scroll hint */
        .scroll-hint {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.2); font-size: 10px; letter-spacing: 0.15em;
          text-transform: uppercase; position: absolute;
          bottom: 12px; left: 50%; transform: translateX(-50%);
          animation: fadeIn 1s ease 1.4s both; z-index: 20;
        }
        .scroll-arrow {
          width: 18px; height: 18px;
          border-right: 1.5px solid rgba(255,255,255,0.2);
          border-bottom: 1.5px solid rgba(255,255,255,0.2);
          transform: rotate(45deg);
          animation: scrollBounce 1.8s ease-in-out infinite;
        }
        @keyframes scrollBounce {
          0%,100% { transform: rotate(45deg) translateY(0); opacity: 0.3; }
          50%      { transform: rotate(45deg) translateY(6px); opacity: 0.8; }
        }

        /* ── SECTION 2: CHAT REVEAL ── */
        .chat-section {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 44px 80px;
          background: linear-gradient(180deg, transparent 0%, rgba(2,2,12,0.95) 15%, #02020c 100%);
        }

        .reveal-label {
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(100,160,255,0.6); margin-bottom: 16px;
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-label.visible { opacity: 1; transform: translateY(0); }

        .reveal-title {
          font-size: clamp(32px, 5vw, 58px); font-weight: 600;
          text-align: center; line-height: 1.15;
          letter-spacing: -0.02em; margin-bottom: 48px; color: white;
          opacity: 0; transform: translateY(40px);
          transition: opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s;
        }
        .reveal-title.visible { opacity: 1; transform: translateY(0); }
        .reveal-title span {
          background: linear-gradient(90deg, #6ab0ff, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* APEX floating up */
        .apex-float {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(40px, 7vw, 90px);
          color: rgba(140,190,255,0.12);
          text-shadow: 0 0 40px rgba(80,150,255,0.4), 0 0 100px rgba(40,100,255,0.2);
          text-align: center; margin-bottom: 40px;
          opacity: 0; transform: translateY(80px);
          transition: opacity 1s ease 0.2s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.2s;
          pointer-events: none; user-select: none;
        }
        .apex-float.visible {
          opacity: 1; transform: translateY(0);
          animation: apexGlow 3s ease-in-out 1.2s infinite alternate;
        }
        @keyframes apexGlow {
          from { text-shadow: 0 0 40px rgba(80,150,255,0.4), 0 0 100px rgba(40,100,255,0.2); color: rgba(140,190,255,0.12); }
          to   { text-shadow: 0 0 80px rgba(80,150,255,0.7), 0 0 200px rgba(40,100,255,0.4); color: rgba(180,220,255,0.22); }
        }

        /* CHAT PREVIEW */
        .chat-preview {
          width: 100%; max-width: 660px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 80px rgba(0,0,20,0.6), 0 0 0 1px rgba(80,140,255,0.08);
          opacity: 0; transform: translateY(60px);
          transition: opacity 0.9s ease 0.35s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s;
        }
        .chat-preview.visible { opacity: 1; transform: translateY(0); }

        .preview-header {
          padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.02);
        }
        .preview-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #4a90ff;
          box-shadow: 0 0 8px rgba(74,144,255,0.8);
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%,100% { box-shadow: 0 0 8px rgba(74,144,255,0.8); }
          50%      { box-shadow: 0 0 18px rgba(74,144,255,0.4); }
        }
        .preview-header-text { font-size: 13px; color: rgba(255,255,255,0.5); }
        .preview-body { padding: 24px 20px; display: flex; flex-direction: column; gap: 18px; }
        .preview-msg { display: flex; gap: 12px; align-items: flex-start; }
        .preview-msg.user { flex-direction: row-reverse; }
        .preview-avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
        }
        .preview-avatar.ai { background: linear-gradient(135deg,#1a40dd,#0a20a0); box-shadow: 0 2px 10px rgba(26,64,221,0.4); color: white; }
        .preview-avatar.user { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
        .preview-bubble { padding: 10px 14px; border-radius: 12px; font-size: 13.5px; line-height: 1.6; max-width: 75%; color: rgba(255,255,255,0.82); }
        .preview-bubble.ai { background: transparent; padding-left: 0; }
        .preview-bubble.user { background: rgba(20,60,200,0.22); border: 1px solid rgba(80,140,255,0.18); border-bottom-right-radius: 4px; }
        .preview-input {
          margin: 0 20px 20px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
          color: rgba(255,255,255,0.2); font-size: 13.5px; cursor: pointer;
        }
        .preview-send {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg,#2050cc,#1030a0);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(30,70,200,0.4);
        }

        /* ── SECTION 3: LAUNCH ── */
        .launch-section {
          position: relative; z-index: 10; min-height: 60vh;
          background: #02020c;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 24px;
          padding: 60px 44px;
        }
        .launch-section::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(30,60,200,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .launch-title {
          font-size: clamp(28px, 4vw, 50px); font-weight: 600;
          text-align: center; letter-spacing: -0.02em; line-height: 1.2; color: white;
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
          position: relative; z-index: 2;
        }
        .launch-title.visible { opacity: 1; transform: translateY(0); }
        .launch-btn {
          background: white; color: #02020c; border: none; border-radius: 100px;
          padding: 18px 44px; font-size: 16px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 30px rgba(255,255,255,0.1);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s, background 0.2s, box-shadow 0.2s;
          position: relative; z-index: 2;
        }
        .launch-btn.visible { opacity: 1; transform: translateY(0); }
        .launch-btn:hover { background: #ddeeff; box-shadow: 0 8px 40px rgba(100,180,255,0.25); }

        /* ── ANIMATIONS ── */
        @keyframes fadeDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* Fixed BG layers — always behind */}
      <div className="bg-fixed" />
      <div className="grid-fixed" />
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />
      <div className="orb orb4" />
      <div className="noise-fixed" />
      <div className="scanline-fixed" />
      <div className="particles-fixed">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{
            width: Math.random() * 3 + 1 + "px",
            height: Math.random() * 3 + 1 + "px",
            left: Math.random() * 100 + "%",
            bottom: "-10px",
            animationDuration: (Math.random() * 12 + 8) + "s",
            animationDelay: (Math.random() * 10) + "s",
          }} />
        ))}
      </div>

      {/* Cursor */}
      <div ref={cursorGlowRef} className="cursor-glow" />
      <div ref={cursorRef} className="cursor-dot" />

      {/* SCROLLABLE PAGE */}
      <div className="page-scroll">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">APE<span className="x">X</span></div>
          <ul className="nav-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
          <button className="nav-cta" onClick={() => navigate("/chat")}>Launch App</button>
        </nav>

        {/* HERO */}
        <section className="hero-section">
          <div className="title-wrap">
            <div className="title-blur">APEX</div>
            <div className="title-glow">APEX</div>
            <div className="title-solid">APEX</div>
            <div className="title-stroke">APEX</div>
          </div>
          <div className="title-sub-line">AI Assistant</div>

          <div className="hero-bottom">
            <div>
              <div className="tagline">Your smart help<br />for <em>any request.</em></div>
              <div className="tagline-meta">
                <div className="tagline-sub">Powered by Gemini · Always available · Zero wait</div>
                <div className="badges">
                  <span className="badge">✦ AI-Powered</span>
                  <span className="badge">⚡ Real-time</span>
                  <span className="badge">🔒 Private</span>
                  <span className="badge">∞ Unlimited</span>
                </div>
              </div>
            </div>
            <div className="cta-group">
              <button className="cta-main" onClick={() => navigate("/chat")}>
                Try Apex for free <span className="arrow">↗</span>
              </button>
              <span className="cta-note">No signup · No credit card</span>
            </div>
          </div>
          <div className="hero-line" />

          <div className="scroll-hint">
            <span>Scroll</span>
            <div className="scroll-arrow" />
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="chat-section" ref={chatRef}>
          <div className={`reveal-label ${chatVisible ? "visible" : ""}`}>Meet your assistant</div>
          <div className={`reveal-title ${chatVisible ? "visible" : ""}`}>
            Ask anything.<br /><span>Get answers instantly.</span>
          </div>
          <div className={`apex-float ${chatVisible ? "visible" : ""}`}>APEX</div>
          <div className={`chat-preview ${chatVisible ? "visible" : ""}`}>
            <div className="preview-header">
              <div className="preview-dot" />
              <span className="preview-header-text">Apex AI · Online</span>
            </div>
            <div className="preview-body">
              <div className="preview-msg user">
                <div className="preview-avatar user">U</div>
                <div className="preview-bubble user">What can you help me with?</div>
              </div>
              <div className="preview-msg">
                <div className="preview-avatar ai">A</div>
                <div className="preview-bubble ai">I can help you write, code, explain, translate, brainstorm, and much more — instantly, anytime you need.</div>
              </div>
            </div>
            <div className="preview-input" onClick={() => navigate("/chat")}>
              <span>Message Apex...</span>
              <div className="preview-send">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="launch-section" ref={launchRef}>
          <div className={`launch-title ${launchVisible ? "visible" : ""}`}>
            Ready to experience<br />the future of AI?
          </div>
          <button className={`launch-btn ${launchVisible ? "visible" : ""}`} onClick={() => navigate("/chat")}>
            Launch Apex ↗
          </button>
        </section>

      </div>
    </>
  );
}
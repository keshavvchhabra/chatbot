import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const cursorRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const current = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef = useRef(null);

  // Smooth cursor with lerp — no lag, butter smooth
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; overflow: hidden; cursor: none; }

        /* ── ROOT ── */
        .land {
          height: 100vh; width: 100vw;
          background: #02020c;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden; position: relative;
          display: flex; flex-direction: column;
        }

        /* ── CUSTOM CURSOR ── */
        .cursor-dot {
          position: fixed; width: 20px; height: 20px;
          border-radius: 50%; pointer-events: none; z-index: 9999;
          background: white;
          mix-blend-mode: difference;
          transition: width 0.2s, height 0.2s;
          will-change: transform;
        }
        .cursor-glow {
          position: fixed; width: 400px; height: 400px;
          border-radius: 50%; pointer-events: none; z-index: 1;
          background: radial-gradient(circle, rgba(60,120,255,0.18) 0%, rgba(30,60,200,0.08) 40%, transparent 70%);
          will-change: transform;
          filter: blur(2px);
        }

        /* ── BACKGROUNDS ── */
        .bg-base {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 120% 80% at 20% 20%, #0c1a6e 0%, #03030f 55%),
                      radial-gradient(ellipse 80% 60% at 80% 80%, #071060 0%, transparent 60%);
        }

        /* Grid */
        .grid {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%);
        }

        /* Noise */
        .noise {
          position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px;
        }

        /* Orbs */
        .orb { position: absolute; border-radius: 50%; pointer-events: none; }
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

        /* Floating particles */
        .particles { position: absolute; inset: 0; z-index: 2; pointer-events: none; overflow: hidden; }
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

        /* Scanline */
        .scanline {
          position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.03) 3px,
            rgba(0,0,0,0.03) 4px
          );
          animation: scanMove 8s linear infinite;
        }
        @keyframes scanMove {
          from { background-position: 0 0; }
          to   { background-position: 0 100vh; }
        }

        /* ── NAV ── */
        .nav {
          position: relative; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 48px;
          animation: fadeDown 0.8s ease both;
          background: transparent;
        }
        .nav-logo {
          font-weight: 800; font-size: 20px; color: white;
          letter-spacing: 0.2em; text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-logo .x { color: #4a90ff; text-shadow: 0 0 20px rgba(74,144,255,0.8); }
        .nav-links { display: flex; gap: 36px; list-style: none; }
        .nav-links a {
          color: rgba(255,255,255,0.45); text-decoration: none;
          font-size: 14px; font-weight: 400; letter-spacing: 0.03em;
          transition: color 0.2s;
          position: relative;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
          height: 1px; background: rgba(74,144,255,0.6);
          transform: scaleX(0); transition: transform 0.25s;
          transform-origin: left;
        }
        .nav-links a:hover { color: rgba(255,255,255,0.9); }
        .nav-links a:hover::after { transform: scaleX(1); }
        .nav-cta {
          background: rgba(255,255,255,0.06);
          color: white; border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; padding: 10px 26px;
          font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: none;
          transition: all 0.25s; letter-spacing: 0.03em;
          backdrop-filter: blur(12px);
        }
        .nav-cta:hover {
          background: white; color: #02020c;
          border-color: white;
          box-shadow: 0 0 30px rgba(255,255,255,0.2);
          transform: scale(1.04);
        }

        /* ── HERO ── */
        .hero {
          position: relative; z-index: 10;
          flex: 1; display: flex; flex-direction: column;
          justify-content: flex-end;
          padding: 0 48px 56px;
        }

        /* BIG TITLE */
        .title-wrap {
          position: absolute; top: 46%; left: 50%;
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
          filter: blur(6px);
          animation: fadeIn 1.8s ease 0.1s both;
        }
        .title-glow {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(72px, 12.5vw, 168px);
          color: rgba(100,160,255,0.08);
          line-height: 1; white-space: nowrap;
          position: relative;
          text-shadow:
            0 0 40px rgba(60,120,255,0.6),
            0 0 100px rgba(40,80,255,0.35),
            0 0 200px rgba(20,60,255,0.2),
            0 0 400px rgba(10,40,200,0.1);
          animation: fadeIn 1s ease 0.3s both;
        }
        .title-solid {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(72px, 12.5vw, 168px);
          color: rgba(200,225,255,0.5);
          line-height: 1; white-space: nowrap;
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          animation: fadeIn 0.9s ease 0.5s both;
          mix-blend-mode: screen;
        }
        .title-stroke {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(72px, 12.5vw, 168px);
          color: transparent;
          -webkit-text-stroke: 1px rgba(150,200,255,0.25);
          line-height: 1; white-space: nowrap;
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          animation: fadeIn 0.9s ease 0.7s both;
        }

        /* Subtitle under title */
        .title-sub-line {
          position: absolute; top: calc(48% + clamp(40px, 7vw, 90px));
          left: 50%; transform: translateX(-50%);
          font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase;
          color: rgba(100,160,255,0.5); white-space: nowrap;
          pointer-events: none; user-select: none; z-index: 10;
          animation: fadeIn 1s ease 1s both;
          font-weight: 400;
        }
        .title-sub-line::before,
        .title-sub-line::after {
          content: ''; display: inline-block;
          width: 40px; height: 1px;
          background: rgba(100,160,255,0.3);
          vertical-align: middle; margin: 0 16px;
        }

        /* FEATURE CARDS - floating mid-page */
        .feature-cards {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, 10%);
          display: flex; gap: 14px;
          z-index: 10; pointer-events: none;
          animation: fadeUp 1s ease 1.1s both;
        }
        .fcard {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 14px 18px;
          min-width: 130px; text-align: center;
          backdrop-filter: blur(16px);
        }
        .fcard-icon { font-size: 20px; margin-bottom: 6px; }
        .fcard-label { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.05em; }

        /* BOTTOM BAR */
        .hero-bottom {
          display: flex; align-items: flex-end; justify-content: space-between;
          position: relative; z-index: 10;
        }
        .tagline {
          font-size: clamp(26px, 3.2vw, 44px);
          font-weight: 600; color: white; line-height: 1.18;
          animation: fadeUp 0.9s ease 0.5s both;
          letter-spacing: -0.02em;
        }
        .tagline em {
          font-style: normal;
          background: linear-gradient(90deg, #6ab0ff, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .tagline-meta {
          margin-top: 14px;
          animation: fadeUp 0.9s ease 0.65s both;
        }
        .tagline-sub {
          font-size: 13.5px; color: rgba(255,255,255,0.32);
          font-weight: 300; letter-spacing: 0.03em; margin-bottom: 14px;
        }
        .badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 5px 14px;
          font-size: 11px; color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.04);
          letter-spacing: 0.04em;
          backdrop-filter: blur(8px);
        }

        .cta-group {
          display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
          animation: fadeUp 0.9s ease 0.72s both;
        }
        .cta-main {
          background: white; color: #02020c;
          border: none; border-radius: 100px;
          padding: 18px 38px; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: none;
          display: flex; align-items: center; gap: 10px;
          transition: all 0.25s; letter-spacing: 0.01em;
          box-shadow: 0 4px 40px rgba(255,255,255,0.1), 0 0 0 0 rgba(255,255,255,0);
        }
        .cta-main:hover {
          background: #ddeeff; transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 50px rgba(100,180,255,0.25), 0 0 0 4px rgba(255,255,255,0.06);
        }
        .arrow { font-size: 18px; transition: transform 0.25s; display: inline-block; }
        .cta-main:hover .arrow { transform: translate(4px, -4px); }
        .cta-note { font-size: 11.5px; color: rgba(255,255,255,0.2); letter-spacing: 0.04em; }

        /* BOTTOM BORDER LINE */
        .hero-line {
          position: absolute; bottom: 0; left: 48px; right: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(80,140,255,0.3), rgba(150,100,255,0.2), transparent);
          z-index: 10;
        }

        /* ANIMATIONS */
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
      `}</style>

      <div className="land">

        {/* BG layers */}
        <div className="bg-base" />
        <div className="grid" />
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="orb orb4" />
        <div className="noise" />
        <div className="scanline" />

        {/* Floating particles */}
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="particle" style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              bottom: "-10px",
              animationDuration: (Math.random() * 12 + 8) + "s",
              animationDelay: (Math.random() * 10) + "s",
              opacity: Math.random() * 0.6 + 0.2,
            }} />
          ))}
        </div>

        {/* Smooth cursor glow */}
        <div ref={cursorGlowRef} className="cursor-glow" />
        {/* Cursor dot */}
        <div ref={cursorRef} className="cursor-dot" />

        {/* NAV — fully transparent */}
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
        <div className="hero">

          {/* Big layered title */}
          <div className="title-wrap">
            <div className="title-blur">APEX</div>
            <div className="title-glow">APEX</div>
            <div className="title-solid">APEX</div>
            <div className="title-stroke">APEX</div>
          </div>

          {/* Sub-label under title */}
          <div className="title-sub-line">AI Assistant</div>

          {/* Feature floating cards */}
          <div className="feature-cards">
            {[
              { icon: "⚡", label: "Instant" },
              { icon: "🧠", label: "Smart" },
              { icon: "🔒", label: "Private" },
              { icon: "🌐", label: "Multilingual" },
            ].map((f) => (
              <div key={f.label} className="fcard">
                <div className="fcard-icon">{f.icon}</div>
                <div className="fcard-label">{f.label}</div>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="hero-bottom">
            <div>
              <div className="tagline">
                Your smart help<br />for <em>any request.</em>
              </div>
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
        </div>
      </div>
    </>
  );
}
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000/chat";

const SUGGESTIONS = [
  { icon: "✍️", title: "Write something", sub: "Essays, emails, or stories" },
  { icon: "🧠", title: "Explain a concept", sub: "From simple to technical" },
  { icon: "💻", title: "Debug my code", sub: "Find and fix issues" },
  { icon: "🌍", title: "Translate text", sub: "Into any language" },
];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "rgba(100,160,255,0.8)",
          display: "inline-block",
          animation: `bounce 1.2s ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Avatar({ role }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: role === "ai"
        ? "linear-gradient(135deg, #1a40dd, #0a20a0)"
        : "rgba(255,255,255,0.08)",
      border: role === "ai" ? "none" : "1px solid rgba(255,255,255,0.1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: "white", marginTop: 2,
      boxShadow: role === "ai" ? "0 2px 12px rgba(30,80,255,0.4)" : "none",
    }}>
      {role === "ai" ? "A" : "U"}
    </div>
  );
}

function MessageRow({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", gap: 13, padding: "7px 0",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "fadeUp 0.3s ease",
    }}>
      <Avatar role={msg.role} />
      <div style={{
        maxWidth: "82%", display: "flex", flexDirection: "column",
        gap: 5, alignItems: isUser ? "flex-end" : "flex-start",
      }}>
        <div style={{
          padding: isUser ? "11px 16px" : "11px 0",
          borderRadius: 14,
          borderBottomRightRadius: isUser ? 4 : 14,
          borderBottomLeftRadius: isUser ? 14 : 4,
          background: isUser ? "rgba(20,60,200,0.25)" : "transparent",
          border: isUser ? "1px solid rgba(80,140,255,0.2)" : "none",
          fontSize: 14.5, lineHeight: 1.68,
          color: "rgba(255,255,255,0.88)", whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.typing ? <TypingDots /> : msg.text}
        </div>
        {!msg.typing && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", padding: "0 2px" }}>
            {formatTime(msg.time)}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ icon, title, sub, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(20,60,200,0.2)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hover ? "rgba(80,140,255,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 14, padding: "15px 17px",
        cursor: "pointer", textAlign: "left", transition: "all 0.2s",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4, color: "rgba(255,255,255,0.85)" }}>{icon} {title}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{sub}</div>
    </div>
  );
}

function HistoryItem({ item, active }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "9px 14px", borderRadius: 8, fontSize: 13,
        color: active || hover ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
        background: active || hover ? "rgba(255,255,255,0.06)" : "transparent",
        cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis", transition: "all 0.15s",
        borderLeft: active ? "2px solid rgba(80,140,255,0.6)" : "2px solid transparent",
      }}
    >
      {item.label}
    </div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    if (!activeChatId) {
      const id = Date.now();
      setActiveChatId(id);
      setHistory((h) => [{ id, label: text.slice(0, 44) + (text.length > 44 ? "…" : "") }, ...h]);
    }

    const userMsg = { id: Date.now(), role: "user", text, time: new Date() };
    const typingMsg = { id: "typing", role: "ai", typing: true, time: new Date() };
    setMessages((m) => [...m, userMsg, typingMsg]);
    setLoading(true);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((m) => [
        ...m.filter((x) => x.id !== "typing"),
        { id: Date.now() + 1, role: "ai", text: data.reply || "No response.", time: new Date() },
      ]);
    } catch {
      setMessages((m) => [
        ...m.filter((x) => x.id !== "typing"),
        { id: Date.now() + 1, role: "ai", text: "⚠️ Could not reach the backend. Make sure your server is running on port 3000.", time: new Date() },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, activeChatId]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const S = {
    // shared tokens
    bg: "#03030f",
    sidebar: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.07)",
    accent: "#3060dd",
    text: "rgba(255,255,255,0.85)",
    muted: "rgba(255,255,255,0.3)",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        @keyframes bounce {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30% { transform:translateY(-6px); opacity:1; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }

        .chat-root {
          display: flex; height: 100vh; overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          background: #03030f; color: rgba(255,255,255,0.85);
          position: relative;
        }

        /* BG orbs for chat */
        .chat-orb {
          position: fixed; border-radius: 50%;
          pointer-events: none; z-index: 0;
        }
        .chat-orb1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(15,45,200,0.22) 0%, transparent 65%);
          top: -150px; left: -100px;
          animation: float1 10s ease-in-out infinite alternate;
        }
        .chat-orb2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(10,35,180,0.18) 0%, transparent 65%);
          bottom: -80px; right: -60px;
          animation: float2 13s ease-in-out infinite alternate;
        }
        @keyframes float1 { from{transform:translate(0,0)} to{transform:translate(30px,20px)} }
        @keyframes float2 { from{transform:translate(0,0)} to{transform:translate(-25px,-20px)} }

        /* SIDEBAR */
        .sidebar {
          width: 256px; flex-shrink: 0;
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          padding: 14px; gap: 6px;
          position: relative; z-index: 5;
          backdrop-filter: blur(20px);
        }

        .sb-btn {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 13px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.75); font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; cursor: pointer; transition: all 0.15s;
          text-align: left;
        }
        .sb-btn:hover {
          background: rgba(255,255,255,0.06);
          color: white; border-color: rgba(255,255,255,0.15);
        }
        .sb-btn.ghost {
          color: rgba(255,255,255,0.3);
          border-color: transparent; font-size: 13px;
        }
        .sb-btn.ghost:hover { color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.04); }

        .sb-label {
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
          padding: 8px 13px 4px;
        }

        /* MAIN */
        .chat-main {
          flex: 1; display: flex; flex-direction: column;
          overflow: hidden; position: relative; z-index: 5;
        }

        /* HEADER */
        .chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 26px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          background: rgba(3,3,15,0.6);
          flex-shrink: 0;
        }
        .model-pill {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 7px 14px;
          font-size: 13px; color: rgba(255,255,255,0.75);
          cursor: default; letter-spacing: 0.02em;
        }
        .model-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4080ff;
          box-shadow: 0 0 6px rgba(64,128,255,0.8);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 6px rgba(64,128,255,0.8); }
          50% { opacity:0.7; box-shadow: 0 0 12px rgba(64,128,255,0.4); }
        }

        /* MESSAGES */
        .messages-scroll {
          flex: 1; overflow-y: auto; padding: 28px 0;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .messages-scroll::-webkit-scrollbar { width: 5px; }
        .messages-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

        .messages-inner { max-width: 720px; margin: 0 auto; padding: 0 28px; }

        /* WELCOME */
        .welcome {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; min-height: 60vh; text-align: center;
          padding: 40px; animation: fadeIn 0.6s ease;
        }
        .welcome-icon {
          width: 54px; height: 54px; border-radius: 16px;
          background: linear-gradient(135deg, #1a40dd 0%, #0a1a8a 100%);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          box-shadow: 0 4px 30px rgba(26,64,221,0.4), 0 0 60px rgba(26,64,221,0.15);
        }
        .welcome h1 { font-size: 27px; font-weight: 600; margin-bottom: 10px; color: white; }
        .welcome p { font-size: 14.5px; color: rgba(255,255,255,0.35); max-width: 340px; line-height: 1.7; }
        .suggestions-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          margin-top: 30px; width: 100%; max-width: 520px;
        }

        /* INPUT */
        .input-area {
          padding: 16px 26px 22px; flex-shrink: 0;
          background: rgba(3,3,15,0.5); backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .input-box {
          max-width: 720px; margin: 0 auto;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          display: flex; align-items: flex-end; gap: 10px;
          padding: 11px 12px 11px 18px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-box:focus-within {
          border-color: rgba(64,128,255,0.35);
          box-shadow: 0 0 0 3px rgba(40,100,255,0.08);
        }
        .input-box textarea {
          flex: 1; background: transparent; border: none; outline: none;
          color: rgba(255,255,255,0.85); font-family: 'DM Sans', sans-serif;
          font-size: 14.5px; line-height: 1.5; resize: none;
          max-height: 160px; min-height: 24px;
          scrollbar-width: none;
        }
        .input-box textarea::placeholder { color: rgba(255,255,255,0.22); }
        .input-box textarea::-webkit-scrollbar { display: none; }

        .send-btn {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #2050cc, #1030a0);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(30,70,200,0.4);
        }
        .send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2860dd, #1540bb);
          transform: scale(1.06);
          box-shadow: 0 4px 16px rgba(40,90,220,0.5);
        }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .input-footer {
          text-align: center; font-size: 11px; color: rgba(255,255,255,0.18);
          margin-top: 10px; max-width: 720px; margin-left: auto; margin-right: auto;
          letter-spacing: 0.03em;
        }

        /* SIDEBAR FOOTER */
        .sb-footer {
          margin-top: auto; padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .profile-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 9px; cursor: pointer;
          transition: background 0.15s;
        }
        .profile-row:hover { background: rgba(255,255,255,0.05); }
        .profile-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #1a40dd, #0a20a0);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white; flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(26,64,221,0.4);
        }
      `}</style>

      <div className="chat-root">
        {/* BG */}
        <div className="chat-orb chat-orb1" />
        <div className="chat-orb chat-orb2" />

        {/* SIDEBAR */}
        <aside className="sidebar">
          <button className="sb-btn ghost" onClick={() => navigate("/")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>

          <button className="sb-btn" onClick={startNewChat}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Chat
          </button>

          {history.length > 0 && (
            <>
              <div className="sb-label">Recent</div>
              {history.map((h) => (
                <HistoryItem key={h.id} item={h} active={activeChatId === h.id} />
              ))}
            </>
          )}

          <div className="sb-footer">
            <div className="profile-row">
              <div className="profile-avatar">U</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>You</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>Free plan</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <div className="model-pill">
              <div className="model-dot" />
              Apex AI
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ marginLeft: 2 }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>
              {messages.length > 0 ? `${messages.filter(m => !m.typing).length} messages` : "New conversation"}
            </div>
          </div>

          {/* Messages */}
          <div className="messages-scroll">
            <div className="messages-inner">
              {messages.length === 0 ? (
                <div className="welcome">
                  <div className="welcome-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <h1>How can I help you?</h1>
                  <p>Ask me anything — I'm Apex, your AI assistant powered by Gemini.</p>
                  <div className="suggestions-grid">
                    {SUGGESTIONS.map((s) => (
                      <SuggestionCard key={s.title} {...s} onClick={() => { setInput(s.title); textareaRef.current?.focus(); }} />
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => <MessageRow key={msg.id} msg={msg} />)
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-box">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKey}
                placeholder="Message Apex..."
                rows={1}
              />
              <button
                className="send-btn"
                onClick={send}
                disabled={!input.trim() || loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <div className="input-footer">Apex · AI responses may be inaccurate</div>
          </div>
        </main>
      </div>
    </>
  );
}
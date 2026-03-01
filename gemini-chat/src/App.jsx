import { useState, useRef, useEffect, useCallback } from "react";

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
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#10a37f",
            display: "inline-block",
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Avatar({ role }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: role === "ai" ? "#10a37f" : "#2a2a2a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 600, color: "white", marginTop: 2,
    }}>
      {role === "ai" ? "G" : "U"}
    </div>
  );
}

function MessageRow({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", gap: 14, padding: "8px 0",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "fadeUp 0.3s ease",
    }}>
      <Avatar role={msg.role} />
      <div style={{
        maxWidth: "85%", display: "flex", flexDirection: "column",
        gap: 5, alignItems: isUser ? "flex-end" : "flex-start",
      }}>
        <div style={{
          padding: "11px 15px",
          borderRadius: 16,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
          background: isUser ? "#1e1e1e" : "transparent",
          border: isUser ? "1px solid #2a2a2a" : "none",
          fontSize: 14.5, lineHeight: 1.65,
          color: "#e8e8e8", whiteSpace: "pre-wrap", wordBreak: "break-word",
          paddingLeft: isUser ? 15 : 0,
        }}>
          {msg.typing ? <TypingDots /> : msg.text}
        </div>
        {!msg.typing && (
          <div style={{ fontSize: 11, color: "#555", padding: "0 4px" }}>
            {formatTime(msg.time)}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ item, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "9px 14px", borderRadius: 8,
        fontSize: 13.5, color: active || hover ? "#e8e8e8" : "#666",
        background: active || hover ? "#1a1a1a" : "transparent",
        cursor: "pointer", whiteSpace: "nowrap",
        overflow: "hidden", textOverflow: "ellipsis",
        transition: "all 0.15s",
      }}
    >
      {item.label}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen] = useState(true);
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

  const startNewChat = useCallback(() => {
    setMessages([]);
    setActiveChatId(null);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Add to history
    if (!activeChatId) {
      const id = Date.now();
      setActiveChatId(id);
      setHistory((h) => [{ id, label: text.slice(0, 42) + (text.length > 42 ? "…" : "") }, ...h]);
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
      const reply = data.reply || "No response.";
      setMessages((m) => [
        ...m.filter((x) => x.id !== "typing"),
        { id: Date.now() + 1, role: "ai", text: reply, time: new Date() },
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const applySuggestion = (title) => {
    setInput(title);
    textareaRef.current?.focus();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d0d; color: #e8e8e8; font-family: 'Sora', sans-serif; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Sora', sans-serif" }}>

        {/* SIDEBAR */}
        {sidebarOpen && (
          <aside style={{
            width: 260, background: "#111", borderRight: "1px solid #1f1f1f",
            display: "flex", flexDirection: "column", padding: 12, gap: 8, flexShrink: 0,
          }}>
            {/* New Chat */}
            <button
              onClick={startNewChat}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 10,
                border: "1px solid #2a2a2a", background: "transparent",
                color: "#e8e8e8", fontFamily: "'Sora', sans-serif",
                fontSize: 14, cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New chat
            </button>

            {history.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 8px 2px" }}>
                  Recent
                </div>
                {history.map((h) => (
                  <HistoryItem key={h.id} item={h} active={activeChatId === h.id} onClick={() => {}} />
                ))}
              </>
            )}

            {/* Footer */}
            <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #1f1f1f" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#10a37f",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: "white",
                }}>U</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>You</span>
                  <span style={{ fontSize: 11, color: "#555" }}>Free plan</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* MAIN */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #1f1f1f", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 8, padding: "7px 12px", fontSize: 13.5, cursor: "default",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10a37f" }} />
              Gemini Flash
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{ marginLeft: 2 }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 0" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

              {messages.length === 0 ? (
                /* WELCOME */
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", minHeight: "60vh", textAlign: "center",
                  padding: 40, animation: "fadeUp 0.5s ease",
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "linear-gradient(135deg, #10a37f, #0a7a5e)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20, boxShadow: "0 4px 24px rgba(16,163,127,0.25)",
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>How can I help you?</h1>
                  <p style={{ fontSize: 15, color: "#666", maxWidth: 360, lineHeight: 1.65 }}>
                    Powered by Gemini. Ask me anything — I'm here to help.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 32, width: "100%", maxWidth: 520 }}>
                    {SUGGESTIONS.map((s) => (
                      <SuggestionCard key={s.title} {...s} onClick={() => applySuggestion(s.title)} />
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
          <div style={{ padding: "16px 24px 20px", flexShrink: 0 }}>
            <div style={{
              maxWidth: 720, margin: "0 auto",
              background: "#1c1c1c", border: `1px solid ${loading ? "#3a3a3a" : "#2a2a2a"}`,
              borderRadius: 16, display: "flex", alignItems: "flex-end",
              gap: 10, padding: "10px 12px 10px 16px",
              boxShadow: loading ? "0 0 0 3px rgba(16,163,127,0.08)" : "none",
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKey}
                placeholder="Message Gemini..."
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e8e8e8", fontFamily: "'Sora', sans-serif", fontSize: 14.5,
                  lineHeight: 1.5, resize: "none", maxHeight: 160, minHeight: 24,
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: !input.trim() || loading ? "#1f6b55" : "#10a37f",
                  border: "none", cursor: !input.trim() || loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: !input.trim() || loading ? 0.5 : 1,
                  transition: "all 0.15s", flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: 11.5, color: "#444", marginTop: 10, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
              GeminiChat · responses may be inaccurate
            </div>
          </div>
        </main>
      </div>
    </>
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
        background: hover ? "#1f1f1f" : "#1a1a1a",
        border: `1px solid ${hover ? "#3a3a3a" : "#2a2a2a"}`,
        borderRadius: 12, padding: "14px 16px",
        cursor: "pointer", textAlign: "left",
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>{icon} {title}</div>
      <div style={{ fontSize: 12, color: "#555" }}>{sub}</div>
    </div>
  );
}
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import ReactMarkdown from "react-markdown";
import {
  Eye,
  EyeOff,
  LogOut,
  MessageCircle,
  Phone,
  PhoneOff,
  Send,
  Sparkles,
  X,
  ChevronDown,
  KeyRound,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ChatRole = "user" | "assistant";

interface Message {
  id: string;
  role: ChatRole;
  content: string;
  ts: Date;
}

interface ChatWidgetProps {
  agentName?: string;
  description?: string;
  apiBase?: string;
  vapiPublicKey?: string;
  vapiAssistantId?: string;
}

interface StudentInfo {
  roll_no: string;
  name: string;
  program: string;
  section: string;
}

interface StoredSession {
  token: string;
  student: StudentInfo;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SESSION_KEY = "kfueit_session";

const QUICK_PROMPTS = [
  "What is my attendance?",
  "Show my transcript",
  "What are my current courses?",
  "What is the KFUEIT attendance policy?",
];

function makeId() {
  return typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random()}`;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="cw-typing">
      <span />
      <span />
      <span />
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`cw-row cw-row--${msg.role}`}>
      {!isUser && (
        <div className="cw-avatar">
          <Sparkles size={13} />
        </div>
      )}
      <div className={`cw-bubble cw-bubble--${msg.role}`}>
        {isUser ? (
          <p className="cw-bubble-text">{msg.content}</p>
        ) : (
          <div className="cw-bubble-text cw-markdown">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        <span className="cw-ts">{formatTime(msg.ts)}</span>
      </div>
    </div>
  );
}

// ── Login screen ──────────────────────────────────────────────────────────────

interface LoginScreenProps {
  apiBase: string;
  onSuccess: (session: StoredSession) => void;
}

function LoginScreen({ apiBase, onSuccess }: LoginScreenProps) {
  const [rollInput, setRollInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rollRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    rollRef.current?.focus();
  }, []);

  async function handleSubmit() {
    const roll_no = rollInput.trim().toUpperCase();
    const password = passwordInput.trim();
    if (!roll_no || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_no, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
      } else {
        onSuccess({ token: data.token, student: data.student });
      }
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function onRollKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") passwordRef.current?.focus();
  }

  function onPasswordKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="cw-login">
      <div className="cw-login-icon">
        <KeyRound size={26} />
      </div>
      <p className="cw-login-title">Student Login</p>
      <p className="cw-login-sub">
        Sign in with your roll number and password
      </p>

      <div className="cw-login-fields">
        {/* Roll number */}
        <div className="cw-field-group">
          <label className="cw-field-label">Roll Number</label>
          <input
            ref={rollRef}
            className="cw-field-input"
            value={rollInput}
            onChange={(e) => setRollInput(e.target.value)}
            onKeyDown={onRollKeyDown}
            placeholder="e.g. COSC221103029"
            disabled={loading}
            autoComplete="username"
            style={{ textTransform: "uppercase" }}
          />
        </div>

        {/* Password */}
        <div className="cw-field-group">
          <label className="cw-field-label">Password</label>
          <div className="cw-password-wrap">
            <input
              ref={passwordRef}
              className="cw-field-input cw-field-input--password"
              type={showPassword ? "text" : "password"}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={onPasswordKeyDown}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="cw-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && <p className="cw-login-error">{error}</p>}

        <button
          className="cw-login-btn"
          onClick={handleSubmit}
          disabled={loading || !rollInput.trim() || !passwordInput.trim()}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>

      <p className="cw-login-hint">
        Default password is your roll number reversed.
        <br />
        Ask the agent to change it after signing in.
      </p>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export function ChatWidget({
  agentName = "KFUEIT Agent",
  description = "AI University Assistant",
  apiBase = "http://127.0.0.1:8000/api/agent",
  vapiPublicKey,
  vapiAssistantId,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [sessionId] = useState(makeId);

  // Auth state — restored from localStorage on mount
  const [session, setSession] = useState<StoredSession | null>(loadSession);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "**Hello!** I'm KFUEIT Agent Assist.\n\nYou can ask me about your attendance, transcript, courses, or university policies.",
      ts: new Date(),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const vapiRef = useRef<Vapi | null>(null);
  const hasInteracted = messages.length > 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && session) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, session]);

  // Initialize Vapi
  useEffect(() => {
    if (!vapiPublicKey || vapiRef.current) return;
    const v = new Vapi(vapiPublicKey);
    v.on("call-start", () => setCallActive(true));
    v.on("call-end", () => setCallActive(false));
    v.on("error", (e: unknown) => {
      setCallActive(false);
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: `Voice call error: ${msg}`,
          ts: new Date(),
        },
      ]);
    });
    vapiRef.current = v;
  }, [vapiPublicKey]);

  function handleLoginSuccess(newSession: StoredSession) {
    saveSession(newSession);
    setSession(newSession);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "**Hello!** I'm KFUEIT Agent Assist.\n\nYou can ask me about your attendance, transcript, courses, or university policies.",
        ts: new Date(),
      },
    ]);
    setShowQuick(true);
  }

  const sendMessage = useCallback(
    async (text?: string) => {
      const query = (text ?? input).trim();
      if (!query || loading || !session) return;

      setShowQuick(false);
      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "user", content: query, ts: new Date() },
      ]);
      setLoading(true);

      try {
        const res = await fetch(`${apiBase}/query/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ query, session_id: sessionId }),
        });

        // Session expired — force logout
        if (res.status === 401) {
          handleLogout();
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: "assistant",
              content: "Your session has expired. Please sign in again.",
              ts: new Date(),
            },
          ]);
          return;
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content:
              data.response ||
              data.error ||
              "Sorry, could not get a valid response.",
            ts: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: "Could not connect to backend. Please try again.",
            ts: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, apiBase, session, sessionId]
  );

  async function toggleCall() {
    if (!vapiAssistantId || !vapiRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content:
            "Voice call is not configured. Set `VITE_VAPI_PUBLIC_KEY` and `VITE_VAPI_ASSISTANT_ID` in `frontend/.env`.",
          ts: new Date(),
        },
      ]);
      return;
    }
    if (callActive) {
      vapiRef.current.stop();
    } else {
      try {
        await vapiRef.current.start(vapiAssistantId, {
          variableValues: { roll_no: session?.student.roll_no },
        } as any);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: `Could not start voice call: ${msg}`,
            ts: new Date(),
          },
        ]);
      }
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        className="cw-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chat"
      >
        {!open && <span className="cw-fab-pulse" />}
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      <div
        className={`cw-panel${open ? " cw-panel--open" : ""}`}
        aria-hidden={!open}
      >
        {/* Header */}
        <header className="cw-header">
          <div className="cw-header-identity">
            <div className="cw-header-avatar">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="cw-header-name">{agentName}</p>
              <p className="cw-header-sub">
                <span className="cw-online-dot" />
                {session
                  ? `${session.student.name} · ${session.student.roll_no}`
                  : description}
              </p>
            </div>
          </div>
          <div className="cw-header-actions">
            {session && (
              <button
                className={`cw-icon-btn${callActive ? " cw-icon-btn--danger" : ""}`}
                onClick={toggleCall}
                title={callActive ? "End call" : "Start voice call"}
              >
                {callActive ? <PhoneOff size={15} /> : <Phone size={15} />}
              </button>
            )}
            {session && (
              <button
                className="cw-icon-btn"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            )}
            <button
              className="cw-icon-btn"
              onClick={() => setOpen(false)}
              title="Minimize"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </header>

        {/* Login screen */}
        {!session ? (
          <LoginScreen apiBase={apiBase} onSuccess={handleLoginSuccess} />
        ) : (
          <>
            {/* Messages */}
            <div className="cw-messages">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {loading && (
                <div className="cw-row cw-row--assistant">
                  <div className="cw-avatar">
                    <Sparkles size={13} />
                  </div>
                  <div className="cw-bubble cw-bubble--assistant">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {showQuick && !hasInteracted && (
              <div className="cw-quick">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    className="cw-quick-btn"
                    onClick={() => sendMessage(p)}
                    disabled={loading}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Input footer — only when signed in */}
        {session && (
          <footer className="cw-footer">
            <div className="cw-input-wrap">
              <input
                ref={inputRef}
                className="cw-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendMessage()
                }
                placeholder="Type your question..."
                disabled={loading}
              />
              <button
                className="cw-send"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="cw-powered">
              <Sparkles size={11} className="cw-powered-icon" />
              Powered by AI · Responses are for guidance only
            </p>
          </footer>
        )}
      </div>
    </>
  );
}

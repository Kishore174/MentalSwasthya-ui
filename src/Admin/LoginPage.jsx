import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiMail, FiUser, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import loginicon from "../Assets/logo.jpg";
import { loginUser, registerUser } from "../Api/authApi";
import { useAuth } from "../context/AuthContext";

/* ─── Font injection ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector('[href*="Cormorant"]')) document.head.appendChild(fontLink);

/* ─── Auth helper ────────────────────────────────────────── */
const getAuthPayload = (responseData) => {
  const payload = responseData?.data || responseData || {};
  const token =
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    payload.jwt ||
    payload?.user?.token;
  const user = payload.user || payload.individual || payload.profile || payload;
  return { token, user };
};

/* ─── Decorative SVG panel ───────────────────────────────── */
const ForestPanel = ({ isRegister }) => (
  <div
    className="hidden md:flex flex-col justify-between relative overflow-hidden h-full"
    style={{
      background: "linear-gradient(160deg, #162314 0%, #1e3019 50%, #0f1a0d 100%)",
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    {/* Dot-grid texture */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#a8c896" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>

    {/* Large decorative circle */}
    <div
      className="absolute rounded-full opacity-10"
      style={{
        width: 420, height: 420,
        background: "radial-gradient(circle, #7d9667 0%, transparent 70%)",
        right: -140, top: -80,
      }}
    />
    <div
      className="absolute rounded-full opacity-[0.06]"
      style={{ width: 300, height: 300, border: "1.5px solid #a8c896", right: -60, top: 60 }}
    />
    <div
      className="absolute rounded-full opacity-[0.04]"
      style={{ width: 200, height: 200, border: "1px solid #a8c896", right: -20, top: 110 }}
    />

    {/* Botanical leaf — top left */}
    <svg
      className="absolute opacity-[0.13]"
      style={{ top: 30, left: -10, width: 160, height: 160 }}
      viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M80 140 C20 100 10 30 80 10 C150 30 140 100 80 140Z" fill="#7d9667" />
      <path d="M80 140 L80 10" stroke="#a8c896" strokeWidth="0.8" strokeDasharray="3 4" />
      <path d="M80 50 C95 55 105 65 100 80" stroke="#a8c896" strokeWidth="0.6" />
      <path d="M80 70 C65 75 55 85 60 100" stroke="#a8c896" strokeWidth="0.6" />
      <path d="M80 90 C92 92 100 100 97 112" stroke="#a8c896" strokeWidth="0.6" />
    </svg>

    {/* Bottom-left botanical */}
    <svg
      className="absolute opacity-[0.10]"
      style={{ bottom: 60, left: 20, width: 120, height: 120, transform: "rotate(30deg)" }}
      viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M60 110 C10 80 10 20 60 5 C110 20 110 80 60 110Z" fill="#7d9667" />
      <path d="M60 110 L60 5" stroke="#a8c896" strokeWidth="0.7" strokeDasharray="3 3" />
    </svg>

    {/* Content — top */}
    <div className="relative z-10 p-9 pt-10">
      {/* Live badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{ background: "rgba(125,150,103,0.18)", border: "0.5px solid rgba(168,200,150,0.25)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse 2s infinite" }} />
        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: "#a8c896" }}>
          Live Platform
        </span>
      </div>

      {/* Logo + Brand */}
      <div className="mt-8 flex items-center gap-4">
        <img
          src={loginicon}
          alt="MentalSwasthya logo"
          style={{
            width: 54, height: 54,
            borderRadius: 14,
            objectFit: "cover",
            border: "1.5px solid rgba(168,200,150,0.22)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
          }}
        />
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase font-medium mb-1"
            style={{ color: "rgba(168,200,150,0.55)" }}>
            MentalSwasthya
          </p>
          <h2
            className="leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
              fontWeight: 600,
              color: "#e8f0e3",
              letterSpacing: "-0.01em",
            }}
          >
            {isRegister ? (
              <>Begin Your <em style={{ fontStyle: "italic", color: "#a8c896" }}>Wellness</em> Story</>
            ) : (
              <>Your Mind, <em style={{ fontStyle: "italic", color: "#a8c896" }}>Your Space</em></>
            )}
          </h2>
        </div>
      </div>
    </div>

    {/* Content — bottom */}
    <div className="relative z-10 p-9 pb-10">
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: "◎", label: "Guided Breathing" },
          { icon: "◈", label: "Daily Streaks" },
          { icon: "◉", label: "Wellness Insights" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="rounded-2xl p-3.5"
            style={{ background: "rgba(125,150,103,0.10)", border: "0.5px solid rgba(168,200,150,0.15)" }}
          >
            <span className="text-lg mb-2 block" style={{ color: "#7d9667" }}>{icon}</span>
            <p className="text-[11px] font-medium leading-snug" style={{ color: "rgba(232,240,227,0.65)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="h-px w-full mb-5" style={{ background: "rgba(168,200,150,0.12)" }} />
      <p className="text-xs leading-relaxed" style={{ color: "rgba(168,200,150,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
        Breathing · Focus · Relaxation · Insights
      </p>
    </div>

    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
  </div>
);

/* ─── Floating label input ───────────────────────────────── */
const Field = ({ label, name, type = "text", value, onChange, placeholder, required, minLength, suffix, compact }) => (
  <div className="relative">
    <label
      className="block font-semibold uppercase tracking-[0.13em] mb-1.5"
      style={{ color: "#9aab8d", fontSize: compact ? "9.5px" : "10.5px" }}
    >
      {label}
    </label>
    <div
      className="flex items-center rounded-xl transition-all"
      style={{ background: "#f4f7f1", border: "1.5px solid #e0e9d9" }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = "#7d9667";
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(125,150,103,0.10)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = "#e0e9d9";
        e.currentTarget.style.background = "#f4f7f1";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="flex-1 bg-transparent outline-none text-sm px-4"
        style={{
          color: "#1a2416",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
          paddingTop: compact ? "9px" : "14px",
          paddingBottom: compact ? "9px" : "14px",
        }}
      />
      {suffix && <div className="pr-3">{suffix}</div>}
    </div>
  </div>
);

/* ─── Main component ─────────────────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (mode) => {
    setAuthMode(mode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === "register" && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      if (authMode === "register") {
        const res = await registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password });
        const { token, user } = getAuthPayload(res.data);
        if (token) { login(token, user); toast.success("Account created. Welcome!"); navigate("/splash", { replace: true }); return; }
        toast.success("Account created. Please sign in.");
        switchMode("login");
        setForm((f) => ({ ...f, email: form.email.trim() }));
        return;
      }
      const res = await loginUser({ email: form.email.trim(), password: form.password });
      const { token, user } = getAuthPayload(res.data);
      if (!token) throw new Error("No token in response");
      login(token, user);
      toast.success("Welcome back!");
      navigate("/splash", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(
        authMode === "register"
          ? err?.response?.data?.message || "Unable to create account"
          : "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const isRegister = authMode === "register";

  const EyeBtn = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
      style={{ color: "#9aab8d" }}
    >
      {show ? <FiEyeOff size={14} /> : <FiEye size={14} />}
    </button>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#eef2ea", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Card */}
      <div
        className="w-full overflow-hidden"
        style={{
          maxWidth: 980,
          borderRadius: 28,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          boxShadow: "0 24px 80px rgba(22,35,20,0.14), 0 4px 16px rgba(22,35,20,0.06)",
          background: "#ffffff",
          /* Let card grow with content — no fixed minHeight */
        }}
      >
        {/* ── Left panel ── */}
        <ForestPanel isRegister={isRegister} />

        {/* ── Right: Form panel ── */}
        <div
          className="flex flex-col justify-center col-span-2 md:col-span-1"
          style={{
            background: "#ffffff",
            /* Tighter padding in register to keep everything visible */
            padding: isRegister ? "28px 40px" : "40px 40px",
          }}
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-5 md:hidden">
            <img src={loginicon} alt="logo" className="h-14 w-auto object-contain rounded-2xl" />
          </div>

          {/* Header */}
          <div style={{ marginBottom: isRegister ? "18px" : "28px" }}>
            <span
              className="inline-block text-[10px] font-semibold tracking-[0.18em] uppercase px-3 py-1 rounded-full"
              style={{
                background: "rgba(125,150,103,0.10)",
                color: "#5c7a4a",
                marginBottom: isRegister ? "14px" : "18px",
                display: "inline-block",
              }}
            >
              MentalSwasthya Portal
            </span>

            {/* Logo + title row — shown only in register on desktop for visual anchor */}
            {isRegister && (
              <div className="hidden md:flex items-center gap-3 mb-3">
                <img
                  src={loginicon}
                  alt="logo"
                  style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    objectFit: "cover",
                    border: "1.5px solid #e0e9d9",
                  }}
                />
                <div>
                  <h1
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.75rem",
                      fontWeight: 600,
                      color: "#1a2416",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                    }}
                  >
                    Create Account
                  </h1>
                </div>
              </div>
            )}

            {!isRegister && (
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2.3rem",
                  fontWeight: 600,
                  color: "#1a2416",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Welcome Back
              </h1>
            )}

            {/* Mobile register heading */}
            {isRegister && (
              <h1
                className="md:hidden"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "#1a2416",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Create Account
              </h1>
            )}

            <p className="text-sm mt-1" style={{ color: "#8fa384", fontWeight: 400, fontSize: isRegister ? "12px" : "14px" }}>
              {isRegister
                ? "Register to start your wellness journey"
                : "Sign in to continue your wellness journey"}
            </p>
          </div>

          {/* Mode toggle */}
          <div
            className="flex p-1 rounded-2xl"
            style={{ background: "#f0f4ed", gap: 4, marginBottom: isRegister ? "16px" : "24px" }}
          >
            {["login", "register"].map((mode) => {
              const active = authMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchMode(mode)}
                  className="flex-1 rounded-xl text-xs font-semibold uppercase tracking-[0.10em] transition-all"
                  style={{
                    padding: isRegister ? "9px 0" : "10px 0",
                    background: active ? "#7d9667" : "transparent",
                    color: active ? "#ffffff" : "#8fa384",
                    boxShadow: active ? "0 2px 8px rgba(125,150,103,0.28)" : "none",
                    letterSpacing: "0.1em",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {mode === "login" ? "Sign In" : "Register"}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: isRegister ? 10 : 16 }}>
            {isRegister && (
              <Field
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                minLength={2}
                compact={isRegister}
                suffix={<FiUser size={14} style={{ color: "#b8caaf" }} />}
              />
            )}

            <Field
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              compact={isRegister}
              suffix={<FiMail size={14} style={{ color: "#b8caaf" }} />}
            />

            <Field
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder={isRegister ? "Create a strong password" : "Enter your password"}
              required
              minLength={isRegister ? 6 : undefined}
              compact={isRegister}
              suffix={<EyeBtn show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
            />

            {isRegister && (
              <Field
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                minLength={6}
                compact={isRegister}
                suffix={<EyeBtn show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />}
              />
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 font-semibold text-sm transition-all"
              style={{
                padding: isRegister ? "12px 24px" : "15px 24px",
                marginTop: isRegister ? "4px" : "4px",
                borderRadius: 14,
                background: loading ? "#9aab8d" : "#7d9667",
                color: "#ffffff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.04em",
                boxShadow: "0 4px 20px rgba(125,150,103,0.32)",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#6f865c"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#7d9667"; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.985)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-4 h-4 rounded-full border-2"
                    style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }}
                  />
                  {isRegister ? "Creating account…" : "Signing in…"}
                </>
              ) : (
                <>
                  {isRegister ? "Create Account" : "Continue"}
                  <FiArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center gap-2" style={{ marginTop: isRegister ? "16px" : "24px" }}>
            <div className="flex-1 h-px" style={{ background: "#e8eee5" }} />
            <p className="text-[11px] px-2" style={{ color: "#b8caaf" }}>Secure · Authorized access only</p>
            <div className="flex-1 h-px" style={{ background: "#e8eee5" }} />
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: "#c4d3bc" }}>
            Need help?{" "}
            <span className="cursor-pointer" style={{ color: "#7d9667" }}>Contact administrator</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        * { box-sizing: border-box; }
        input::placeholder { color: #c4d3bc; }
      `}</style>
    </div>
  );
};

export default LoginPage;

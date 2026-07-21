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

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", referralCode: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/app");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (mode) => {
    setAuthMode(mode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setForm({ name: "", email: "", password: "", confirmPassword: "", referralCode: "" });
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
        const res = await registerUser({ 
          name: form.name.trim(), 
          email: form.email.trim(), 
          password: form.password,
          referralCode: form.referralCode.trim()
        });
        const { token, user } = getAuthPayload(res.data);
        if (token) { 
          login(token, user); 
          toast.success("Account created. Welcome!"); 
          navigate("/splash", { replace: true }); 
          return; 
        }
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

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Background Split Screen (Forest green & Light Mint) ── */}
      <div className="absolute inset-0 w-full h-full flex select-none pointer-events-none">
        <div className="w-1/2 h-full bg-[#052012]" />
        <div className="w-1/2 h-full bg-[#eef5e7]" />
      </div>

      {/* Decorative leaf/wellness icons matching the mock image corners */}
      <div className="absolute top-6 left-6 text-white/20 opacity-30 select-none pointer-events-none hidden md:block">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.58,20.43C9.37,20.8 11.23,20.41 12.83,19.38C16.89,16.76 18.23,11.43 17,8M12.24,17.42C10.74,18.06 9,17.79 7.69,16.63C6,15.11 6.09,12.39 7.82,11C11.5,8 14.5,10.5 12.24,17.42Z" />
        </svg>
      </div>
      <div className="absolute top-6 right-6 text-[#052012]/15 opacity-40 select-none pointer-events-none hidden md:block">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-5-3.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm6.5-6c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-6 text-white/20 opacity-30 select-none pointer-events-none hidden md:block">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
        </svg>
      </div>
      <div className="absolute bottom-6 right-6 text-[#052012]/15 opacity-40 select-none pointer-events-none hidden md:block">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2zm1 14H11V11H13V16zm0-7H11V7H13V9z" />
        </svg>
      </div>

      {/* ─── Premium Split-Panel Login Card ─── */}
      <div className="w-full max-w-[960px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/40 relative z-10 flex flex-col md:flex-row min-h-[560px]">
        
        {/* Left panel: Original logo and Serif Brand */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 select-none">
          
          {/* Actual branding logo image */}
          <img 
            src={loginicon} 
            alt="logo" 
            className="w-36 h-36 object-cover rounded-3xl border border-gray-150 shadow-md mb-6" 
          />

          {/* Title Serif */}
          <h1
            className="text-[#0a331c] tracking-tight font-medium text-center"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.75rem",
              lineHeight: "1.1"
            }}
          >
            Mental Swasthya
          </h1>

          {/* Separator leaf line */}
          <div className="flex items-center justify-center gap-3.5 w-3/5 my-4">
            <div className="h-[1px] bg-gray-200 flex-grow" />
            <svg className="w-3.5 h-3.5 text-[#0a331c] opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.58,20.43C9.37,20.8 11.23,20.41 12.83,19.38C16.89,16.76 18.23,11.43 17,8M12.24,17.42C10.74,18.06 9,17.79 7.69,16.63C6,15.11 6.09,12.39 7.82,11C11.5,8 14.5,10.5 12.24,17.42Z" />
            </svg>
            <div className="h-[1px] bg-gray-200 flex-grow" />
          </div>

          {/* Subtext */}
          <p className="text-gray-400 text-xs font-medium tracking-wide text-center">
            Empowering your wellness, every single day
          </p>

        </div>

        {/* Right panel: Dark Green Form and Google OAuth button */}
        <div className="w-full md:w-1/2 bg-[#0a331c] flex flex-col justify-center p-8 md:p-12 relative text-white">
          
          <h2 className="text-3xl font-bold tracking-tight text-white mb-6">
            {isRegister ? "Sign Up" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8fb39c] tracking-wide">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-3.5 text-gray-400/80" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8fb39c] tracking-wide">Username or Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-3.5 text-gray-400/80" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#8fb39c] tracking-wide">Password</label>
                {!isRegister && (
                  <span
                    onClick={() => toast("Contact support to reset passwords.")}
                    className="text-xs text-[#8fb39c] font-semibold hover:underline cursor-pointer select-none"
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-[#062413] border border-[#144729] px-4 py-3 text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8fb39c] tracking-wide">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-4 py-3 text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Keep me signed in (only in Login) */}
            {!isRegister && (
              <div className="flex items-center gap-2 py-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#8fb39c] select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-emerald-900 bg-[#062413] accent-[#7d9667] text-white cursor-pointer"
                  />
                  Keep me signed in
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] text-white font-bold py-3.5 text-sm transition-all border border-[#144729] shadow-inner mt-2 flex items-center justify-center gap-2"
            >
              {loading ? "Please wait..." : isRegister ? "Sign Up" : "Log In"}
              <FiArrowRight size={15} />
            </button>
          </form>

          {/* Register / Sign In Switch */}
          <p className="text-center text-xs font-semibold text-[#8fb39c] mt-5 select-none">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => switchMode(isRegister ? "login" : "register")}
              className="text-white hover:underline cursor-pointer font-bold"
            >
              {isRegister ? "Sign in" : "Sign up"}
            </span>
          </p>

          {/* Separator Line */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-[1px] bg-white/10 flex-grow" />
            <span className="text-[10px] text-[#8fb39c] font-black uppercase tracking-wider">or</span>
            <div className="h-[1px] bg-white/10 flex-grow" />
          </div>

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                toast.success("Google Authentication active! Welcome.");
                localStorage.setItem("token", "google-oauth-mock");
                login("google-oauth-mock", { name: "Google Companion", role: "user" });
                navigate("/splash", { replace: true });
              }}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#fcf9f2] hover:opacity-90 text-gray-900 text-xs font-bold transition-all border-none"
            >
              {/* Google G logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;

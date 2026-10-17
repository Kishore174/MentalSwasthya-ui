import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiMail, FiArrowRight, FiGift, FiRefreshCw, FiLock, FiKey, FiShield, FiSmartphone, FiUser } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import loginicon from "../Assets/logo.jpg";
import { loginUser, registerUser, forgotPassword, resetPassword, verifyEmail, resendVerification, verify2FA, resend2FA } from "../Api/authApi";
import { useAuth } from "../context/AuthContext";
import { getDeviceId, getDeviceName } from "../utils/device";

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
  const location = useLocation();
  const { login } = useAuth();

  const getTargetUrl = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect") || searchParams.get("next");
      if (redirectParam) return redirectParam;
      if (location.state?.from?.pathname) {
        return `${location.state.from.pathname}${location.state.from.search || ""}`;
      }
    } catch {
      // fallback
    }
    return null;
  };

  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", giftCode: "" });
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");

  const [croppedLogo, setCroppedLogo] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = loginicon;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height);
      const sSize = size * 0.45;
      canvas.width = sSize;
      canvas.height = sSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          img,
          img.width * 0.275,
          img.height * 0.15,
          sSize,
          sSize,
          0,
          0,
          sSize,
          sSize
        );
        setCroppedLogo(canvas.toDataURL("image/jpeg"));
      }
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const target = getTargetUrl() || "/app";
      navigate(target, { replace: true });
    }

    const deviceMsg = sessionStorage.getItem("device_switched_msg");
    if (deviceMsg) {
      toast.error(deviceMsg, { duration: 6000 });
      sessionStorage.removeItem("device_switched_msg");
    }
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (mode) => {
    setAuthMode(mode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtp("");
    if (mode !== "verify-email" && mode !== "reset-password" && mode !== "2fa") {
      setForm({ name: "", email: "", password: "", confirmPassword: "", giftCode: "" });
    }
  };

  const handleResendCode = async () => {
    const targetEmail = verifyEmailAddress || form.email.trim();
    if (!targetEmail) {
      toast.error("Email address missing. Please return to Sign In.");
      return;
    }
    setResending(true);
    try {
      if (authMode === "reset-password") {
        const res = await forgotPassword({ email: targetEmail });
        toast.success(res?.data?.message || "A new 6-digit reset code has been sent to your email.");
      } else if (authMode === "2fa") {
        const res = await resend2FA({
          email: targetEmail,
          deviceId: getDeviceId(),
          deviceName: getDeviceName(),
        });
        toast.success(res?.data?.message || "A new 2FA code has been sent to your email.");
      } else {
        const res = await resendVerification({ email: targetEmail });
        toast.success(res?.data?.message || "A new verification code has been sent to your email.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
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
        const giftCodeValue = (form.giftCode || form.referralCode || "").trim();
        const res = await registerUser({ 
          email: form.email.trim(), 
          password: form.password,
          giftCode: giftCodeValue,
          referralCode: giftCodeValue
        });

        const payload = res?.data?.data || res?.data || {};
        if (payload.requiresEmailVerification || res?.data?.requiresEmailVerification) {
          toast.success("Account created! Please enter the 6-digit verification code sent to your email.");
          setVerifyEmailAddress(form.email.trim());
          setAuthMode("verify-email");
          setOtp("");
          return;
        }

        const { token, user } = getAuthPayload(res.data);
        if (token) { 
          login(token, user); 
          toast.success("Account created. Welcome!"); 
          const target = getTargetUrl();
          navigate(target || "/splash", { replace: true }); 
          return; 
        }
        toast.success("Account created. Please verify your email.");
        setVerifyEmailAddress(form.email.trim());
        setAuthMode("verify-email");
        return;
      }

      if (authMode === "verify-email") {
        if (!otp.trim() || otp.trim().length < 6) {
          toast.error("Please enter the complete 6-digit verification code.");
          setLoading(false);
          return;
        }
        const res = await verifyEmail({
          email: verifyEmailAddress || form.email.trim(),
          otp: otp.trim()
        });
        const { token, user } = getAuthPayload(res.data);
        if (token) {
          login(token, user);
          toast.success("Email verified successfully! Welcome to Mental Swasthya.");
          const target = getTargetUrl();
          navigate(target || "/splash", { replace: true });
          return;
        }
        toast.success("Email verified successfully! Please sign in.");
        switchMode("login");
        return;
      }

      if (authMode === "forgot-password") {
        if (!form.email.trim()) {
          toast.error("Please enter your email address.");
          setLoading(false);
          return;
        }
        const res = await forgotPassword({ email: form.email.trim() });
        setVerifyEmailAddress(form.email.trim());
        setOtp("");
        setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setAuthMode("reset-password");
        toast.success(res?.data?.message || "Reset code sent! Check your email for the 6-digit code.");
        return;
      }

      if (authMode === "reset-password") {
        if (!otp.trim() || otp.trim().length < 6) {
          toast.error("Please enter the complete 6-digit reset code.");
          setLoading(false);
          return;
        }
        if (!form.password || form.password.length < 8) {
          toast.error("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          toast.error("Passwords do not match.");
          setLoading(false);
          return;
        }

        const res = await resetPassword({
          email: verifyEmailAddress || form.email.trim(),
          otp: otp.trim(),
          password: form.password,
        });
        toast.success(res?.data?.message || "Password has been reset successfully! Please sign in.");
        switchMode("login");
        return;
      }

      if (authMode === "2fa") {
        if (!otp.trim() || otp.trim().length < 6) {
          toast.error("Please enter the complete 6-digit 2FA verification code.");
          setLoading(false);
          return;
        }
        const res = await verify2FA({
          email: verifyEmailAddress || form.email.trim(),
          otp: otp.trim(),
          deviceId: getDeviceId(),
          deviceName: getDeviceName(),
        });
        const { token, user } = getAuthPayload(res.data);
        if (token) {
          login(token, user);
          toast.success("Device authorized! Signed in successfully.");
          const target = getTargetUrl();
          navigate(target || "/splash", { replace: true });
          return;
        }
        toast.success("Device authorized! Please sign in.");
        switchMode("login");
        return;
      }

      const res = await loginUser({ 
        email: form.email.trim(), 
        password: form.password,
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
      });
      const data = res?.data?.data || res?.data;
      if (data?.requires2FA) {
        toast(data?.message || "New device detected. Please verify with the 2FA code sent to your email.", { icon: "🔐" });
        setVerifyEmailAddress(form.email.trim());
        setAuthMode("2fa");
        setOtp("");
        return;
      }
      const { token, user } = getAuthPayload(res.data);
      if (!token) throw new Error("No token in response");
      login(token, user);
      toast.success("Welcome back!");
      const target = getTargetUrl();
      navigate(target || "/splash", { replace: true });
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      if (data?.requiresEmailVerification || (err?.response?.status === 403 && data?.message?.toLowerCase().includes("verify your email"))) {
        toast.error(data?.message || "Please verify your email address.");
        setVerifyEmailAddress(form.email.trim() || data?.email || "");
        setAuthMode("verify-email");
        setOtp("");
        return;
      }
      const errorMsg = data?.message || err?.message || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isRegister = authMode === "register";

  return (
    <div
      className="min-h-screen supports-[height:100dvh]:min-h-dvh relative flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
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
      <div className="w-full max-w-[960px] bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/40 relative z-10 flex flex-col md:flex-row md:min-h-[560px]">
        
        {/* Left panel: Original logo and Serif Brand */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-6 py-7 sm:p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 select-none">
          
          {/* Actual branding logo image */}
          <img 
            src={croppedLogo || loginicon} 
            alt="logo" 
            className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 object-cover rounded-2xl sm:rounded-3xl border border-gray-150 shadow-md mb-4 md:mb-6" 
          />

          {/* Title Serif */}
          <h1
            className="text-[#0a331c] tracking-tight font-medium text-center text-[2.25rem] sm:text-[2.75rem]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              lineHeight: "1.1"
            }}
          >
            Mental Swasthya
          </h1>

          {/* Separator leaf line */}
          <div className="flex items-center justify-center gap-3.5 w-3/5 my-3 md:my-4">
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
        <div className="w-full md:w-1/2 bg-[#0a331c] flex flex-col justify-center px-5 py-7 sm:p-8 md:p-12 relative text-white">
          
          {authMode === "reset-password" ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#144729] flex items-center justify-center text-[#8fb39c]">
                  <FiKey size={17} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8fb39c]">
                  Password Recovery
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                Set New Password
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                We've sent a 6-digit reset code to{" "}
                <strong className="text-white underline">{verifyEmailAddress || form.email}</strong>.
                Enter the code and choose your new password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8fb39c] tracking-wide">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-4 py-3 text-center text-2xl font-mono tracking-[8px] outline-none focus:border-[#8fb39c] text-white placeholder-gray-600 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8fb39c] tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-3.5 text-gray-400/80" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-11"
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8fb39c] tracking-wide">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-3.5 text-gray-400/80" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength={8}
                      placeholder="Re-enter new password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-11"
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

                <button
                  type="submit"
                  disabled={loading || otp.length < 6 || form.password.length < 8}
                  className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] disabled:opacity-50 text-white font-bold py-3.5 text-sm transition-all border border-[#144729] shadow-inner flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Updating..." : "Update Password"}
                  <FiArrowRight size={15} />
                </button>

                <div className="flex items-center justify-between pt-3 border-t border-[#144729]/60 text-xs mt-4">
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResendCode}
                    className="text-[#8fb39c] hover:text-white font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw size={13} className={resending ? "animate-spin" : ""} />
                    {resending ? "Sending code..." : "Resend Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          ) : authMode === "2fa" ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#144729] flex items-center justify-center text-[#8fb39c]">
                  <FiShield size={17} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8fb39c]">
                  Two-Factor Authentication (2FA)
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                Authorize New Device
              </h2>

              <div className="bg-[#062413] border border-[#144729] rounded-xl p-3 mb-4 flex items-start gap-2.5">
                <FiSmartphone size={16} className="text-[#8fb39c] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8fb39c] leading-relaxed">
                  <strong className="text-white">One-Device Policy:</strong> Your account can only be active on one device at a time. Authorizing this device will automatically sign out any other active device.
                </p>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                We've sent a 6-digit verification code to{" "}
                <strong className="text-white underline">{verifyEmailAddress || form.email}</strong>.
                Enter the code below to authorize this device (valid for 15 minutes).
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8fb39c] tracking-wide">
                    6-Digit 2FA Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-4 py-3.5 text-center text-2xl font-mono tracking-[8px] outline-none focus:border-[#8fb39c] text-white placeholder-gray-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] disabled:opacity-50 text-white font-bold py-3.5 text-sm transition-all border border-[#144729] shadow-inner flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Authorizing..." : "Authorize Device & Sign In"}
                  <FiArrowRight size={15} />
                </button>

                <div className="flex items-center justify-between pt-3 border-t border-[#144729]/60 text-xs mt-4">
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResendCode}
                    className="text-[#8fb39c] hover:text-white font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw size={13} className={resending ? "animate-spin" : ""} />
                    {resending ? "Sending code..." : "Resend Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          ) : authMode === "verify-email" ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-[#144729] flex items-center justify-center text-[#8fb39c]">
                  <FiMail size={17} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8fb39c]">
                  Email Verification
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                Verify Your Email
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                We've sent a 6-digit verification code to{" "}
                <strong className="text-white underline">{verifyEmailAddress || form.email}</strong>.
                Enter the code below or click the verification link in your inbox (valid for 15 minutes).
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-otp" className="block text-xs font-bold text-[#8fb39c] tracking-wide">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="login-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-4 py-3.5 text-center text-2xl font-mono tracking-[6px] sm:tracking-[8px] outline-none focus:border-[#8fb39c] text-white placeholder-gray-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] disabled:opacity-50 text-white font-bold py-3.5 text-sm transition-all border border-[#144729] shadow-inner flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                  <FiArrowRight size={15} />
                </button>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-1 border-t border-[#144729]/60 text-xs mt-4">
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResendCode}
                    className="min-h-[44px] text-[#8fb39c] hover:text-white font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw size={13} className={resending ? "animate-spin" : ""} />
                    {resending ? "Sending code..." : "Resend Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="min-h-[44px] text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-5 sm:mb-6">
                {isRegister ? "Sign Up" : authMode === "forgot-password" ? "Reset Password" : "Sign In"}
              </h2>
              {authMode === "forgot-password" && (
                <p className="text-xs text-[#8fb39c] font-medium mb-6">
                  Enter your registered email address to receive a 6-digit code and reset link.
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="login-name" className="block text-xs font-bold text-[#8fb39c] tracking-wide">Full Name</label>
                <div className="relative">
                  <FiUser aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 pointer-events-none" />
                  <input
                    id="login-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Enter name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-base md:text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-[#8fb39c] tracking-wide">{isRegister ? "Email Address" : "Username or Email Address"}</label>
              <div className="relative">
                <FiMail aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-base md:text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            {authMode !== "forgot-password" && (
              <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-bold text-[#8fb39c] tracking-wide">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="-my-3 -mr-2 px-2 py-3 rounded-lg text-xs text-[#8fb39c] font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fb39c] cursor-pointer select-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-[#062413] border border-[#144729] px-4 py-3 text-base md:text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  aria-controls="login-password"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fb39c]"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              </div>
            )}

            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="login-confirm-password" className="block text-xs font-bold text-[#8fb39c] tracking-wide">Confirm Password</label>
                <div className="relative">
                  <input
                    id="login-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-4 py-3 text-base md:text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                    aria-controls="login-confirm-password"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fb39c]"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8fb39c] tracking-wide">Gift Code (Optional)</label>
                <div className="relative">
                  <FiGift aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 pointer-events-none" />
                  <input
                    id="login-referral"
                    type="text"
                    name="giftCode"
                    placeholder="Enter gift code"
                    value={form.giftCode || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-base md:text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Terms & Privacy Agreement (only in Sign Up) */}
            {isRegister && (
              <div className="flex items-start gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="termsAgreement"
                  required
                  className="w-4 h-4 rounded border-emerald-900 bg-[#062413] accent-[#7d9667] text-white cursor-pointer mt-0.5 flex-shrink-0"
                />
                <label htmlFor="termsAgreement" className="text-xs font-semibold text-[#8fb39c] select-none leading-relaxed">
                  I agree to Mental Swasthya's{" "}
                  <span 
                    onClick={(e) => { e.preventDefault(); toast("Terms & Conditions"); }}
                    className="underline text-white font-bold cursor-pointer hover:text-[#8fb39c]"
                  >
                    Terms & Conditions
                  </span>{" "}
                  and acknowledge the{" "}
                  <span 
                    onClick={(e) => { e.preventDefault(); toast("Privacy Policy"); }}
                    className="underline text-white font-bold cursor-pointer hover:text-[#8fb39c]"
                  >
                    Privacy Policy
                  </span>.
                </label>
              </div>
            )}

            {/* Keep me signed in (only in Login) */}
            {authMode === "login" && (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] text-white font-bold py-3.5 text-sm transition-all border border-[#144729] shadow-inner mt-2 flex items-center justify-center gap-2"
            >
              {loading ? "Please wait..." : isRegister ? "Sign Up" : authMode === "forgot-password" ? "Send 6-Digit Code" : "Log In"}
              <FiArrowRight size={15} />
            </button>
          </form>

          {/* Register / Sign In Switch */}
          <div className="flex flex-col items-center justify-center gap-2 mt-5 text-center text-xs font-semibold text-[#8fb39c] select-none">
            {authMode === "forgot-password" && (
              <button
                type="button"
                onClick={() => switchMode("reset-password")}
                className="text-[#8fb39c] hover:text-white hover:underline text-xs font-medium cursor-pointer"
              >
                Already have a reset code? Enter code
              </button>
            )}
            <p>
              {authMode === "forgot-password" ? "Remembered your password?" : isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <span
                onClick={() => switchMode(isRegister || authMode === "forgot-password" ? "login" : "register")}
                className="text-white hover:underline cursor-pointer font-bold"
              >
                {authMode === "forgot-password" ? "Sign in" : isRegister ? "Sign in" : "Sign up"}
              </span>
            </p>
          </div>
          </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;

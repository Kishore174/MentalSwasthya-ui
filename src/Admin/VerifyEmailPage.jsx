import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail, resendVerification } from "../Api/authApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiCheckCircle, FiAlertCircle, FiMail, FiArrowRight, FiRefreshCw } from "react-icons/fi";
import loginicon from "../Assets/logo.jpg";

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

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { login } = useAuth();

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid. Please check the link from your email.");
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyEmail({ token });
        setStatus("success");
        setMessage(res?.data?.message || "Your email address has been verified successfully!");
        const { token: authToken, user } = getAuthPayload(res.data);
        if (authToken) {
          login(authToken, user);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(err?.response?.data?.message || err?.message || "Verification link is invalid or has expired.");
      }
    };

    verify();
  }, [token, login]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setResending(true);
    try {
      const res = await resendVerification({ email: emailInput.trim() });
      toast.success(res?.data?.message || "A fresh verification link has been sent to your email.");
      setEmailInput("");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background Split Screen */}
      <div className="absolute inset-0 w-full h-full flex select-none pointer-events-none">
        <div className="w-1/2 h-full bg-[#052012]" />
        <div className="w-1/2 h-full bg-[#eef5e7]" />
      </div>

      {/* Decorative leaf icon */}
      <div className="absolute top-6 left-6 text-white/20 opacity-30 select-none pointer-events-none hidden md:block">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.58,20.43C9.37,20.8 11.23,20.41 12.83,19.38C16.89,16.76 18.23,11.43 17,8M12.24,17.42C10.74,18.06 9,17.79 7.69,16.63C6,15.11 6.09,12.39 7.82,11C11.5,8 14.5,10.5 12.24,17.42Z" />
        </svg>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[960px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/40 relative z-10 flex flex-col md:flex-row min-h-[520px]">
        {/* Left panel: Branding */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 select-none">
          <img
            src={loginicon}
            alt="logo"
            className="w-48 h-48 object-cover rounded-3xl border border-gray-150 shadow-md mb-6"
          />
          <h1
            className="text-[#0a331c] tracking-tight font-medium text-center"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.5rem",
              lineHeight: "1.1",
            }}
          >
            Mental Swasthya
          </h1>
          <p className="text-gray-400 text-xs font-medium tracking-wide text-center mt-3">
            Mindful living and holistic wellbeing
          </p>
        </div>

        {/* Right panel: Verification Status */}
        <div className="w-full md:w-1/2 bg-[#0a331c] flex flex-col justify-center p-8 md:p-12 relative text-white">
          {status === "verifying" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#144729] border border-[#8fb39c]/40 flex items-center justify-center animate-pulse">
                <FiRefreshCw size={28} className="text-[#8fb39c] animate-spin" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Verifying Your Email...
              </h2>
              <p className="text-xs text-gray-300 max-w-sm mx-auto">
                Please hold on while we validate your verification token.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FiCheckCircle size={24} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Account Activated</span>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Email Verified!
                  </h2>
                </div>
              </div>

              <p className="text-sm text-gray-200 leading-relaxed">
                {message}
              </p>

              <button
                type="button"
                onClick={() => navigate("/splash")}
                className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] text-white font-bold py-3.5 text-sm transition-all border border-[#144729] shadow-inner flex items-center justify-center gap-2"
              >
                Continue to Mental Swasthya
                <FiArrowRight size={16} />
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <FiAlertCircle size={24} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Verification Failed</span>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Link Expired or Invalid
                  </h2>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                {message}
              </p>

              {/* Resend Verification Form */}
              <form onSubmit={handleResend} className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#8fb39c] tracking-wide block">
                  Request a New Verification Link
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-gray-400/80" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] text-white font-bold py-3 text-xs uppercase tracking-wider transition-all border border-[#144729] shadow-inner flex items-center justify-center gap-2"
                >
                  {resending ? "Sending..." : "Resend Verification Link"}
                  <FiRefreshCw size={13} className={resending ? "animate-spin" : ""} />
                </button>
              </form>

              <div className="pt-2 border-t border-[#144729] text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-xs text-gray-400 hover:text-white font-semibold transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../Api/authApi";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiLock, FiArrowRight } from "react-icons/fi";
import loginicon from "../Assets/logo.jpg";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ token, password });
      toast.success(res?.data?.message || "Password reset successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Failed to reset password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen supports-[height:100dvh]:min-h-dvh relative flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background Split Screen */}
      <div className="absolute inset-0 w-full h-full flex select-none pointer-events-none">
        <div className="w-1/2 h-full bg-[#052012]" />
        <div className="w-1/2 h-full bg-[#eef5e7]" />
      </div>

      {/* Decorative leaf icons */}
      <div className="absolute top-6 left-6 text-white/20 opacity-30 select-none pointer-events-none hidden md:block">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.58,20.43C9.37,20.8 11.23,20.41 12.83,19.38C16.89,16.76 18.23,11.43 17,8M12.24,17.42C10.74,18.06 9,17.79 7.69,16.63C6,15.11 6.09,12.39 7.82,11C11.5,8 14.5,10.5 12.24,17.42Z" />
        </svg>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[960px] bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-gray-200/40 relative z-10 flex flex-col md:flex-row md:min-h-[520px]">
        {/* Left panel: Branding */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-6 py-7 sm:p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 select-none">
          <img
            src={loginicon}
            alt="logo"
            className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-2xl sm:rounded-3xl border border-gray-150 shadow-md mb-4 md:mb-6"
          />
          <h1
            className="text-[#0a331c] tracking-tight font-medium text-center text-[2.125rem] sm:text-[2.5rem]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              lineHeight: "1.1",
            }}
          >
            Mental Swasthya
          </h1>
          <p className="text-gray-400 text-xs font-medium tracking-wide text-center mt-3">
            Set your new account password
          </p>
        </div>

        {/* Right panel: Reset Password Form */}
        <div className="w-full md:w-1/2 bg-[#0a331c] flex flex-col justify-center px-5 py-7 sm:p-8 md:p-12 relative text-white">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Reset Password
          </h2>
          <p className="text-xs text-[#8fb39c] font-medium mb-6">
            Enter your new password below to regain access to your account.
          </p>

          {!token ? (
            <div className="bg-[#062413] border border-amber-600/40 text-amber-300 p-4 rounded-xl text-xs space-y-2">
              <p className="font-semibold">Reset Token Missing or Invalid</p>
              <p className="text-gray-300">
                Please request a password reset from the login page to receive a valid link in your email.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-1 min-h-[44px] text-white underline font-bold"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reset-password" className="block text-xs font-bold text-[#8fb39c] tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <FiLock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 pointer-events-none" />
                  <input
                    id="reset-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-base md:text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    aria-controls="reset-password"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fb39c]"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reset-confirm-password" className="block text-xs font-bold text-[#8fb39c] tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 pointer-events-none" />
                  <input
                    id="reset-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl bg-[#062413] border border-[#144729] px-11 py-3 text-base md:text-sm outline-none focus:border-[#8fb39c] text-white placeholder-gray-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-pressed={showConfirmPassword}
                    aria-controls="reset-confirm-password"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fb39c]"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#062413] hover:bg-[#03140a] text-white font-bold py-3.5 text-sm transition-all border border-[#144729] shadow-inner mt-2 flex items-center justify-center gap-2"
              >
                {loading ? "Resetting..." : "Update Password"}
                <FiArrowRight size={15} />
              </button>

              <p className="text-center text-xs font-semibold text-[#8fb39c] mt-5 select-none">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-block -my-3 -mx-1 px-1 py-3 rounded-md text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8fb39c] cursor-pointer font-bold"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

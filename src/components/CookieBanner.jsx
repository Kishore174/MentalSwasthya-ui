import React, { useEffect, useState } from "react";

const STORAGE_KEY = "ms_cookie_consent";

const readConsent = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!readConsent());
  }, []);

  const choose = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* storage unavailable: just hide for this session */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-[9999] rounded-2xl bg-white border border-[#dbe7d3] shadow-[0_12px_40px_rgba(0,0,0,0.18)] p-4 text-[#22331b]"
    >
      <p className="text-sm font-bold">We use cookies</p>
      <p className="text-xs text-gray-600 mt-1 leading-5">
        Mental Swasthya uses essential cookies to keep you signed in and, with your permission, analytics cookies to
        improve your experience. You can change your choice at any time by clearing site data.
      </p>
      <div className="flex gap-2 mt-3 justify-end">
        <button
          type="button"
          onClick={() => choose("essential")}
          className="min-h-[40px] px-4 rounded-lg border border-[#dbe7d3] text-xs font-bold text-[#3a4d31] hover:bg-[#f2f6ee]"
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => choose("all")}
          className="min-h-[40px] px-4 rounded-lg bg-[#1e382b] hover:bg-[#14281e] text-xs font-bold text-white"
        >
          Accept all
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;

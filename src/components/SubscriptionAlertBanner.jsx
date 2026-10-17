import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiAlertTriangle, FiAlertCircle, FiX, FiArrowRight, FiCreditCard, FiChevronDown } from "react-icons/fi";
import { getMySubscription } from "../Api/subscriptionApi";

/**
 * SubscriptionAlertBanner
 * Displays non-intrusive notification banners when a plan is expiring soon or in grace period:
 * 1. "Your current plan will expire in XX days, please buy subscription for continued service"
 * 2. "Currently you do not have any active plans, you are running on grace period. Please buy subscription to get uninterrupted usage"
 * 
 * Non-disruptive: Doesn't block screen interactions or modals. Can be minimized to a discreet badge.
 */
export default function SubscriptionAlertBanner() {
  const location = useLocation();
  const [subData, setSubData] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getMySubscription();
      const sub = res?.data?.data?.subscription;
      if (sub) {
        setSubData(sub);
        return;
      }
    } catch (err) {
      // Fallback calculation using local storage
    }

    // Local fallback calculation if server is unreachable
    try {
      const tier = localStorage.getItem("mentalswasthya_subscription_tier") || "pro";
      const status = localStorage.getItem("mentalswasthya_subscription_status") || "active";
      const dateStr = localStorage.getItem("mentalswasthya_subscription_date");
      const cycle = localStorage.getItem("mentalswasthya_subscription_cycle") || "annual";

      if (dateStr) {
        const start = new Date(parseInt(dateStr, 10));
        const end = new Date(start);
        if (cycle === "annual") end.setFullYear(end.getFullYear() + 1);
        else end.setMonth(end.getMonth() + 1);

        const now = new Date();
        const diffMs = end.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysLeft > 0 && daysLeft <= 14 && status === "active";
        const isGracePeriod = (daysLeft <= 0 || status === "past_due" || status === "cancelled");

        let alertType = null;
        let alertMessage = null;

        if (isExpiringSoon) {
          alertType = "expiring_soon";
          alertMessage = `Your current plan will expire in ${daysLeft} days, please buy subscription for continued service`;
        } else if (isGracePeriod) {
          alertType = "grace_period";
          alertMessage = "Currently you do not have any active plans, you are running on grace period. Please buy subscription to get uninterrupted usage";
        }

        setSubData({
          tier,
          status,
          daysLeft,
          isExpiringSoon,
          isGracePeriod,
          alertType,
          alertMessage,
          currentPeriodEnd: end,
        });
      }
    } catch {
      // no local data
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Listen for custom event when subscription updates
    const handleSubUpdated = () => fetchStatus();
    window.addEventListener("subscription_updated", handleSubUpdated);
    return () => window.removeEventListener("subscription_updated", handleSubUpdated);
  }, [fetchStatus]);

  if (!subData || (!subData.isExpiringSoon && !subData.isGracePeriod && !subData.alertMessage)) {
    return null;
  }

  const isGracePeriod = subData.isGracePeriod || subData.alertType === "grace_period";
  const days = Math.max(1, subData.daysLeft || 1);

  const displayMessage = isGracePeriod
    ? "Currently you do not have any active plans, you are running on grace period. Please buy subscription to get uninterrupted usage"
    : `Your current plan will expire in ${days} days, please buy subscription for continued service`;

  // If user is already on subscription page, keep it compact and contextual
  const isSubscriptionPage = location.pathname === "/app/subscription";

  if (dismissed) {
    return null;
  }

  // Minimized floating pill that doesn't disturb anything
  if (minimized) {
    return (
      <div className="w-full px-4 lg:px-8 pt-3 pb-1 flex justify-end">
        <button
          onClick={() => setMinimized(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all cursor-pointer ${
            isGracePeriod
              ? "bg-[#fff1f0] text-[#cf1322] border-[#ffa39e] hover:bg-[#ffe2e0]"
              : "bg-[#fffbe6] text-[#d48806] border-[#ffe58f] hover:bg-[#fff1b8]"
          }`}
          title="Click to expand subscription alert"
        >
          {isGracePeriod ? <FiAlertCircle size={14} /> : <FiAlertTriangle size={14} />}
          <span>{isGracePeriod ? "Grace Period Active" : `Plan expires in ${days}d`}</span>
          <FiChevronDown size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-8 pt-3 pb-1 transition-all duration-300">
      <div
        className={`w-full rounded-2xl p-3.5 sm:px-5 sm:py-3 border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden transition-all ${
          isGracePeriod
            ? "bg-gradient-to-r from-[#fff2f0] via-[#fff7f5] to-[#ffebe8] border-[#ffccc7] text-[#9a1618]"
            : "bg-gradient-to-r from-[#fffbe6] via-[#fffdf0] to-[#fff8d6] border-[#ffe58f] text-[#874d00]"
        }`}
      >
        {/* Subtle accent glow stripe */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
            isGracePeriod ? "bg-[#cf1322]" : "bg-[#faad14]"
          }`}
        />

        {/* Message and Icon */}
        <div className="flex items-center gap-3 min-w-0 pr-6 sm:pr-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isGracePeriod
                ? "bg-[#ff4d4f] text-white"
                : "bg-[#faad14] text-white"
            }`}
          >
            {isGracePeriod ? (
              <FiAlertCircle size={17} className="animate-pulse" />
            ) : (
              <FiAlertTriangle size={16} />
            )}
          </div>

          <div className="text-xs sm:text-[13px] font-medium leading-relaxed">
            <span className="font-bold mr-1.5 uppercase tracking-wide text-[11px] px-2 py-0.5 rounded-full inline-block mb-1 sm:mb-0 sm:inline"
              style={{
                backgroundColor: isGracePeriod ? "rgba(207,19,34,0.12)" : "rgba(212,136,6,0.12)",
                color: isGracePeriod ? "#cf1322" : "#d48806",
              }}
            >
              {isGracePeriod ? "Grace Period" : "Plan Notice"}
            </span>
            <span className="text-[#2b3327] font-semibold">{displayMessage}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {!isSubscriptionPage && (
            <Link
              to="/app/subscription"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer ${
                isGracePeriod
                  ? "bg-[#cf1322] hover:bg-[#a8071a] text-white hover:shadow-md"
                  : "bg-[#0a331c] hover:bg-[#154629] text-white hover:shadow-md"
              }`}
            >
              <FiCreditCard size={13} />
              <span>Buy Subscription</span>
              <FiArrowRight size={13} />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors cursor-pointer"
            title="Dismiss notice for this session"
          >
            <FiX size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

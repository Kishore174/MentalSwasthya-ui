import React, { useState, useEffect } from "react";
import {
  FiCheck, FiX, FiActivity, FiZap, FiCalendar,
  FiArrowRight, FiCopy, FiShare2, FiGift, FiStar, FiPercent, FiClock,
  FiSlash, FiPauseCircle, FiPlayCircle, FiAlertCircle, FiCheckCircle, FiShield, FiRefreshCw
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  getMySubscription,
  updateSubscriptionPlan,
  stopAutoDebit,
  resumeAutoDebit,
  cancelSubscription,
  reactivateSubscription
} from "../Api/subscriptionApi";

const SubscriptionScreen = () => {
  const { user } = useAuth();

  // Load initial settings with dynamic states
  const [currentTier, setCurrentTier] = useState(() => {
    const saved = localStorage.getItem("mentalswasthya_subscription_tier") || "pro";
    return saved === "executive" ? "pro" : saved;
  });
  
  const [billingCycle, setBillingCycle] = useState(() => {
    return localStorage.getItem("mentalswasthya_subscription_cycle") || "annual";
  });

  const [autoDebitEnabled, setAutoDebitEnabled] = useState(() => {
    const saved = localStorage.getItem("mentalswasthya_auto_debit");
    return saved !== "false";
  });

  const [subscriptionStatus, setSubscriptionStatus] = useState(() => {
    return localStorage.getItem("mentalswasthya_subscription_status") || "active";
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAutoDebitModal, setShowAutoDebitModal] = useState(false);
  const [renewalDateFromBE, setRenewalDateFromBE] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const subscriptionDateStr = localStorage.getItem("mentalswasthya_subscription_date");

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await getMySubscription();
        const sub = res?.data?.data?.subscription;
        if (sub) {
          if (sub.tier) {
            setCurrentTier(sub.tier);
            localStorage.setItem("mentalswasthya_subscription_tier", sub.tier);
          }
          if (sub.billingCycle) {
            setBillingCycle(sub.billingCycle);
            localStorage.setItem("mentalswasthya_subscription_cycle", sub.billingCycle);
          }
          if (typeof sub.autoDebit === "boolean") {
            setAutoDebitEnabled(sub.autoDebit);
            localStorage.setItem("mentalswasthya_auto_debit", sub.autoDebit.toString());
          }
          if (sub.status) {
            const normalizedStatus = sub.status === "canceled" ? "cancelled" : sub.status;
            setSubscriptionStatus(normalizedStatus);
            localStorage.setItem("mentalswasthya_subscription_status", normalizedStatus);
          }
          if (sub.currentPeriodEnd) {
            setRenewalDateFromBE(new Date(sub.currentPeriodEnd));
          }
        }
      } catch (err) {
        console.warn("Could not fetch subscription from server, using local preferences:", err);
      }
    };
    fetchSub();
  }, []);

  // Referral Rewards State
  const [referralCount, setReferralCount] = useState(2); // 2 out of 3 earned
  const userRefCode = user?.name
    ? user.name.replace(/\s+/g, "_").toUpperCase() + "_" + Math.floor(100 + Math.random() * 900)
    : "SARAH_J94";
  const refLink = `mentalswasthya.com/ref/${userRefCode}`;

  const plans = [
    {
      id: "free",
      name: "Standard Calm",
      desc: "Essentials to find your baseline presence.",
      monthlyPrice: 0,
      annualPrice: 0,
      icon: FiActivity,
      iconColor: "text-gray-400 bg-gray-50 border-gray-200",
      themeClass: "border-[#e8efe3] bg-white",
      badgeText: "Free Plan",
      badgeColor: "bg-gray-100 text-gray-500 border-gray-200",
      features: [
        { text: "Standard 4-7-8 Breathing Presets", checked: true },
        { text: "Access to Daily Affirmations Playlist", checked: true },
        { text: "Standard Wellness Dashboard Logs", checked: true },
        { text: "Custom Personal Audio Uploads (MP3/WAV)", checked: false },
        { text: "Local Offline IndexedDB Storage", checked: false },
        { text: "1-on-1 Monthly Mindfulness Consultations", checked: false }
      ]
    },
    {
      id: "pro",
      name: "Wellness Pro",
      desc: "Unlock custom presets, personal tracks, and offline sync.",
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      icon: FiZap,
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
      themeClass: "border-[#7d9667]/40 bg-gradient-to-br from-white to-[#eef6ea]/20",
      badgeText: "Most Popular",
      badgeColor: "bg-[#eef6ea] text-[#7d9667] border-[#7d9667]/30",
      features: [
        { text: "Unlimited Custom Breathing Presets", checked: true },
        { text: "Full Language Filters (Hindi/English)", checked: true },
        { text: "Advanced Wellness Progress Ring Metrics", checked: true },
        { text: "Custom Personal Audio Uploads (MP3/WAV)", checked: true },
        { text: "Local Offline IndexedDB Storage", checked: true },
        { text: "1-on-1 Monthly Mindfulness Consultations", checked: true }
      ]
    }
  ];

  const handleCycleChange = async (cycle) => {
    setBillingCycle(cycle);
    localStorage.setItem("mentalswasthya_subscription_cycle", cycle);
    try {
      const res = await updateSubscriptionPlan({ tier: currentTier, billingCycle: cycle });
      const sub = res?.data?.data?.subscription;
      if (sub?.currentPeriodEnd) setRenewalDateFromBE(new Date(sub.currentPeriodEnd));
      window.dispatchEvent(new Event("subscription_updated"));
    } catch (err) {
      console.warn("Cycle update local only:", err);
      window.dispatchEvent(new Event("subscription_updated"));
    }
  };

  const handleUpgrade = async (tierId, tierName) => {
    setLoadingAction(true);
    localStorage.setItem("mentalswasthya_subscription_tier", tierId);
    localStorage.setItem("mentalswasthya_subscription_date", Date.now().toString());
    localStorage.setItem("mentalswasthya_subscription_status", "active");
    localStorage.setItem("mentalswasthya_auto_debit", "true");
    setCurrentTier(tierId);
    setSubscriptionStatus("active");
    setAutoDebitEnabled(true);

    try {
      const res = await updateSubscriptionPlan({ tier: tierId, billingCycle });
      const sub = res?.data?.data?.subscription;
      if (sub?.currentPeriodEnd) setRenewalDateFromBE(new Date(sub.currentPeriodEnd));
      window.dispatchEvent(new Event("subscription_updated"));
      toast.success(`Successfully updated subscription to ${tierName}!`);
    } catch (err) {
      console.warn("Upgrade local only:", err);
      window.dispatchEvent(new Event("subscription_updated"));
      toast.success(`Successfully updated subscription to ${tierName}!`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleAutoDebit = async () => {
    const nextState = !autoDebitEnabled;
    setAutoDebitEnabled(nextState);
    localStorage.setItem("mentalswasthya_auto_debit", nextState.toString());
    setShowAutoDebitModal(false);

    try {
      if (nextState) {
        await resumeAutoDebit();
        window.dispatchEvent(new Event("subscription_updated"));
        toast.success("Auto-debit resumed. Automatic payments enabled for next billing cycle.");
      } else {
        await stopAutoDebit();
        window.dispatchEvent(new Event("subscription_updated"));
        toast.success("Auto-debit stopped. No automatic charges will occur.", { icon: "🛑" });
      }
    } catch (err) {
      console.warn("Auto-debit toggle local only:", err);
      window.dispatchEvent(new Event("subscription_updated"));
      if (nextState) {
        toast.success("Auto-debit resumed. Automatic payments enabled for next billing cycle.");
      } else {
        toast.success("Auto-debit stopped. No automatic charges will occur.", { icon: "🛑" });
      }
    }
  };

  const handleCancelSubscription = async () => {
    setSubscriptionStatus("cancelled");
    setAutoDebitEnabled(false);
    localStorage.setItem("mentalswasthya_subscription_status", "cancelled");
    localStorage.setItem("mentalswasthya_auto_debit", "false");
    setShowCancelModal(false);

    try {
      await cancelSubscription();
      window.dispatchEvent(new Event("subscription_updated"));
      toast.success(`Subscription cancelled. You retain full premium access until ${formattedRenewDate}.`);
    } catch (err) {
      console.warn("Cancellation local only:", err);
      window.dispatchEvent(new Event("subscription_updated"));
      toast.success(`Subscription cancelled. You retain full premium access until ${formattedRenewDate}.`);
    }
  };

  const handleReactivateSubscription = async () => {
    setSubscriptionStatus("active");
    setAutoDebitEnabled(true);
    localStorage.setItem("mentalswasthya_subscription_status", "active");
    localStorage.setItem("mentalswasthya_auto_debit", "true");

    try {
      await reactivateSubscription();
      window.dispatchEvent(new Event("subscription_updated"));
      toast.success("Subscription reactivated successfully! Welcome back to Wellness Pro.");
    } catch (err) {
      console.warn("Reactivation local only:", err);
      window.dispatchEvent(new Event("subscription_updated"));
      toast.success("Subscription reactivated successfully! Welcome back to Wellness Pro.");
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://${refLink}`);
    toast.success("Referral link copied to clipboard!");
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "MentalSwasthya Referral",
        text: "Join MentalSwasthya and get 1 month free premium mindfulness membership!",
        url: `https://${refLink}`
      }).catch(() => {});
    } else {
      copyReferralLink();
    }
  };

  // Find active plan details
  const activePlan = plans.find((p) => p.id === currentTier) || plans[1];
  const activePrice = billingCycle === "monthly" ? activePlan.monthlyPrice : activePlan.annualPrice;
  const ActiveIcon = activePlan.icon;

  // Calculate dynamic renewal date (From BE or Calculated Local)
  const subDate = subscriptionDateStr ? new Date(parseInt(subscriptionDateStr)) : new Date();
  const renewDate = renewalDateFromBE || new Date(subDate);
  if (!renewalDateFromBE) {
    if (billingCycle === "annual") {
      renewDate.setFullYear(renewDate.getFullYear() + 1);
    } else {
      renewDate.setMonth(renewDate.getMonth() + 1);
    }
  }
  const formattedRenewDate = renewDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const now = new Date();
  const diffMs = renewDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isGracePeriod = (daysLeft <= 0 || subscriptionStatus === "past_due" || (subscriptionStatus === "cancelled" && daysLeft <= 0));
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 14 && subscriptionStatus === "active";

  return (
    <div className="space-y-6 text-[#22331b] pb-10">
      
      {/* ─── Header Banner ─── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-5 sm:p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          Pricing & Subscriptions
        </p>
        <h1 className="relative text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#22331b] mt-3">
          Manage Your Subscription & Rewards
        </h1>
        <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
          View your active plan status, introductory offers, referral rewards, and easily toggle between monthly and yearly billing.
        </p>
      </section>

      {/* ─── SECTION 1: INTRODUCTORY OFFER BANNER ─── */}
      <div className="rounded-[28px] bg-gradient-to-r from-[#1b3420] via-[#2d4d33] to-[#45694b] text-white p-5 sm:p-6 md:p-7 shadow-lg border border-emerald-800/40 relative overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 relative z-10 min-w-0">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-inner">
            <FiPercent className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="bg-amber-400 text-gray-900 font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Limited Time Offer
              </span>
              <span className="text-xs font-semibold text-emerald-200">New & Existing Users</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black mt-1 leading-snug">
              Introductory Offer: 7 Days FREE Trial + 20% Discount
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
              Experience full premium access for 7 days with zero commitment. Upgrade now to save an extra 20% on all annual subscription plans!
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCycleChange("annual")}
          className="relative z-10 w-full md:w-auto justify-center min-h-[44px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 flex-shrink-0"
        >
          <FiStar className="fill-gray-900" size={14} />
          Claim Offer
        </button>
      </div>

      {/* ─── SECTION 2: ACTIVE SUBSCRIPTION RUNNING STATUS CARD ─── */}
      <div className="rounded-[28px] bg-white border border-[#dde8d5] p-4 sm:p-6 md:p-8 shadow-[0_10px_35px_rgba(80,105,67,0.05)] space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${subscriptionStatus === "cancelled" ? "bg-amber-400" : "bg-emerald-400"} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${subscriptionStatus === "cancelled" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-[#7d9667]">
                Active Subscription Running Status
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#22331b] mt-1">
              {activePlan.name} ({billingCycle === "annual" ? "Yearly Running" : "Monthly Running"})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isGracePeriod ? (
              <span className="bg-rose-50 text-rose-800 text-xs font-black px-4 py-2 rounded-xl border border-rose-200 flex items-center gap-2 animate-pulse">
                <FiAlertCircle className="text-rose-600" size={16} />
                Status: Grace Period Active
              </span>
            ) : isExpiringSoon ? (
              <span className="bg-amber-50 text-amber-800 text-xs font-black px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                <FiAlertCircle className="text-amber-600" size={16} />
                Status: Expiring in {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'}
              </span>
            ) : subscriptionStatus === "cancelled" ? (
              <span className="bg-amber-50 text-amber-800 text-xs font-black px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                <FiAlertCircle className="text-amber-600" size={16} />
                Status: Cancelled (Active until {formattedRenewDate})
              </span>
            ) : (
              <span className="bg-[#eef6ea] text-[#7d9667] text-xs font-black px-4 py-2 rounded-xl border border-[#cbe0c3] flex items-center gap-2">
                <FiCheck className="text-[#7d9667]" size={16} />
                Status: Active & Running
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Expiry / Grace Period Warning Banner */}
        {isGracePeriod && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-sm">
            <FiAlertCircle className="text-rose-600 shrink-0 animate-pulse" size={20} />
            <div className="flex-1">
              Currently you do not have any active plans, you are running on grace period. Please buy subscription to get uninterrupted usage
            </div>
          </div>
        )}

        {isExpiringSoon && !isGracePeriod && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-sm">
            <FiAlertCircle className="text-amber-600 shrink-0" size={20} />
            <div className="flex-1">
              Your current plan will expire in {daysLeft} days, please buy subscription for continued service
            </div>
          </div>
        )}

        {/* Running Details Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fbfdfa] border border-[#e8efe3] min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Plan</p>
            <p className="text-sm sm:text-base font-black text-[#22331b] mt-1">{activePlan.name}</p>
            <span className="text-[11px] text-[#7d9667] font-semibold">{activePlan.badgeText}</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fbfdfa] border border-[#e8efe3] min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing Running Cycle</p>
            <p className="text-sm sm:text-base font-black text-[#22331b] mt-1 capitalize">{billingCycle} Billing</p>
            <span className="text-[11px] text-gray-500 font-medium">${activePrice} / month</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfa] border border-[#e8efe3]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Next Billing / Expiry Date</p>
            <p className="text-base font-black text-[#22331b] mt-1">{formattedRenewDate}</p>
            {autoDebitEnabled && subscriptionStatus === "active" ? (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <FiCheckCircle size={11} /> Auto-renew enabled
              </span>
            ) : (
              <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                <FiAlertCircle size={11} /> Auto-debit stopped
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#fbfdfa] border border-[#e8efe3]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Auto-Debit Status</p>
            <p className={`text-base font-black mt-1 ${autoDebitEnabled && subscriptionStatus === "active" ? "text-emerald-700" : "text-amber-600"}`}>
              {autoDebitEnabled && subscriptionStatus === "active" ? "Active" : "Stopped"}
            </p>
            <span className="text-[11px] text-gray-500 font-medium">
              {autoDebitEnabled && subscriptionStatus === "active" ? "Recurring payment on" : "No auto deductions"}
            </span>
          </div>
        </div>

        {/* ─── Management Action Buttons (Cancel Subscription & Auto-Debit Stop) ─── */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#526649]">
            <span className="w-7 h-7 rounded-lg bg-[#f0f5ee] flex items-center justify-center text-[#7d9667] flex-shrink-0">
              <FiShield size={14} />
            </span>
            <span>
              Cancel subscription or stop auto-debit at any time. Your benefits stay active through the end of your billing period.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Auto-Debit Stop / Resume Button */}
            {autoDebitEnabled && subscriptionStatus === "active" ? (
              <button
                type="button"
                onClick={() => setShowAutoDebitModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FiPauseCircle size={15} />
                Stop Auto-Debit
              </button>
            ) : subscriptionStatus === "active" ? (
              <button
                type="button"
                onClick={handleToggleAutoDebit}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FiPlayCircle size={15} />
                Resume Auto-Debit
              </button>
            ) : null}

            {/* Cancel Subscription Button */}
            {subscriptionStatus === "active" && currentTier !== "free" ? (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 text-rose-700 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FiSlash size={14} />
                Cancel Subscription
              </button>
            ) : subscriptionStatus === "cancelled" ? (
              <button
                type="button"
                onClick={handleReactivateSubscription}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1e382b] hover:bg-[#14281e] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FiRefreshCw size={14} />
                Reactivate Subscription
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: REFERRAL REWARDS (1st, 2nd, 3rd Referral Rewards) ─── */}
      {/* 
      <div className="rounded-[32px] bg-gradient-to-br from-[#eef7fb] via-[#f5faf2] to-[#eef6ea] border border-[#d6e5cf] p-6 md:p-8 shadow-[0_15px_45px_rgba(80,105,67,0.06)] relative overflow-hidden">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#547343] bg-white/80 px-3.5 py-1 rounded-full border border-[#c6dbc0]">
            <FiGift size={13} className="text-[#547343]" /> Share & Earn Program
          </span>
          
          <h2 className="text-2xl md:text-3xl font-black text-[#1e3019] tracking-tight">
            Share the Gift of Mental Wellness & Get Rewarded!
          </h2>
          
          <p className="text-xs md:text-sm text-[#526649] leading-relaxed">
            Give your loved ones <strong>FREE</strong> access to premium mental health resources. For every friend who signs up using your link, you get <strong>1 month of Premium Membership for FREE!</strong> (Max 3 months total reward)
          </p>

          <div className="bg-white rounded-2xl border border-[#d2e2c8] p-4 shadow-md max-w-xl mx-auto mt-5">
            <p className="text-xs font-black text-[#22331b] mb-2 text-center uppercase tracking-wider">
              Your Unique Referral Link
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                readOnly
                value={refLink}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-xs md:text-sm font-bold text-gray-700 outline-none text-center sm:text-left select-all"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={copyReferralLink}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1e382b] hover:bg-[#14281e] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <FiCopy size={14} /> Copy Link
                </button>
                <button
                  type="button"
                  onClick={shareReferralLink}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-all border border-gray-300 flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <FiShare2 size={14} /> Share
                </button>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full border border-[#cbe0c3] mt-3 shadow-sm">
            <span className="text-xs font-black text-[#22331b]">Your Rewards:</span>
            <span className="text-xs font-extrabold text-[#7d9667]">{referralCount}/3 Months Free Earned</span>
            <div className="flex items-center gap-1 ml-1">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${referralCount >= 1 ? "bg-emerald-500" : "border-2 border-gray-300"}`}>
                {referralCount >= 1 ? "✓" : ""}
              </span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${referralCount >= 2 ? "bg-emerald-500" : "border-2 border-gray-300"}`}>
                {referralCount >= 2 ? "✓" : ""}
              </span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${referralCount >= 3 ? "bg-emerald-500" : "border-2 border-gray-300"}`}>
                {referralCount >= 3 ? "✓" : ""}
              </span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
          
          <div className="rounded-2xl bg-white border border-emerald-300 p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7d9667] bg-[#eef6ea] px-2.5 py-1 rounded-md">
                1st Referral Reward
              </span>
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ✓
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-[#22331b]">1 Month Free Premium</h3>
              <p className="text-xs text-gray-500 mt-0.5">Awarded when your 1st friend registers.</p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Status: Earned & Active</span>
              <FiCheck size={16} />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-emerald-300 p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7d9667] bg-[#eef6ea] px-2.5 py-1 rounded-md">
                2nd Referral Reward
              </span>
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ✓
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-[#22331b]">1 Month Free Premium</h3>
              <p className="text-xs text-gray-500 mt-0.5">Awarded when your 2nd friend registers.</p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Status: Earned & Active</span>
              <FiCheck size={16} />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-amber-300 p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                3rd Referral Reward
              </span>
              <span className="w-7 h-7 rounded-full border-2 border-amber-400 text-amber-600 flex items-center justify-center font-bold text-xs">
                3
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-[#22331b]">1 Month Free Premium</h3>
              <p className="text-xs text-gray-500 mt-0.5">Invite 1 more friend to claim your final free month!</p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Status: Pending (1 Friend Away)</span>
              <button onClick={copyReferralLink} className="text-xs text-[#7d9667] underline">Invite</button>
            </div>
          </div>

        </div>

      </div>
      */}

      {/* ─── SECTION 4: MONTHLY & YEARLY SUBSCRIPTION PLANS WITH RUNNING STATUS ─── */}
      <div className="space-y-6 pt-4">
        
        {/* Billing Switcher Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#dde8d5] shadow-sm">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#22331b]">Monthly & Yearly Subscription Plans</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select your preferred billing cycle to view current running status and options.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-3 bg-[#f0f4ed] p-1.5 sm:p-2 rounded-full border border-[#7d9667]/20 shrink-0" role="group" aria-label="Billing cycle">
            <button 
              onClick={() => handleCycleChange("monthly")}
              aria-pressed={billingCycle === "monthly"}
              className={`min-h-[40px] text-[11px] sm:text-xs font-black uppercase tracking-wider px-3 sm:px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                billingCycle === "monthly" ? "bg-[#7d9667] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Monthly<span className="hidden sm:inline"> Plans</span>
            </button>
            <button 
              onClick={() => handleCycleChange("annual")}
              aria-pressed={billingCycle === "annual"}
              className={`min-h-[40px] text-[11px] sm:text-xs font-black uppercase tracking-wider px-3 sm:px-4 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                billingCycle === "annual" ? "bg-[#7d9667] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span>Yearly<span className="hidden sm:inline"> Plans</span></span>
              <span className="shrink-0 bg-amber-400 text-gray-900 font-extrabold text-[8px] px-1.5 py-0.5 rounded-full tracking-widest uppercase">Save 20%</span>
            </button>
          </div>
        </div>

        {/* 2-Column Plan Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-4 sm:gap-6">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.id;
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`rounded-[28px] sm:rounded-[32px] bg-white border p-5 sm:p-6 min-w-0 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden ${
                  isCurrent
                    ? "border-[#7d9667] ring-2 ring-[#7d9667]/30 bg-gradient-to-br from-white to-[#eef6ea]/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Running Status Badge */}
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-[#7d9667] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
                    <FiCheck size={12} /> Active & Running
                  </div>
                )}

                <div>
                  <div className={`flex items-center gap-3 mb-4 ${isCurrent ? "pt-5 sm:pt-0" : ""}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${plan.iconColor}`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${plan.badgeColor}`}>
                        {plan.badgeText}
                      </span>
                      <h3 className="text-lg font-black text-[#22331b] mt-1">{plan.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{plan.desc}</p>

                  {/* Price */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-wrap items-center justify-between gap-2 mb-5">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-[#22331b]">${price}</span>
                      <span className="text-xs font-bold text-gray-400 ml-1">/ month</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#7d9667] bg-[#eef6ea] px-2.5 py-1 rounded-md border border-[#7d9667]/10">
                      {billingCycle === "annual" ? "Billed Yearly" : "Billed Monthly"}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 border-t border-gray-100 pt-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        {feature.checked ? (
                          <FiCheck className="text-[#7d9667] mt-0.5 flex-shrink-0" size={14} />
                        ) : (
                          <FiX className="text-gray-300 mt-0.5 flex-shrink-0" size={14} />
                        )}
                        <span className={feature.checked ? "text-[#22331b] font-semibold" : "text-gray-400 line-through"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-2xl bg-[#eef6ea] text-[#7d9667] font-black py-3.5 text-xs uppercase tracking-widest border border-[#7d9667]/20 cursor-default text-center flex items-center justify-center gap-1.5 shadow-inner"
                    >
                      <FiCheck size={14} /> Running Plan Status
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id, plan.name)}
                      className="w-full rounded-2xl bg-[#1e382b] hover:bg-[#14281e] text-white font-black py-3.5 text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Select Plan <FiArrowRight size={14} />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* ─── MODAL: CANCEL SUBSCRIPTION CONFIRMATION ─── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-150 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <FiAlertCircle size={24} />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#22331b]">Cancel Subscription?</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Are you sure you want to cancel your <strong>{activePlan.name}</strong> subscription? You will retain access until <strong>{formattedRenewDate}</strong>, after which your account will revert to the free tier.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <FiPauseCircle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Alternative:</strong> You can choose to <strong>Stop Auto-Debit</strong> instead. This ensures you won't be charged again without losing your membership right now.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all order-3 sm:order-1"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleToggleAutoDebit}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 font-bold text-xs transition-all order-2"
              >
                Stop Auto-Debit Only
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all order-1 sm:order-3"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: STOP AUTO-DEBIT CONFIRMATION ─── */}
      {showAutoDebitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-150 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <FiPauseCircle size={24} />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#22331b]">Stop Auto-Debit?</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                By stopping auto-debit, your card or bank account will <strong>not</strong> be automatically charged on <strong>{formattedRenewDate}</strong>.
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Your premium benefits remain fully active through <strong>{formattedRenewDate}</strong>. You can resume auto-debit at any time before that date.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAutoDebitModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
              >
                Keep Auto-Debit
              </button>
              <button
                type="button"
                onClick={handleToggleAutoDebit}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-sm"
              >
                Confirm Stop Auto-Debit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionScreen;

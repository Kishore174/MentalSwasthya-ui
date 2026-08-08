import React, { useState } from "react";
import { FiCheck, FiX, FiActivity, FiBriefcase, FiZap, FiCalendar, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

const SubscriptionScreen = () => {
  // Load initial settings with dynamic states
  const [currentTier, setCurrentTier] = useState(() => {
    return localStorage.getItem("mentalswasthya_subscription_tier") || "free";
  });
  
  const [billingCycle, setBillingCycle] = useState(() => {
    return localStorage.getItem("mentalswasthya_subscription_cycle") || "annual";
  });

  const subscriptionDateStr = localStorage.getItem("mentalswasthya_subscription_date");

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
      themeClass: "border-[#7d9667]/40 bg-gradient-to-br from-white to-[#eef6ea]/10",
      badgeText: "Recommended Upgrade",
      badgeColor: "bg-[#eef6ea] text-[#7d9667] border-[#7d9667]/30",
      features: [
        { text: "Unlimited Custom Breathing Presets", checked: true },
        { text: "Full Language Filters (Hindi/English)", checked: true },
        { text: "Advanced Wellness Progress Ring Metrics", checked: true },
        { text: "Custom Personal Audio Uploads (MP3/WAV)", checked: true },
        { text: "Local Offline IndexedDB Storage", checked: true },
        { text: "1-on-1 Monthly Mindfulness Consultations", checked: false }
      ]
    },
    {
      id: "executive",
      name: "Executive Calm",
      desc: "Premium content and private guide consultations.",
      monthlyPrice: 29.99,
      annualPrice: 23.99,
      icon: FiBriefcase,
      iconColor: "text-purple-600 bg-purple-50 border-purple-200",
      themeClass: "border-purple-200 bg-gradient-to-br from-white to-purple-50/10",
      badgeText: "VIP Tier",
      badgeColor: "bg-purple-50 text-purple-600 border-purple-200/50",
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

  const handleCycleChange = (cycle) => {
    setBillingCycle(cycle);
    localStorage.setItem("mentalswasthya_subscription_cycle", cycle);
  };

  // Upgrade handler
  const handleUpgrade = (tierId, tierName) => {
    localStorage.setItem("mentalswasthya_subscription_tier", tierId);
    localStorage.setItem("mentalswasthya_subscription_date", Date.now().toString());
    setCurrentTier(tierId);
    toast.success(`Successfully upgraded to ${tierName}!`);
  };

  // Find plan details
  const activePlan = plans.find((p) => p.id === currentTier) || plans[0];
  const activePrice = billingCycle === "monthly" ? activePlan.monthlyPrice : activePlan.annualPrice;
  const ActiveIcon = activePlan.icon;

  // Determine premium plan display
  let premiumPlan;
  if (currentTier === "free") {
    premiumPlan = plans.find((p) => p.id === "pro");
  } else if (currentTier === "pro") {
    premiumPlan = plans.find((p) => p.id === "executive");
  } else {
    // If already executive, show pro as secondary plan
    premiumPlan = plans.find((p) => p.id === "pro");
  }
  const premiumPrice = billingCycle === "monthly" ? premiumPlan.monthlyPrice : premiumPlan.annualPrice;
  const PremiumIcon = premiumPlan.icon;

  // Calculate dynamic renewal date (Today + 1 Month / 1 Year)
  const subDate = subscriptionDateStr ? new Date(parseInt(subscriptionDateStr)) : new Date();
  const renewDate = new Date(subDate);
  if (billingCycle === "annual") {
    renewDate.setFullYear(renewDate.getFullYear() + 1);
  } else {
    renewDate.setMonth(renewDate.getMonth() + 1);
  }
  const formattedRenewDate = renewDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-6 text-[#22331b] pb-10">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          Pricing & Subscriptions
        </p>
        <h1 className="relative text-3xl md:text-4xl font-black tracking-tight text-[#22331b] mt-3">
          Manage Your Calm Journey
        </h1>
        <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
          Compare your active plan with our premium offerings. Toggle billing cycles and upgrade instantly to unlock advanced features.
        </p>
      </section>

      {/* Billing Switcher Toggle */}
      <div className="flex justify-center items-center gap-3.5 bg-[#f0f4ed]/50 p-2.5 rounded-full max-w-[340px] mx-auto border border-[#7d9667]/10 shadow-sm">
        <span 
          onClick={() => handleCycleChange("monthly")}
          className={`text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${billingCycle === "monthly" ? "text-[#7d9667]" : "text-gray-400"}`}
        >
          Monthly
        </span>
        <button 
          onClick={() => handleCycleChange(billingCycle === "monthly" ? "annual" : "monthly")}
          className="w-12 h-6 rounded-full bg-[#7d9667] p-0.5 relative transition-all duration-300 focus:outline-none"
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-all duration-300 ${billingCycle === "annual" ? "translate-x-6" : ""}`} />
        </button>
        <span 
          onClick={() => handleCycleChange("annual")}
          className={`text-xs font-black uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 ${billingCycle === "annual" ? "text-[#7d9667]" : "text-gray-400"}`}
        >
          Annually
          <span className="bg-amber-400 text-gray-900 font-extrabold text-[8px] px-1.5 py-0.5 rounded-full tracking-widest uppercase">Save 20%</span>
        </span>
      </div>

      {/* Dual comparison grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4 px-1">
        
        {/* Left Card: Active Plan */}
        <div className={`rounded-[32px] bg-white border p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-[0_15px_45px_rgba(80,105,67,0.04)] hover:-translate-y-1 relative overflow-hidden ${activePlan.themeClass}`}>
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#7d9667]/5 rounded-bl-full pointer-events-none" />
          
          <div>
            {/* Header Badge */}
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#eef6ea] text-[#7d9667] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#d2e2c8] shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7d9667] animate-ping" />
                Active Subscription
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <FiCalendar className="text-[#7d9667]" />
                Renew: {formattedRenewDate}
              </span>
            </div>

            {/* Plan Info */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 ${activePlan.iconColor}`}>
                <ActiveIcon size={26} />
              </div>
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${activePlan.badgeColor}`}>
                  {activePlan.badgeText}
                </span>
                <h3 className="text-xl font-black text-[#22331b] mt-1">{activePlan.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{activePlan.desc}</p>
              </div>
            </div>

            {/* Price Display */}
            <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-3xl font-black text-[#22331b]">${activePrice}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">/ month</span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#7d9667] bg-[#eef6ea] px-3 py-1 rounded-lg border border-[#7d9667]/10">
                Billed {billingCycle === "annual" ? "Annually" : "Monthly"}
              </span>
            </div>

            {/* Feature List */}
            <h4 className="text-xs font-black uppercase tracking-wider text-[#66785c] mb-4">Your Active Features</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 border-t border-gray-100 pt-5">
              {activePlan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  {feature.checked ? (
                    <FiCheck className="text-[#7d9667] mt-0.5 flex-shrink-0" size={16} />
                  ) : (
                    <FiX className="text-gray-300 mt-0.5 flex-shrink-0" size={16} />
                  )}
                  <span className={feature.checked ? "text-[#22331b] font-semibold" : "text-gray-400 line-through"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              disabled
              className="w-full rounded-2xl bg-[#eef6ea] text-[#7d9667]/80 font-black py-4 text-xs uppercase tracking-widest border border-[#7d9667]/10 cursor-not-allowed text-center shadow-inner"
            >
              Current Active Tier
            </button>
          </div>
        </div>

        {/* Right Card: Premium / Upgrade Option */}
        <div className={`rounded-[32px] bg-white border p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-[0_20px_50px_rgba(245,158,11,0.06)] hover:-translate-y-1 relative overflow-hidden ${
          currentTier !== "executive" 
            ? "border-amber-400/50 bg-gradient-to-br from-white to-amber-50/5 ring-1 ring-amber-400/20" 
            : premiumPlan.themeClass
        }`}>
          {currentTier !== "executive" && (
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          )}

          <div>
            {/* Header Badge */}
            <div className="flex justify-between items-start mb-6">
              <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${
                currentTier !== "executive" 
                  ? "bg-amber-500 text-white border-amber-500" 
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
                {currentTier !== "executive" ? "✨ Premium Upgrade Option" : "Secondary Option"}
              </span>
              {currentTier !== "executive" && (
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest animate-pulse">
                  Unlocks Instantly
                </span>
              )}
            </div>

            {/* Plan Info */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 ${premiumPlan.iconColor}`}>
                <PremiumIcon size={26} />
              </div>
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${premiumPlan.badgeColor}`}>
                  {premiumPlan.badgeText}
                </span>
                <h3 className="text-xl font-black text-[#22331b] mt-1">{premiumPlan.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{premiumPlan.desc}</p>
              </div>
            </div>

            {/* Price Display */}
            <div className={`my-6 p-4 rounded-2xl flex items-center justify-between shadow-sm border ${
              currentTier !== "executive" ? "bg-amber-50/30 border-amber-200/50" : "bg-gray-50 border-gray-100"
            }`}>
              <div>
                <span className="text-3xl font-black text-[#22331b]">${premiumPrice}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">/ month</span>
              </div>
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                currentTier !== "executive" 
                  ? "text-amber-700 bg-amber-50 border-amber-200" 
                  : "text-gray-500 bg-gray-100 border-gray-200"
              }`}>
                Billed {billingCycle === "annual" ? "Annually" : "Monthly"}
              </span>
            </div>

            {/* Feature List */}
            <h4 className="text-xs font-black uppercase tracking-wider text-[#66785c] mb-4">Included Features</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 border-t border-gray-100 pt-5">
              {premiumPlan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  {feature.checked ? (
                    <FiCheck className={`mt-0.5 flex-shrink-0 ${currentTier !== "executive" ? "text-amber-500" : "text-gray-400"}`} size={16} />
                  ) : (
                    <FiX className="text-gray-300 mt-0.5 flex-shrink-0" size={16} />
                  )}
                  <span className={feature.checked ? "text-[#22331b] font-semibold" : "text-gray-400 line-through"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={() => handleUpgrade(premiumPlan.id, premiumPlan.name)}
              className={`w-full rounded-2xl font-black py-4 text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border ${
                currentTier !== "executive"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:text-gray-900 active:scale-[0.98]"
              }`}
            >
              {currentTier !== "executive" ? "Upgrade to Premium" : "Switch Plan"}
              <FiArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionScreen;

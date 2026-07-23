import React from "react";
import { FiCheck, FiX, FiActivity, FiBriefcase, FiZap } from "react-icons/fi";

const SubscriptionScreen = () => {
  const currentTier = localStorage.getItem("mentalswasthya_subscription_tier") || "free";
  const currentCycle = localStorage.getItem("mentalswasthya_subscription_cycle") || "annual";
  const subscriptionDateStr = localStorage.getItem("mentalswasthya_subscription_date");

  const plans = [
    {
      id: "free",
      name: "Standard Calm",
      desc: "Essentials to find your baseline presence.",
      monthlyPrice: 0,
      annualPrice: 0,
      icon: FiActivity,
      iconColor: "text-gray-400 bg-gray-50",
      themeClass: "border-[#e8efe3] bg-gradient-to-br from-white to-[#f9fafb]",
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
      iconColor: "text-amber-500 bg-amber-50",
      themeClass: "border-[#7d9667] bg-gradient-to-br from-white to-[#eef6ea]/10 shadow-[0_12px_40px_rgba(125,150,103,0.08)]",
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
      iconColor: "text-[#7d9667] bg-[#eef6ea]",
      themeClass: "border-gray-900 bg-gradient-to-br from-white to-gray-50 shadow-[0_12px_40px_rgba(0,0,0,0.06)]",
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

  // Find current plan object
  const activePlan = plans.find((p) => p.id === currentTier) || plans[0];
  const activePrice = currentCycle === "monthly" ? activePlan.monthlyPrice : activePlan.annualPrice;
  const ActiveIcon = activePlan.icon;

  // Calculate dynamic renewal date (Today + 1 Month / 1 Year)
  const subDate = subscriptionDateStr ? new Date(parseInt(subscriptionDateStr)) : new Date();
  const renewDate = new Date(subDate);
  if (currentCycle === "annual") {
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
    <div className="space-y-6 text-[#22331b]">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          Pricing & Subscriptions
        </p>
        <h1 className="relative text-3xl md:text-4xl font-black tracking-tight text-[#22331b] mt-3">
          Your Active Plan details
        </h1>
        <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
          Review your active features, subscription cycle, and dynamic renew terms below.
        </p>
      </section>

      {/* Main Display: Show ONLY the current plan */}
      <div className="max-w-2xl mx-auto pt-4">
        <div className={`rounded-[32px] bg-white border p-6 md:p-8 flex flex-col justify-between transition-all ${activePlan.themeClass}`}>
          <div>
            {/* Active Subscription Badge */}
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#eef6ea] text-[#7d9667] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#d2e2c8] shadow-sm">
                Active Subscription
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Renewal: {formattedRenewDate}
              </span>
            </div>

            {/* Plan Info */}
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${activePlan.iconColor}`}>
                <ActiveIcon size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#22331b]">{activePlan.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{activePlan.desc}</p>
              </div>
            </div>

            {/* Price display */}
            <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-[#22331b]">${activePrice}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">/ month</span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#7d9667] bg-[#eef6ea] px-3 py-1 rounded-lg">
                Billed {currentCycle === "annual" ? "Annually" : "Monthly"}
              </span>
            </div>

            {/* Features list */}
            <h4 className="text-xs font-black uppercase tracking-wider text-[#66785c] mb-4">Included Features</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-gray-100 pt-5">
              {activePlan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default SubscriptionScreen;

import React, { useState } from "react";
import { FiCheck, FiX, FiActivity, FiBriefcase, FiZap, FiCreditCard } from "react-icons/fi";
import { toast } from "react-hot-toast";

const SubscriptionScreen = () => {
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" or "annual"
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvc: "" });
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Standard Calm",
      desc: "Essentials to find your baseline presence.",
      monthlyPrice: 0,
      annualPrice: 0,
      icon: FiActivity,
      iconColor: "text-gray-400 bg-gray-50",
      features: [
        { text: "Standard 4-7-8 Breathing Presets", checked: true },
        { text: "Access to Daily Affirmations Playlist", checked: true },
        { text: "Standard Wellness Dashboard Logs", checked: true },
        { text: "Custom Personal Audio Uploads", checked: false },
        { text: "Offline IndexedDB Persistence", checked: false },
        { text: "Priority Support & Guided Journeys", checked: false }
      ],
      buttonText: "Current Plan",
      buttonStyle: "bg-gray-100 text-gray-400 cursor-default"
    },
    {
      id: "pro",
      name: "Wellness Pro",
      desc: "Unlock custom presets, personal tracks, and offline sync.",
      monthlyPrice: 9.99,
      annualPrice: 7.99, // 20% discount
      icon: FiZap,
      iconColor: "text-amber-500 bg-amber-50",
      features: [
        { text: "Unlimited Custom Breathing Presets", checked: true },
        { text: "Full Language Filters (Hindi/English)", checked: true },
        { text: "Advanced Wellness Progress Ring Metrics", checked: true },
        { text: "Custom Personal Audio Uploads (MP3/WAV)", checked: true },
        { text: "Local Offline IndexedDB Storage", checked: true },
        { text: "Priority Support & Advanced Analytics", checked: false }
      ],
      buttonText: "Upgrade to Pro",
      buttonStyle: "bg-[#7d9667] text-white hover:bg-[#6f865c] shadow-lg shadow-[#7d9667]/25",
      badge: "Best Value"
    },
    {
      id: "executive",
      name: "Executive Calm",
      desc: "Premium content and private guide consultations.",
      monthlyPrice: 29.99,
      annualPrice: 23.99,
      icon: FiBriefcase,
      iconColor: "text-[#7d9667] bg-[#eef6ea]",
      features: [
        { text: "Unlimited Custom Breathing Presets", checked: true },
        { text: "Full Language Filters (Hindi/English)", checked: true },
        { text: "Advanced Wellness Progress Ring Metrics", checked: true },
        { text: "Custom Personal Audio Uploads (MP3/WAV)", checked: true },
        { text: "Local Offline IndexedDB Storage", checked: true },
        { text: "1-on-1 Monthly Mindfulness Consultations", checked: true }
      ],
      buttonText: "Go Executive",
      buttonStyle: "bg-gray-900 text-white hover:bg-gray-800 shadow-lg"
    }
  ];

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvc) {
      toast.error("Please fill in all payment details.");
      return;
    }

    setProcessingPayment(true);
    setTimeout(() => {
      // Save subscription info in localStorage
      localStorage.setItem("mentalswasthya_subscription_tier", selectedPlan.id);
      localStorage.setItem("mentalswasthya_subscription_cycle", billingCycle);
      localStorage.setItem("mentalswasthya_subscription_date", Date.now().toString());
      
      toast.success(`Successfully subscribed to ${selectedPlan.name}!`);
      setProcessingPayment(false);
      setShowCheckout(false);
      setCardInfo({ number: "", expiry: "", cvc: "" });
    }, 1500);
  };

  const currentTier = localStorage.getItem("mentalswasthya_subscription_tier") || "free";

  return (
    <div className="space-y-6 text-[#22331b]">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          Pricing & Subscriptions
        </p>
        <h1 className="relative text-3xl md:text-4xl font-black tracking-tight text-[#22331b] mt-3">
          Invest in your peaceful presence
        </h1>
        <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
          Access specialized guided sessions, offline upload libraries, and complete wellness metrics tailored to help you maintain consistent focus.
        </p>
      </section>

      {/* Monthly / Annual Billing Toggle */}
      <div className="flex items-center justify-center gap-3 py-2">
        <span className={`text-sm font-bold ${billingCycle === "monthly" ? "text-[#22331b]" : "text-gray-400"}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
          className="w-14 h-8 rounded-full bg-white border border-[#e1eadb] p-1 flex items-center relative transition-all"
        >
          <div
            className={`w-6 h-6 rounded-full bg-[#7d9667] absolute transition-all duration-300 ${
              billingCycle === "annual" ? "left-7" : "left-1"
            }`}
          />
        </button>
        <span className={`text-sm font-bold flex items-center gap-1.5 ${billingCycle === "annual" ? "text-[#22331b]" : "text-gray-400"}`}>
          Annual Billing
          <span className="bg-[#eef6ea] text-[#7d9667] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#d2e2c8]">
            Save 20%
          </span>
        </span>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
          const isCurrent = currentTier === plan.id;
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.id}
              className={`rounded-[32px] bg-white border relative p-6 md:p-8 flex flex-col justify-between transition-all ${
                plan.badge 
                  ? "border-[#7d9667] shadow-[0_12px_40px_rgba(125,150,103,0.12)] scale-102" 
                  : "border-[#e8efe3] shadow-[0_10px_30px_rgba(80,105,67,0.04)]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7d9667] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md shadow-[#7d9667]/20">
                  {plan.badge}
                </span>
              )}

              <div>
                {/* Header info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${plan.iconColor}`}>
                    <PlanIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#22331b]">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                  </div>
                </div>

                {/* Price display */}
                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#22331b]">${price}</span>
                    <span className="text-xs font-bold text-gray-400">/ user / month</span>
                  </div>
                  {billingCycle === "annual" && price > 0 && (
                    <span className="text-[10px] font-bold text-[#7d9667] mt-1 block">
                      Billed annually (${(price * 12).toFixed(2)}/yr)
                    </span>
                  )}
                </div>

                {/* Features list */}
                <ul className="space-y-3.5 border-t border-gray-100 pt-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      {feature.checked ? (
                        <FiCheck className="text-[#7d9667] mt-0.5 flex-shrink-0" size={16} />
                      ) : (
                        <FiX className="text-gray-300 mt-0.5 flex-shrink-0" size={16} />
                      )}
                      <span className={feature.checked ? "text-[#22331b] font-medium" : "text-gray-400 line-through"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-400 font-bold text-sm tracking-wide border border-gray-200 cursor-default"
                  >
                    Your Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (plan.id === "free") {
                        localStorage.setItem("mentalswasthya_subscription_tier", "free");
                        toast.success("Downgraded back to Free Standard Plan.");
                      } else {
                        setSelectedPlan(plan);
                        setShowCheckout(true);
                      }
                    }}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Simulated Checkout Modal Overlay */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] border border-gray-100 w-full max-w-md shadow-2xl p-6 md:p-8 relative">
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-2xl font-black text-[#22331b] mb-2">Secure Checkout</h3>
            <p className="text-sm text-gray-500 mb-6">
              You are subscribing to <strong className="text-[#22331b]">{selectedPlan.name}</strong> on the <strong className="text-[#22331b]">{billingCycle}</strong> plan.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#66785c]">Card Number</label>
                <div className="relative">
                  <FiCreditCard className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    maxLength="19"
                    value={cardInfo.number}
                    onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#66785c]">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    maxLength="5"
                    value={cardInfo.expiry}
                    onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#66785c]">CVC / CVV</label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    maxLength="3"
                    value={cardInfo.cvc}
                    onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                  />
                </div>
              </div>

              <div className="bg-[#eef6ea]/60 rounded-2xl p-4 border border-[#e1eadb] flex items-center justify-between text-sm mt-6">
                <span className="font-bold text-[#66785c]">Amount Due:</span>
                <span className="text-lg font-black text-[#22331b]">
                  ${(billingCycle === "monthly" ? selectedPlan.monthlyPrice : selectedPlan.annualPrice).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={processingPayment}
                className="w-full py-3.5 rounded-2xl bg-[#7d9667] hover:bg-[#6f865c] text-white text-sm font-bold transition-all shadow-lg shadow-[#7d9667]/20 disabled:opacity-50 mt-4"
              >
                {processingPayment ? "Processing Payment..." : "Complete Subscription"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubscriptionScreen;

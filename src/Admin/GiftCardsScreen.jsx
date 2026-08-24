import React, { useState, useEffect } from "react";
import { FiGift, FiCheckCircle, FiDownload, FiStar, FiCheck } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const DEFAULT_GIFT_MESSAGE = "Wishing you peace, balance, and joy on your mindfulness journey with MentalSwasthya.";

const GiftCardsScreen = () => {
  const { user } = useAuth();

  // Buy Gift Card State
  const [giftData, setGiftData] = useState({
    recipient: "",
    email: "",
    sender: user?.name || "",
    planType: "premium", // "regular" | "premium"
    duration: "3M",      // "3M" | "6M" | "1Y"
    message: DEFAULT_GIFT_MESSAGE
  });

  // Automatically sync sender name when user profile is loaded
  useEffect(() => {
    if (user?.name) {
      setGiftData((prev) => ({
        ...prev,
        sender: prev.sender || user.name || ""
      }));
    }
  }, [user]);

  // Redeem Gift Card State
  const [promoCode, setPromoCode] = useState("");
  const [redeemedCode, setRedeemedCode] = useState(
    localStorage.getItem("mentalswasthya_gift_card_redeemed") === "true"
  );
  const [buying, setBuying] = useState(false);

  // Pricing & Tier Specifications for Regular vs Premium
  const plans = {
    regular: {
      "3M": {
        id: "3M",
        name: "Mental Swasthya Seed",
        planLabel: "Regular",
        label: "3M",
        price: "$19",
        validity: "Valid for 3 Months (Regular Access)",
        theme: "sage",
        badgeText: "3M Regular"
      },
      "6M": {
        id: "6M",
        name: "Mental Swasthya Bloom",
        planLabel: "Regular",
        label: "6M",
        price: "$35",
        validity: "Valid for 6 Months (Regular Access)",
        theme: "gold",
        badgeText: "6M Regular"
      },
      "1Y": {
        id: "1Y",
        name: "Mental Swasthya Flourish",
        planLabel: "Regular",
        label: "1Y",
        price: "$60",
        validity: "Valid for 1 Year (Regular Access)",
        theme: "midnight",
        badgeText: "1Y Regular"
      }
    },
    premium: {
      "3M": {
        id: "3M",
        name: "Mental Swasthya Seed",
        planLabel: "Premium VIP",
        label: "3M",
        price: "$24",
        validity: "Valid for 3 Months (Full Premium VIP)",
        theme: "sage",
        badgeText: "3M Premium VIP"
      },
      "6M": {
        id: "6M",
        name: "Mental Swasthya Bloom",
        planLabel: "Premium VIP",
        label: "6M",
        price: "$45",
        validity: "Valid for 6 Months (Full Premium VIP)",
        theme: "gold",
        badgeText: "6M Premium VIP"
      },
      "1Y": {
        id: "1Y",
        name: "Mental Swasthya Flourish",
        planLabel: "Premium VIP",
        label: "1Y",
        price: "$80",
        validity: "Valid for 1 Year (Full Premium VIP)",
        theme: "midnight",
        badgeText: "1Y Premium VIP"
      }
    }
  };

  const cardThemes = {
    sage: {
      bg: "linear-gradient(135deg, #7d9667 0%, #a8c896 100%)",
      text: "text-white",
      logo: "rgba(255,255,255,0.2)",
      badge: "border-white/30 bg-white/15"
    },
    gold: {
      bg: "linear-gradient(135deg, #d99b58 0%, #f6d19a 100%)",
      text: "text-white",
      logo: "rgba(255,255,255,0.25)",
      badge: "border-white/30 bg-white/15"
    },
    midnight: {
      bg: "linear-gradient(135deg, #112211 0%, #335533 100%)",
      text: "text-[#a8c896]",
      logo: "rgba(168,200,150,0.15)",
      badge: "border-[#a8c896]/30 bg-[#a8c896]/15"
    }
  };

  const activePlanGroup = plans[giftData.planType] || plans.premium;
  const activeDuration = activePlanGroup[giftData.duration] || activePlanGroup["3M"];
  const activeTheme = cardThemes[activeDuration.theme];

  const handleDownloadCard = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      // Draw Card Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, 800, 480);
      if (giftData.duration === "3M") {
        gradient.addColorStop(0, "#6c8557");
        gradient.addColorStop(1, "#98b786");
      } else if (giftData.duration === "6M") {
        gradient.addColorStop(0, "#c98844");
        gradient.addColorStop(1, "#f3c68a");
      } else {
        gradient.addColorStop(0, "#112211");
        gradient.addColorStop(1, "#2c482c");
      }
      ctx.fillStyle = gradient;

      // Rounded rectangle
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, 800, 480, 28);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, 800, 480);
      }

      // Decorative Circle
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(720, 80, 160, 0, Math.PI * 2);
      ctx.fill();

      // Card Name Header
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px Georgia, serif";
      ctx.fillText(activeDuration.name, 48, 68);

      // Duration & Plan Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(48, 88, 200, 32);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(activeDuration.badgeText.toUpperCase(), 62, 109);

      // Recipient & Sender Details
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 20px sans-serif";
      ctx.fillText(`To: ${giftData.recipient || "Valued Friend"}`, 48, 180);
      ctx.fillText(`From: ${giftData.sender || "Warm Sender"}`, 48, 215);

      // Message
      ctx.font = "italic 16px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      const msg = giftData.message || DEFAULT_GIFT_MESSAGE;
      ctx.fillText(`"${msg.length > 60 ? msg.substring(0, 57) + '...' : msg}"`, 48, 270);

      // Line Divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(48, 310);
      ctx.lineTo(752, 310);
      ctx.stroke();

      // Validity & Link Info
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(`Validity: ${activeDuration.validity}`, 48, 360);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("Link: mentalswasthya.com", 48, 395);

      // Unique Voucher Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillRect(510, 345, 240, 65);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px monospace";
      ctx.fillText("GIFT-MS-2026", 540, 384);

      // Download PNG link
      const link = document.createElement("a");
      link.download = `${activeDuration.name.replace(/\s+/g, "_")}_${giftData.planType.toUpperCase()}_GiftCard.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Gift Card downloaded to your device!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate download. Please try again.");
    }
  };

  const handleBuy = (e) => {
    e.preventDefault();
    if (!giftData.recipient || !giftData.email || !giftData.sender) {
      toast.error("Please fill in recipient name, email, and sender name.");
      return;
    }

    setBuying(true);
    setTimeout(() => {
      const code = `GIFT-MS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      toast.success(`Purchase successful! Code ${code} sent to ${giftData.email}`);
      handleDownloadCard();
      setGiftData({
        recipient: "",
        email: "",
        sender: user?.name || "",
        planType: "premium",
        duration: "3M",
        message: DEFAULT_GIFT_MESSAGE
      });
      setBuying(false);
    }, 1000);
  };

  const handleRedeem = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.error("Please enter a valid gift card code.");
      return;
    }

    if (promoCode.trim().toUpperCase() === "CALM-2026") {
      localStorage.setItem("mentalswasthya_gift_card_redeemed", "true");
      setRedeemedCode(true);
      setPromoCode("");
      toast.success("Congratulations! Code CALM-2026 redeemed. 3 months of Wellness Pro unlocked!");
    } else {
      toast.error("Invalid or expired gift code. Try 'CALM-2026' to test.");
    }
  };

  return (
    <div className="space-y-6 text-[#22331b]">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f5faf2] via-white to-[#eef7fb] border border-[#e1eadb] shadow-[0_18px_50px_rgba(80,105,67,0.08)] p-7 md:p-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7d9667]/10" />
        <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-[#7d9667]">
          MentalSwasthya Gift Cards
        </p>
        <h1 className="relative text-3xl md:text-4xl font-black tracking-tight text-[#22331b] mt-3">
          Gift the experience of calm
        </h1>
        <p className="text-sm text-[#66785c] mt-3 max-w-2xl leading-6">
          Share peace of mind, custom meditations, and stress relief with your friends and family. Send a customizable digital gift card instantly.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Form (Column 3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Purchase form */}
          <form onSubmit={handleBuy} className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.04)] space-y-5">
            <h3 className="text-xl font-black text-[#22331b]">Configure Gift Card</h3>

            {/* 1. Plan Type Selector: Regular vs Premium */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#66785c]">Select Membership Plan Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "regular", name: "Regular Plan", desc: "Standard mindfulness library access" },
                  { id: "premium", name: "Premium VIP", desc: "Unlimited access + custom uploads & soundscapes", icon: FiStar }
                ].map((plan) => {
                  const isSelected = giftData.planType === plan.id;
                  const Icon = plan.icon;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setGiftData({ ...giftData, planType: plan.id })}
                      className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#7d9667] bg-[#eef6ea]/80 text-[#22331b] shadow-sm ring-1 ring-[#7d9667]"
                          : "border-gray-200 text-gray-500 hover:border-[#e2eadc] hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-black flex items-center gap-1.5">
                          {Icon && <Icon className="text-amber-500" size={14} />}
                          {plan.name}
                        </span>
                        {isSelected && <FiCheck className="text-[#7d9667]" size={16} />}
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium mt-1 leading-tight">{plan.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Duration Tabs (3M / 6M / 1Y) with Amount for Selected Plan */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#66785c]">Select Membership Duration (3M / 6M / 1Y)</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(activePlanGroup).map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => setGiftData({ ...giftData, duration: dur.id })}
                    className={`py-3.5 px-2 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                      giftData.duration === dur.id
                        ? "border-[#7d9667] bg-[#eef6ea]/90 text-[#22331b] font-black shadow-sm ring-1 ring-[#7d9667]"
                        : "border-gray-200 text-gray-500 hover:border-[#e2eadc] hover:bg-gray-50/50"
                    }`}
                  >
                    <span className="text-sm font-black">{dur.label}</span>
                    <span className="text-xs font-black text-[#7d9667]">{dur.price}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Selected Tier: <strong className="text-[#22331b] font-bold">{activeDuration.name} ({activeDuration.planLabel})</strong> — <span className="text-[#7d9667] font-bold">{activeDuration.price}</span>
              </p>
            </div>

            {/* Recipient details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#66785c]">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="Who is this for?"
                  value={giftData.recipient}
                  onChange={(e) => setGiftData({ ...giftData, recipient: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#66785c]">Recipient Email</label>
                <input
                  type="email"
                  required
                  placeholder="Where to deliver?"
                  value={giftData.email}
                  onChange={(e) => setGiftData({ ...giftData, email: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#66785c]">Your Name (Sender)</label>
                <input
                  type="text"
                  required
                  placeholder="Who is sending this?"
                  value={giftData.sender}
                  onChange={(e) => setGiftData({ ...giftData, sender: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#66785c]">Gift Message (Default)</label>
                <input
                  type="text"
                  placeholder="Add a custom message"
                  value={giftData.message}
                  onChange={(e) => setGiftData({ ...giftData, message: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={buying}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7d9667] hover:bg-[#6f865c] text-white py-3.5 text-sm font-bold shadow-lg shadow-[#7d9667]/15 transition-all disabled:opacity-50"
              >
                <FiGift />
                {buying ? "Purchasing..." : `Buy ${activeDuration.name} (${activeDuration.price})`}
              </button>
              
              <button
                type="button"
                onClick={handleDownloadCard}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-[#7d9667] hover:bg-[#eef6ea] text-[#7d9667] px-5 py-3.5 text-sm font-bold transition-all"
              >
                <FiDownload />
                Download Card
              </button>
            </div>
          </form>

        </div>

        {/* Right Preview & Redeem (Column 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Preview Graphic */}
          <div className="rounded-3xl bg-white border border-[#e8efe3] p-5 shadow-[0_10px_30px_rgba(80,105,67,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Gift Card Preview</h4>
              <button
                onClick={handleDownloadCard}
                className="text-xs font-bold text-[#7d9667] hover:underline flex items-center gap-1"
              >
                <FiDownload size={13} /> Download
              </button>
            </div>
            
            <div
              className="rounded-2xl aspect-[1.58/1] w-full p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-xl"
              style={{ background: activeTheme.bg }}
            >
              {/* Graphic background circles */}
              <div className="absolute right-0 top-0 w-36 h-36 rounded-full pointer-events-none" style={{ backgroundColor: activeTheme.logo }} />
              
              {/* Header: Tier Name & Badge */}
              <div className="relative z-10 space-y-1">
                <p className={`text-lg font-black tracking-tight ${activeTheme.text}`}>
                  {activeDuration.name}
                </p>
                <span className={`inline-block text-[10px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${activeTheme.badge}`}>
                  {activeDuration.badgeText}
                </span>
              </div>

              {/* Body: Recipient, Sender & Message */}
              <div className="relative z-10 space-y-1">
                <p className={`text-xs font-bold opacity-95 ${activeTheme.text}`}>To: {giftData.recipient || "Recipient Name"}</p>
                <p className={`text-xs font-bold opacity-95 ${activeTheme.text}`}>From: {giftData.sender || "Sender Name"}</p>
                {giftData.message && (
                  <p className={`text-[11px] italic opacity-90 line-clamp-2 border-t border-white/20 pt-1.5 mt-1 ${activeTheme.text}`}>
                    "{giftData.message}"
                  </p>
                )}
              </div>

              {/* Footer: Validity Date & Website Link */}
              <div className={`relative z-10 border-t border-white/20 pt-2 flex items-center justify-between text-[10px] font-semibold opacity-90 ${activeTheme.text}`}>
                <div>
                  <p>{activeDuration.validity}</p>
                  <p className="font-bold underline mt-0.5">mentalswasthya.com</p>
                </div>
                <span className="font-mono font-bold bg-white/20 px-2 py-1 rounded text-[11px]">
                  MS-GIFT-2026
                </span>
              </div>
            </div>
          </div>

          {/* Redeem Card */}
          <div className="rounded-3xl bg-white border border-[#e8efe3] p-6 shadow-[0_10px_30px_rgba(80,105,67,0.04)] space-y-4">
            <h3 className="text-lg font-black text-[#22331b]">Redeem Gift Card</h3>
            
            {redeemedCode ? (
              <div className="bg-[#eef6ea] border border-[#d2e2c8] rounded-2xl p-4 flex items-start gap-3">
                <FiCheckCircle className="text-[#7d9667] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-xs font-bold text-[#22331b]">Code CALM-2026 Redeemed</p>
                  <p className="text-[11px] text-[#66785c] mt-0.5">3 months of Wellness Pro has been unlocked on your account.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRedeem} className="space-y-3">
                <p className="text-xs text-gray-500">
                  Enter your unique alphanumeric voucher code to activate premium rewards.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="CALM-XXXX"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#7d9667] focus:bg-white text-[#22331b]"
                  />
                  <button
                    type="submit"
                    className="bg-[#7d9667] hover:bg-[#6f865c] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Redeem
                  </button>
                </div>
                <div className="border-t border-dashed border-gray-100 pt-2 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Need a test code?</span>
                  <span className="font-bold text-[#7d9667] bg-[#eef6ea] px-2 py-0.5 rounded cursor-pointer select-all" onClick={() => setPromoCode("CALM-2026")}>
                    CALM-2026
                  </span>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default GiftCardsScreen;

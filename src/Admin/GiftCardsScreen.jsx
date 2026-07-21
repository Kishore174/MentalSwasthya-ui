import React, { useState } from "react";
import { FiGift, FiCopy, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";

const GiftCardsScreen = () => {
  // Buy Gift Card State
  const [giftData, setGiftData] = useState({
    recipient: "",
    email: "",
    sender: "",
    amount: "50",
    message: "",
    theme: "sage" // "sage", "gold", "midnight"
  });

  // Redeem Gift Card State
  const [promoCode, setPromoCode] = useState("");
  const [redeemedCode, setRedeemedCode] = useState(
    localStorage.getItem("mentalswasthya_gift_card_redeemed") === "true"
  );
  const [buying, setBuying] = useState(false);

  const cardThemes = {
    sage: {
      bg: "linear-gradient(135deg, #7d9667 0%, #a8c896 100%)",
      text: "text-white",
      logo: "rgba(255,255,255,0.2)",
      badge: "border-white/20 bg-white/10"
    },
    gold: {
      bg: "linear-gradient(135deg, #d99b58 0%, #f6d19a 100%)",
      text: "text-white",
      logo: "rgba(255,255,255,0.25)",
      badge: "border-white/20 bg-white/10"
    },
    midnight: {
      bg: "linear-gradient(135deg, #112211 0%, #335533 100%)",
      text: "text-[#a8c896]",
      logo: "rgba(168,200,150,0.15)",
      badge: "border-[#a8c896]/20 bg-[#a8c896]/10"
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
      // Simulate receipt code
      const code = `GIFT-MS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      toast.success(`Purchase successful! Code ${code} sent to ${giftData.email}`);
      setGiftData({
        recipient: "",
        email: "",
        sender: "",
        amount: "50",
        message: "",
        theme: "sage"
      });
      setBuying(false);
    }, 1200);
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

            {/* Price Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#66785c]">Select Amount</label>
              <div className="grid grid-cols-4 gap-3">
                {["25", "50", "100", "150"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGiftData({ ...giftData, amount: val })}
                    className={`py-3.5 rounded-2xl text-sm font-bold border transition-all ${
                      giftData.amount === val
                        ? "border-[#7d9667] bg-[#eef6ea]/60 text-[#22331b] font-black"
                        : "border-gray-200 text-gray-500 hover:border-[#e2eadc] hover:bg-gray-50/50"
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#66785c]">Select Card Art Style</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "sage", name: "Sage Forest" },
                  { id: "gold", name: "Golden Aura" },
                  { id: "midnight", name: "Midnight Oasis" }
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setGiftData({ ...giftData, theme: th.id })}
                    className={`py-3.5 rounded-2xl text-sm font-bold border transition-all ${
                      giftData.theme === th.id
                        ? "border-[#7d9667] bg-[#eef6ea]/60 text-[#22331b] font-black"
                        : "border-gray-200 text-gray-500 hover:border-[#e2eadc] hover:bg-gray-50/50"
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
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
                <label className="text-xs font-bold text-[#66785c]">Your Name</label>
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
                <label className="text-xs font-bold text-[#66785c]">Gift Message (Optional)</label>
                <input
                  type="text"
                  placeholder="Add a warm message"
                  value={giftData.message}
                  onChange={(e) => setGiftData({ ...giftData, message: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#7d9667] focus:bg-white transition-all text-[#22331b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={buying}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7d9667] hover:bg-[#6f865c] text-white py-3.5 text-sm font-bold shadow-lg shadow-[#7d9667]/15 transition-all disabled:opacity-50 mt-2"
            >
              <FiGift />
              {buying ? "Purchasing..." : `Buy Gift Card ($${giftData.amount})`}
            </button>
          </form>

        </div>

        {/* Right Preview & Redeem (Column 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Preview Graphic */}
          <div className="rounded-3xl bg-white border border-[#e8efe3] p-5 shadow-[0_10px_30px_rgba(80,105,67,0.04)]">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Live Preview</h4>
            
            <div
              className="rounded-2xl aspect-[1.58/1] w-full p-6 flex flex-col justify-between relative overflow-hidden shadow-lg"
              style={{ background: cardThemes[giftData.theme].bg }}
            >
              {/* Graphic background circles */}
              <div className="absolute right-0 top-0 w-32 h-32 rounded-full pointer-events-none" style={{ backgroundColor: cardThemes[giftData.theme].logo }} />
              
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${cardThemes[giftData.theme].badge}`}>
                  Wellness Gift
                </span>
                <span className={`text-2xl font-black ${cardThemes[giftData.theme].text}`}>
                  ${giftData.amount || "0"}
                </span>
              </div>

              <div className="relative z-10">
                <p className={`text-xs font-bold opacity-80 ${cardThemes[giftData.theme].text}`}>To: {giftData.recipient || "Recipient Name"}</p>
                <p className={`text-xs font-bold opacity-80 mt-0.5 ${cardThemes[giftData.theme].text}`}>From: {giftData.sender || "Sender Name"}</p>
                {giftData.message && (
                  <p className={`text-[10px] italic opacity-90 mt-2 line-clamp-1 border-t border-white/10 pt-2 ${cardThemes[giftData.theme].text}`}>
                    "{giftData.message}"
                  </p>
                )}
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

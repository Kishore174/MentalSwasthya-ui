// Regular ("free") vs Premium ("pro") plan helpers. The tier is saved by SubscriptionScreen.
const TIER_KEY = "mentalswasthya_subscription_tier";

export const getTier = () => {
  try {
    return localStorage.getItem(TIER_KEY) || "pro";
  } catch (e) {
    return "pro";
  }
};

export const isPremium = () => getTier() !== "free";

// Streak freezes granted per 15-day milestone block: Regular 2, Premium 3
export const getFreezeAllowance = () => (isPremium() ? 3 : 2);

export const PREMIUM_MESSAGE = "This is a Premium feature. Upgrade your plan to unlock it.";

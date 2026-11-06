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

// Streak freezes granted per 15-day milestone block: 2 for both Regular and Premium
export const getFreezeAllowance = () => 2;

export const PREMIUM_MESSAGE = "This is a Premium feature. Upgrade your plan to unlock it.";

export const getAboutSeenKey = (user) => {
  const userKey = user?.email || user?.id || user?._id || "guest";
  return `mentalSwasthya:about-seen:${userKey}`;
};

export const hasSeenAbout = (user) => localStorage.getItem(getAboutSeenKey(user)) === "true";

export const markAboutSeen = (user) => {
  localStorage.setItem(getAboutSeenKey(user), "true");
};

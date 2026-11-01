// Vibration for meditation cues. Supported by Chrome/Firefox on Android; iOS Safari and most
// desktop browsers don't implement navigator.vibrate, so this quietly does nothing there.
export const canVibrate = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export const triggerVibrate = (pattern = 100) => {
  try {
    if (canVibrate()) navigator.vibrate(pattern);
  } catch (e) {
    // Vibration blocked (no recent user interaction, or disabled by the device)
  }
};

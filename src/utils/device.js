export const getDeviceId = () => {
  let id = localStorage.getItem("ms_device_id");
  if (!id) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      id = "dev_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem("ms_device_id", id);
  }
  return id;
};

export const getDeviceName = () => {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  let os = "Device";
  if (/iPad|iPhone|iPod/.test(ua)) os = "iOS Device";
  else if (/Android/.test(ua)) os = "Android Device";
  else if (/Macintosh|Mac OS X/.test(ua)) os = "Mac";
  else if (/Windows/.test(ua)) os = "Windows PC";
  else if (/Linux/.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/Edg/.test(ua)) browser = "Edge";
  else if (/Chrome/.test(ua)) browser = "Chrome";
  else if (/Safari/.test(ua)) browser = "Safari";
  else if (/Firefox/.test(ua)) browser = "Firefox";

  return `${browser} on ${os}`;
};

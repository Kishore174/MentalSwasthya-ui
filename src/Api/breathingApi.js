import { axiosInstance } from "./config";

export const startBreathingSession = (data) => {
  return axiosInstance.post("/breathing/start", data);
};

export const completeBreathingSession = (sessionId, data) => {
  return axiosInstance.post(`/breathing/complete/${sessionId}`, data);
};

export const getBreathingHistory = () => {
  return axiosInstance.get("/breathing/history");
};

export const getCustomBreathingPresets = () => {
  return axiosInstance.get("/breathing/custom-presets");
};

export const saveCustomBreathingPreset = (data) => {
  return axiosInstance.post("/breathing/custom-presets", data);
};

export const deleteCustomBreathingPreset = (id) => {
  return axiosInstance.delete(`/breathing/custom-presets/${id}`);
};

  
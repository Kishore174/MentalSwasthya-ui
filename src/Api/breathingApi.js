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
  
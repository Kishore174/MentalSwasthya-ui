import { axiosInstance } from "./config";

export const getMySubscription = () => {
  return axiosInstance.get("/subscription/my-subscription");
};

export const updateSubscriptionPlan = (data) => {
  return axiosInstance.post("/subscription/change-plan", data);
};

export const stopAutoDebit = () => {
  return axiosInstance.post("/subscription/stop-auto-debit");
};

export const resumeAutoDebit = () => {
  return axiosInstance.post("/subscription/resume-auto-debit");
};

export const cancelSubscription = () => {
  return axiosInstance.post("/subscription/cancel");
};

export const reactivateSubscription = () => {
  return axiosInstance.post("/subscription/reactivate");
};

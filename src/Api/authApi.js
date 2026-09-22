import { axiosInstance } from "./config";

// LOGIN
export const loginUser = (data) => {
  return axiosInstance.post("/auth/individual/login", data);
};

// REGISTER
export const registerUser = (data) => {
  return axiosInstance.post("/auth/individual/register", data);
};

// FORGOT PASSWORD
export const forgotPassword = (data) => {
  return axiosInstance.post("/auth/individual/forgot-password", data);
};

// RESET PASSWORD
export const resetPassword = (data) => {
  return axiosInstance.post("/auth/individual/reset-password", data);
};

// VERIFY EMAIL
export const verifyEmail = (data) => {
  return axiosInstance.post("/auth/individual/verify-email", data);
};

// RESEND VERIFICATION EMAIL
export const resendVerification = (data) => {
  return axiosInstance.post("/auth/individual/resend-verification", data);
};

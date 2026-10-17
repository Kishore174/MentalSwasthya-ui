import { axiosInstance } from "./config";

// GET PROFILE
export const getUserProfile = () => {
  return axiosInstance.get("/user/profile");
};

// UPDATE PROFILE
export const updateUserProfile = (data) => {
  return axiosInstance.put("/user/profile", data);
};

// GET USER STREAK
export const getUserStreak = () => {
  return axiosInstance.get("/user/streak");
};

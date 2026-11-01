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

// UPLOAD PROFILE PHOTO (multipart, field "photo")
export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return axiosInstance.post("/user/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE ACCOUNT (permanent; password re-confirmation required)
export const deleteAccount = (password) => {
  return axiosInstance.delete("/user/account", { data: { password } });
};

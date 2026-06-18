import { axiosInstance } from "./config";

// LOGIN
export const loginUser = (data) => {
  return axiosInstance.post("/auth/individual/login", data);
};

// REGISTER
export const registerUser = (data) => {
  return axiosInstance.post("/auth/individual/register", data);
};

 

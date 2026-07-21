import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api.mentalswasthya.com/api";

const API_KEY =
  process.env.REACT_APP_API_KEY ||
  "dyUIT372362iljkmsd,9zjs812`@@32389nmidhscjsdnhsuxe4e5rc67ivhjkp9,.,";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "x-api-key": API_KEY,
  },
  withCredentials:true
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


 
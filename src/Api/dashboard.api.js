import { axiosInstance } from "./config";

export const getUsers = () => axiosInstance.get("/users");
export const getAttendance = () => axiosInstance.get("/attendance");
export const getLeaves = () => axiosInstance.get("/leaves");
export const getCheckIns = () => axiosInstance.get("/checkins");

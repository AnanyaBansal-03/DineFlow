import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const axiosWrapper = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
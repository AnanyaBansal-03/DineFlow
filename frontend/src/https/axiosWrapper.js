import axios from "axios";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: "http://localhost:8000", // ✅ Backend URL
  withCredentials: true,
  headers: { ...defaultHeader },
});
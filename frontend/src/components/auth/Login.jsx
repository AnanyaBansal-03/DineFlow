import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../https";
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      console.log("Full response:", res.data);
      
      // ✅ Get data from the correct location
      const userData = res.data.data;
      const token = res.data.token; // Token should be in res.data.token
      
      console.log("User data:", userData);
      console.log("Token:", token);
      
      // ✅ Save token to localStorage
      if (token) {
        localStorage.setItem("accessToken", token);
        console.log("Token saved to localStorage");
      } else {
        console.warn("No token received from server!");
      }
      
      dispatch(setUser(userData));
      enqueueSnackbar(`Welcome ${userData.name}! 🎉`, { variant: "success" });
      
      // Role-based redirect
      const role = userData.role;
      if (role === "Kitchen") {
        navigate("/kitchen");
      } else if (role === "Admin") {
        navigate("/home");
      } else if (role === "Waiter") {
        navigate("/waiter");
      } else {
        navigate("/home");
      }
    },
    onError: (error) => {
      console.error("Login error:", error.response?.data);
      const message = error.response?.data?.message || "Login failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="w-full">
      <div className="w-full bg-[#141414] p-8 rounded-2xl shadow-2xl border border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ... rest of your form JSX remains the same ... */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
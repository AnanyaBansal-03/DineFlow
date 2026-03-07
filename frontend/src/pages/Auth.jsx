// Auth.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import restaurant from "../assets/images/restaurant-img.jpg";
import logo from "../assets/images/logo.png";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import { FaArrowLeft } from "react-icons/fa";

const Auth = () => {
  useEffect(() => {
    document.title = "DineFlow | Auth";
  }, []);

  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const { isAuth } = useSelector(state => state.user);

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuth) {
      navigate("/home");
    }
  }, [isAuth, navigate]);

  const handleBackToHome = () => {
    // FIX: Navigate to /landing instead of /
    navigate("/landing");
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex">

      {/* LEFT SIDE */}
      <div className="w-1/2 relative hidden md:block">
        <img
          src={restaurant}
          alt="DineFlow Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/80 flex flex-col justify-between p-12">
          
          {/* Back to Home Button - FIXED */}
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition w-fit"
          >
            <FaArrowLeft size={20} />
            <span>Back to Home</span>
          </button>

          <blockquote className="text-xl italic text-white max-w-lg">
            "Serve customers the best food with prompt and friendly service
            in a welcoming atmosphere, and they'll keep coming back."
            <span className="block mt-4 text-yellow-400">
              — Team DineFlow
            </span>
          </blockquote>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 bg-[#0f0f0f] flex items-center justify-center relative">

        {/* Mobile Back Button - FIXED */}
        <button
          onClick={handleBackToHome}
          className="absolute top-6 left-6 md:hidden flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition"
        >
          <FaArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="w-full max-w-md px-6">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="DineFlow Logo"
              className="h-16 w-16 rounded-full border-2 border-yellow-400/30 p-1"
            />
            <h1 className="text-3xl font-bold text-white mt-3">
              Dine<span className="text-yellow-400">Flow</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {isRegister ? "Create your account" : "Welcome back!"}
            </p>
          </div>

          {/* CARD */}
          <div className="bg-[#141414] p-6 rounded-2xl shadow-2xl border border-gray-800">
            <h2 className="text-xl font-semibold text-yellow-400 text-center mb-6">
              {isRegister ? "Customer Registration" : "Customer Login"}
            </h2>

            {isRegister ? (
              <Register setIsRegister={setIsRegister} />
            ) : (
              <Login />
            )}
          </div>

          {/* SWITCH */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              {isRegister
                ? "Already have an account?"
                : "New to DineFlow?"}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 text-yellow-400 font-semibold hover:underline"
              >
                {isRegister ? "Sign in" : "Create account"}
              </button>
            </p>
          </div>

          {/* Additional Links - FIXED */}
          <div className="text-center mt-4">
            <button
              onClick={handleBackToHome}
              className="text-sm text-gray-600 hover:text-gray-400 transition"
            >
              ← Return to homepage
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;
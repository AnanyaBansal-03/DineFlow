// components/shared/Header.jsx
import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: (data) => {
      console.log(data);
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle logo click to go to landing page
  const handleLogoClick = () => {
    navigate("/landing");
  };

  return (
    <header className="w-full flex items-center justify-between py-2.5 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
      {/* LOGO - Left - Clickable to landing page */}
      <div
        onClick={handleLogoClick}
        className="flex items-center gap-2 cursor-pointer flex-shrink-0 hover:opacity-80 transition"
      >
        <img src={logo} className="h-7 w-7 rounded-full" alt="DineFlow logo" />
        <h1 className="text-lg font-bold tracking-wide hidden sm:block">
          <span className="text-yellow-400">Dine</span>
          <span className="text-white">Flow</span>
        </h1>
      </div>

      {/* SEARCH - Center on desktop, hidden on mobile */}
      <div className="hidden md:flex items-center gap-3 bg-[#262626] rounded-full px-4 py-1.5 flex-1 max-w-md mx-4">
        <FaSearch className="text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search orders, customers..."
          className="bg-transparent outline-none text-white text-sm w-full placeholder-gray-500"
        />
      </div>

      {/* RIGHT SECTION - User details and icons */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile search icon */}
        <button className="md:hidden bg-[#262626] p-1.5 rounded-full">
          <FaSearch className="text-gray-400 text-lg" />
        </button>

        {/* Admin Dashboard */}
        {userData.role === "Admin" && (
          <button 
            onClick={() => navigate("/dashboard")} 
            className="bg-[#262626] hover:bg-[#2f2f2f] rounded-full p-2 transition"
            title="Dashboard"
          >
            <MdDashboard className="text-gray-300 text-lg" />
          </button>
        )}

        {/* Notifications */}
        <button className="bg-[#262626] hover:bg-[#2f2f2f] rounded-full p-2 transition relative">
          <FaBell className="text-gray-300 text-lg" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-1.5 cursor-pointer group">
          <FaUserCircle className="text-gray-300 text-2xl sm:text-3xl" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs text-white font-medium">
              {userData.name || "User"}
            </span>
            <span className="text-[10px] text-gray-400">
              {userData.role || "Role"}
            </span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-0.5 p-1.5 hover:bg-[#262626] rounded-full transition"
            title="Logout"
          >
            <IoLogOut className="text-gray-400 hover:text-yellow-400 text-xl" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
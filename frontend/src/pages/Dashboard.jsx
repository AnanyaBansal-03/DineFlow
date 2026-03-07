import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FaPlus, FaChevronDown } from "react-icons/fa";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getTables } from "../https";
import BackButton from "../components/shared/BackButton"; // Import BackButton component

const buttons = [
  { label: "Add Table", icon: <MdTableBar className="text-yellow-400" size={18} />, action: "table" },
  { label: "Add Category", icon: <MdCategory className="text-yellow-400" size={18} />, action: "category" },
  { label: "Add Dishes", icon: <BiSolidDish className="text-yellow-400" size={18} />, action: "dishes" },
];

const tabs = ["Metrics", "Orders", "Payments"];

const Dashboard = () => {
  useEffect(() => {
    document.title = "DineFlow | Admin Dashboard";
  }, []);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");
  const [modalType, setModalType] = useState(null);
  const [dateRange, setDateRange] = useState("30");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch real data
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  const orders = ordersData?.data?.data || [];
  const tables = tablesData?.data?.data || [];

  const handleOpenModal = (action) => {
    setModalType(action);
    if (action === "table") setIsTableModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTableModalOpen(false);
    setModalType(null);
  };

  // Date range options for dropdown
  const dateRangeOptions = [
    { label: "Last 7 Days", value: "7" },
    { label: "Last 30 Days", value: "30" },
    { label: "Last 90 Days", value: "90" },
    { label: "All Time", value: "all" },
  ];

  const getSelectedLabel = () => {
    const option = dateRangeOptions.find(opt => opt.value === dateRange);
    return option ? option.label : "Last 30 Days";
  };

  // Button styling function for tabs
  const getTabButtonStyle = (tab) => {
    return activeTab === tab
      ? "bg-yellow-400 text-black font-semibold shadow-lg shadow-yellow-400/20"
      : "bg-[#262626] text-gray-300 hover:bg-[#2f2f2f] hover:text-white border border-gray-700";
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        
        {/* Header with Back Button - Matching Orders page style */}
        <div className="flex items-center gap-4 mb-13">
          <BackButton /> {/* This will navigate to /home */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              <span className="text-yellow-400">Admin</span> Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your restaurant operations</p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          {buttons.map(({ label, icon, action }) => (
            <button
              key={label}
              onClick={() => handleOpenModal(action)}
              className="bg-black hover:bg-black text-black px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 border border-gray-700"
            >
              {icon}
              <span>{label}</span>
              <FaPlus size={12} className="ml-1 opacity-70" />
            </button>
          ))}
        </div>

        {/* Tabs and Date Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:outline-none active:outline-none whitespace-nowrap ${getTabButtonStyle(tab)}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ONLY DROPDOWN - No extra buttons */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-black text-black hover:bg-black hover:text-black border border-gray-700 transition-all duration-200 min-w-[160px] justify-between"
            >
              <span>{getSelectedLabel()}</span>
              <FaChevronDown className={`text-black transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} size={14} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                {/* Dropdown Options */}
                <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateRange(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        dateRange === option.value
                          ? "bg-yellow-400 text-black font-medium"
                          : "text-black hover:bg-black hover:text-black"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="mt-6 w-full">
          {activeTab === "Metrics" && (
            <Metrics 
              orders={orders} 
              tables={tables} 
              dateRange={dateRange}
            />
          )}

          {activeTab === "Orders" && <RecentOrders />}

          {activeTab === "Payments" && (
            <div className="bg-black rounded-xl border border-gray-800 p-8">
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Payments Coming Soon</h3>
                <p className="text-gray-400 max-w-md">
                  We're working on integrating payment processing. Check back later!
                </p>
                <div className="mt-6 flex gap-3">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs">UPI</span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs">Card</span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs">Cash</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isTableModalOpen && (
        <Modal 
          isOpen={isTableModalOpen} 
          onClose={handleCloseModal} 
          type={modalType}
        />
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FaPlus, FaChevronDown } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { FaChartLine } from "react-icons/fa";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Modal from "../components/dashboard/Modal";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getTables } from "../https";
import BackButton from "../components/shared/BackButton";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");
  const [modalType, setModalType] = useState(null);
  const [dateRange, setDateRange] = useState("30");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch real data
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchOnMount: true,
    refetchInterval: 5000,
  });

  const { data: tablesData, isLoading: tablesLoading, refetch: refetchTables } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    refetchOnMount: true,
    refetchInterval: 5000,
  });

  const orders = ordersData?.data?.data || [];
  const tables = tablesData?.data?.data || [];

  const handleOpenModal = (action) => {
    setModalType(action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      : "bg-[#262626] text-black hover:bg-[#2f2f2f] border border-gray-700";
  };

  // Calculate payment stats
  const cashPayments = orders.filter(o => o.paymentMethod === "Cash").length;
  const onlinePayments = orders.filter(o => o.paymentMethod === "Online").length;
  const cashRevenue = orders.filter(o => o.paymentMethod === "Cash").reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);
  const onlineRevenue = orders.filter(o => o.paymentMethod === "Online").reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);
  const totalRevenue = cashRevenue + onlineRevenue;

  return (
    <div className="min-h-screen bg-[#121212] text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-xl font-bold text-white">
              <span className="text-yellow-400">Admin</span> Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your restaurant operations</p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-6 text-black">
          {buttons.map(({ label, icon, action }) => (
            <button
              key={label}
              onClick={() => handleOpenModal(action)}
              className="bg-[#1E1E1E] text-black px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 border border-gray-700"
            >
              {icon}
              <span>{label}</span>
              <FaPlus size={12} className="ml-1 opacity-70" />
            </button>
          ))}
        </div>

        {/* Tabs and Date Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between text-black items-start sm:items-center gap-4 mb-8">
          {/* Tabs */}
          <div className="flex gap-2 text-black overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-black rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:outline-none active:outline-none whitespace-nowrap ${getTabButtonStyle(tab)}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[#1E1E1E] text-black hover:bg-[#2A2A2A] border border-gray-700 transition-all duration-200 min-w-[160px] justify-between"
            >
              <span>{getSelectedLabel()}</span>
              <FaChevronDown className={`text-black transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} size={14} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#1E1E1E] border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">
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
                          : "text-black hover:bg-[#2A2A2A]"
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
            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 p-6">
              <div className="mb-6">
                <h2 className="text-white text-xl font-semibold">Payment Analytics</h2>
                <p className="text-gray-400 text-sm mt-1">Track payment methods and transaction history</p>
              </div>
              
              {/* Payment Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#262626] rounded-xl p-5 border border-gray-700 hover:border-green-500/30 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Cash Payments</p>
                      <p className="text-3xl font-bold text-white mt-1">{cashPayments}</p>
                      <p className="text-green-400 text-xs mt-1">₹{cashRevenue.toFixed(2)} revenue</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <BsCashCoin className="text-2xl text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#262626] rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Online Payments</p>
                      <p className="text-3xl font-bold text-white mt-1">{onlinePayments}</p>
                      <p className="text-blue-400 text-xs mt-1">₹{onlineRevenue.toFixed(2)} revenue</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <FaChartLine className="text-2xl text-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#262626] rounded-xl p-5 border border-gray-700 hover:border-yellow-500/30 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Transactions</p>
                      <p className="text-3xl font-bold text-white mt-1">{orders.length}</p>
                      <p className="text-yellow-400 text-xs mt-1">₹{totalRevenue.toFixed(2)} total revenue</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div>
                <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-400 text-sm font-medium">Order ID</th>
                        <th className="pb-3 text-gray-400 text-sm font-medium">Customer</th>
                        <th className="pb-3 text-gray-400 text-sm font-medium">Amount</th>
                        <th className="pb-3 text-gray-400 text-sm font-medium">Method</th>
                        <th className="pb-3 text-gray-400 text-sm font-medium">Status</th>
                        <th className="pb-3 text-gray-400 text-sm font-medium">Date</th>
                       </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-b border-gray-800 hover:bg-[#262626] transition">
                          <td className="py-3 text-white text-sm">#{order._id?.slice(-6)}</td>
                          <td className="py-3 text-gray-300 text-sm">{order.customerDetails?.name || "Guest"}</td>
                          <td className="py-3 text-yellow-400 text-sm font-medium">₹{order.bills?.totalWithTax?.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.paymentMethod === "Cash" 
                                ? "bg-green-500/10 text-green-500" 
                                : order.paymentMethod === "Online"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-gray-500/10 text-gray-400"
                            }`}>
                              {order.paymentMethod || "—"}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.paymentStatus === "Paid" 
                                ? "bg-green-500/10 text-green-500" 
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}>
                              {order.paymentStatus || "Pending"}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex flex-wrap gap-3 justify-center">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Cash: {cashPayments} transactions
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Online: {onlinePayments} transactions
                  </span>
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Total: {orders.length} Transactions
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          type={modalType}
        />
      )}
    </div>
  );
};

export default Dashboard;
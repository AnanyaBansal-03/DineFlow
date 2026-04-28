import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Add this import
import BottomNav from "../components/shared/BottomNav";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import { BiDish } from "react-icons/bi";
import { MdDashboard } from "react-icons/md"; // Add this import
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../https";

const Home = () => {
  const navigate = useNavigate(); // Add this
  useEffect(() => {
    document.title = "DineFlow | Home";
  }, []);

  // Get logged-in user data from Redux
  const userData = useSelector((state) => state.user);
  
  const { data } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const orders = data?.data?.data || [];

  // ===============================
  // 📊 CALCULATIONS
  // ===============================

  const totalOrders = orders.length;

  const inProgressOrders = orders.filter(
    (o) => o.orderStatus === "In Progress"
  ).length;

  const completedOrders = orders.filter(
    (o) => o.orderStatus === "Completed"
  );

  const totalEarnings = completedOrders.reduce(
    (acc, curr) => acc + (curr?.bills?.totalWithTax || 0),
    0
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // ===============================
  // 🍽 POPULAR DISHES CALCULATION
  // ===============================

  const dishCounter = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (!dishCounter[item.name]) {
        dishCounter[item.name] = {
          name: item.name,
          count: 0,
          price: item.price || 0,
        };
      }
      dishCounter[item.name].count += item.quantity || 1;
    });
  });

  const popularDishes = Object.values(dishCounter)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden w-full">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="px-6 py-6 w-full">

          {/* Header with Greeting and Dashboard Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {getGreeting()}, {userData.name || "User"}
              </h2>
              <p className="text-gray-400 mt-1">
                Give your best services for customers 🛒
              </p>
            </div>
            
            {/* Dashboard Button - Only visible for Admin users */}
            {userData.role === "Admin" && (
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 bg-[#262626] hover:bg-[#2f2f2f] text-black px-4 py-2 rounded-lg border border-gray-700 transition"
                title="Go to Dashboard"
              >
                <MdDashboard className="text-xl text-yellow-400" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Earnings</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    ₹{totalEarnings.toFixed(2)}
                  </p>
                </div>
                <BsCashCoin className="text-3xl text-yellow-400" />
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {inProgressOrders}
                  </p>
                </div>
                <GrInProgress className="text-3xl text-blue-400" />
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {totalOrders}
                  </p>
                </div>
                <BiDish className="text-3xl text-purple-400" />
              </div>
            </div>
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Orders */}
            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800">
              <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">
                  Recent Orders
                </h3>
                <button 
                  onClick={() => navigate("/orders")}
                  className="text-xs text-yellow-400 hover:text-yellow-300"
                >
                  View All
                </button>
              </div>

              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="px-6 py-4 border-b border-gray-800 hover:bg-[#262626] cursor-pointer transition"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {order.customerDetails?.name || "Guest"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {order.items?.length || 0} items • Table {order.table?.tableNo || "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          ₹{order.bills?.totalWithTax?.toFixed(2) || "0.00"}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.orderStatus === "Completed" ? "bg-green-500/20 text-green-500" :
                          order.orderStatus === "In Progress" ? "bg-yellow-500/20 text-yellow-500" :
                          order.orderStatus === "Ready" ? "bg-blue-500/20 text-blue-500" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  No recent orders
                </div>
              )}
            </div>

            {/* Popular Dishes */}
            <div className="bg-[#1E1E1E] rounded-xl border border-gray-800">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  Popular Dishes
                </h3>
              </div>

              {popularDishes.length > 0 ? (
                popularDishes.map((dish, index) => (
                  <div key={index} className="px-6 py-4 border-b border-gray-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-yellow-400/10 text-yellow-400 text-xs flex items-center justify-center font-bold">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-white font-medium">
                            {dish.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {dish.count} orders
                          </p>
                        </div>
                      </div>
                      <p className="text-yellow-400 font-semibold">
                        ₹{dish.price}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  No data available
                </div>
              )}
            </div>

          </div>

          <div className="h-24"></div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
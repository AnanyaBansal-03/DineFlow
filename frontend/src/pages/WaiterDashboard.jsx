import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getTables, updateOrderStatus } from "../https";
import { enqueueSnackbar } from "notistack";
import { 
  FaPlus, 
  FaUtensils, 
  FaTable, 
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaEye,
  FaQrcode
} from "react-icons/fa";
import BottomNav from "../components/shared/BottomNav";

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userData = useSelector((state) => state.user);

  useEffect(() => {
    document.title = "DineFlow | Waiter Dashboard";
  }, []);

  // Fetch orders
  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 10000,
  });

  // Fetch tables
  const { data: tablesData } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    refetchInterval: 10000,
  });

  const orders = ordersData?.data?.data || [];
  const tables = tablesData?.data?.data || [];

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar("Order status updated!", { variant: "success" });
    },
  });

  // Filter orders
  const activeOrders = orders.filter(o => 
    o.orderStatus === "Pending" || 
    o.orderStatus === "In Progress" || 
    o.orderStatus === "Ready"
  );

  const completedOrders = orders.filter(o => o.orderStatus === "Completed");

  // Table stats
  const availableTables = tables.filter(t => !t?.currentOrder).length;
  const occupiedTables = tables.filter(t => t?.currentOrder).length;
  const newOrdersCount = orders.filter(o => o.orderStatus === "Pending").length;

  // Handlers
  const handleTakeOrder = () => {
    navigate("/tables");
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleProcessBill = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case "Pending":
        return { color: "yellow", icon: <FaSpinner size={12} />, bg: "bg-yellow-500/20", text: "text-yellow-500", label: "Pending" };
      case "In Progress":
        return { color: "blue", icon: <FaClock size={12} />, bg: "bg-blue-500/20", text: "text-blue-500", label: "Cooking" };
      case "Ready":
        return { color: "green", icon: <FaCheckCircle size={12} />, bg: "bg-green-500/20", text: "text-green-500", label: "Ready to Serve" };
      default:
        return { color: "gray", icon: null, bg: "bg-gray-500/20", text: "text-gray-400", label: status };
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Waiter Dashboard</h1>
            <p className="text-yellow-100 text-sm mt-1">
              Welcome back, {userData.name || "Waiter"}! 👋
            </p>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <FaUtensils className="text-white text-2xl" />
          </div>
        </div>
      </div>

      {/* Active Tables Section */}
      <div className="px-4 mt-6">
        <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
          <FaTable className="text-yellow-400" /> Active Tables
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1E1E1E] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Occupied Tables</p>
                <p className="text-2xl font-bold text-white">{occupiedTables}</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <FaTable className="text-orange-500 text-lg" />
              </div>
            </div>
          </div>
          <div className="bg-[#1E1E1E] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Available Tables</p>
                <p className="text-2xl font-bold text-white">{availableTables}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <FaTable className="text-green-500 text-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Order Button */}
      <div className="px-4 mt-6">
        <button
          onClick={handleTakeOrder}
          className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30 transition hover:bg-yellow-300"
        >
          <FaPlus size={20} />
          Create New Order
        </button>
      </div>

      {/* Current Orders Section */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <FaClock className="text-yellow-400" /> Current Orders
          </h2>
          {newOrdersCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {newOrdersCount} New
            </span>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-xl p-8 text-center border border-gray-800">
            <p className="text-gray-500">No active orders</p>
            <p className="text-gray-600 text-sm mt-1">Tap "Create New Order" to start</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const statusConfig = getStatusConfig(order.orderStatus);
              return (
                <div
                  key={order._id}
                  className={`bg-[#1E1E1E] rounded-xl p-4 border ${
                    order.orderStatus === "Pending" ? "border-yellow-500/30" :
                    order.orderStatus === "Ready" ? "border-green-500/30" :
                    "border-gray-700"
                  } transition hover:border-yellow-400/50`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          order.orderStatus === "Pending" ? "bg-yellow-500 animate-pulse" :
                          order.orderStatus === "In Progress" ? "bg-blue-500" :
                          "bg-green-500"
                        }`} />
                        <p className="text-white font-semibold">
                          Order #{order._id.slice(-6)}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Table {order.table?.tableNo} • {order.customerDetails?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-xs">
                          {order.items?.length} items
                        </p>
                        <span className="text-gray-600 text-xs">•</span>
                        <p className="text-yellow-400 text-sm font-semibold">
                          ₹{order.bills?.totalWithTax?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleViewOrder(order._id)}
                      className="flex-1 bg-[#262626] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#2f2f2f] transition flex items-center justify-center gap-1"
                    >
                      <FaEye size={14} />
                      View Details
                    </button>
                    
                    {/* Bill Section - Shows when order is ready */}
                    {order.orderStatus === "Ready" && (
                      <button
                        onClick={() => handleProcessBill(order._id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1"
                      >
                        <FaMoneyBillWave size={14} />
                        Process Bill
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="px-4 mt-6 mb-6">
          <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-400" /> Completed Orders
          </h2>
          <div className="space-y-2">
            {completedOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="bg-[#1E1E1E] rounded-xl p-3 border border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">
                      #{order._id.slice(-6)} • Table {order.table?.tableNo}
                    </p>
                    <p className="text-gray-500 text-xs">{order.customerDetails?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs">✓ Completed</span>
                    <p className="text-yellow-400 text-sm font-semibold">
                      ₹{order.bills?.totalWithTax?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default WaiterDashboard;
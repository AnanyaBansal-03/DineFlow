import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getTables, updateOrderStatus } from "../https";
import { enqueueSnackbar } from "notistack";
import { useSocket } from "../context/SocketContext";
import { FaClock, FaFire, FaCheckCircle, FaCircle, FaPlus, FaEye, FaMoneyBillWave } from "react-icons/fa";
import { MdTableRestaurant } from "react-icons/md";

// ✅ ORDER TIMER HELPER FUNCTIONS
const getWaitingTime = (createdAt) => {
  const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

const getTimerColor = (createdAt) => {
  const minutes = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (minutes > 20) return 'text-red-500';
  if (minutes > 10) return 'text-orange-400';
  return 'text-gray-400';
};

const elapsed = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return "just now";
  return `${mins}m ago`;
};

const COLS = [
  {
    key: "Pending",
    label: "New Orders",
    icon: FaClock,
    color: "text-yellow-400",
    ringColor: "ring-yellow-400/30",
    badgeBg: "bg-yellow-400/10 text-yellow-400",
    dotColor: "bg-yellow-400",
    action: "view",
  },
  {
    key: "In Progress",
    label: "Cooking",
    icon: FaFire,
    color: "text-orange-400",
    ringColor: "ring-orange-400/30",
    badgeBg: "bg-orange-400/10 text-orange-400",
    dotColor: "bg-orange-400",
    action: "view",
  },
  {
    key: "Ready",
    label: "Ready to Serve",
    icon: FaCheckCircle,
    color: "text-green-400",
    ringColor: "ring-green-400/30",
    badgeBg: "bg-green-400/10 text-green-400",
    dotColor: "bg-green-400",
    action: "bill",
  },
];

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userData = useSelector((state) => state.user);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["orders"] });
    socket.on("orders_updated", refresh);
    socket.on("order_updated", refresh);
    return () => {
      socket.off("orders_updated", refresh);
      socket.off("order_updated", refresh);
    };
  }, [socket, queryClient]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  const orders = ordersData?.data?.data || [];
  const tables = tablesData?.data?.data || [];

  const grouped = {
    "Pending":     orders.filter((o) => o.orderStatus === "Pending"),
    "In Progress": orders.filter((o) => o.orderStatus === "In Progress"),
    "Ready":       orders.filter((o) => o.orderStatus === "Ready"),
  };

  const occupiedTables = tables.filter((t) => t?.currentOrder).length;
  const availableTables = tables.filter((t) => !t?.currentOrder).length;
  const totalActive = grouped["Pending"].length + grouped["In Progress"].length;

  if (ordersLoading || tablesLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading waiter dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between
                      px-6 py-3 bg-[#141414] border-b border-[#222]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🛎️</span>
          <div>
            <p className="text-white font-bold text-xl leading-tight">
              Waiter Dashboard
            </p>
            <p className="text-gray-400 text-[15px]">
              {userData.name?.split(" ")[0] || "Waiter"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {COLS.map((c) => (
              <div key={c.key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${c.dotColor}`} />
                <span className="text-gray-400 text-md">
                  {grouped[c.key].length} {c.label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-gray-400 text-md">
                {occupiedTables} / {occupiedTables + availableTables} tables
              </span>
            </div>
          </div>

          {totalActive > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold
                             text-yellow-400 bg-yellow-400/10 border border-yellow-400/20
                             px-3 py-1 rounded-full">
              <FaCircle size={6} className="animate-pulse" />
              {totalActive} active
            </span>
          )}

          <button
            onClick={() => navigate("/tables")}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300
                       text-black text-xs font-bold px-3 py-1.5 rounded-lg
                       transition-all duration-150"
          >
            <FaPlus size={9} /> New Order
          </button>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {COLS.map((col, ci) => {
          const ColIcon = col.icon;
          const colOrders = grouped[col.key];

          return (
            <div
              key={col.key}
              className={`flex flex-col border-r border-[#1e1e1e] last:border-r-0
                          ${col.key === "In Progress" ? "bg-[#111]" : "bg-[#0f0f0f]"}`}
            >
              {/* Column header */}
              <div className="flex-shrink-0 flex items-center justify-between
                              px-4 py-3 border-b border-[#1e1e1e]">
                <div className="flex items-center gap-2">
                  <ColIcon size={13} className={col.color} />
                  <span className={`text-sm font-semibold ${col.color}`}>
                    {col.label}
                  </span>
                </div>
                {colOrders.length > 0 && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                    {colOrders.length}
                  </span>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
                {colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center
                                  h-32 rounded-xl border border-dashed border-[#252525]">
                    <p className="text-gray-500 text-xs">No orders here</p>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <div
                      key={order._id}
                      className={`bg-[#181818] rounded-xl border border-[#272727]
                                  ring-1 ${col.ringColor}
                                  hover:border-[#333] transition-all duration-200`}
                    >
                      <div className={`h-[2px] w-full rounded-t-xl ${col.dotColor}`} />

                      <div className="p-3">
                        {/* Order ID + time */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold text-sm">
                            #{order._id.slice(-4).toUpperCase()}
                          </span>
                          <span className="text-gray-600 text-[10px]">
                            {elapsed(order.createdAt)}
                          </span>
                        </div>

                        {/* Table + customer */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <MdTableRestaurant size={11} className="text-gray-600" />
                          <span className="text-gray-500 text-xs">
                            Table {order.table?.tableNo ?? "—"}
                          </span>
                          {order.customerDetails?.name && (
                            <>
                              <span className="text-gray-700 text-xs">·</span>
                              <span className="text-gray-500 text-xs truncate max-w-[80px]">
                                {order.customerDetails.name}
                              </span>
                            </>
                          )}
                        </div>

                        {/* ✅ ORDER TIMER - ADDED HERE */}
                        <div className="flex items-center gap-1 mb-2">
                          <FaClock size={10} className="text-gray-500" />
                          <span className={`text-[10px] font-medium ${getTimerColor(order.createdAt)}`}>
                            ⏱️ Waiting: {getWaitingTime(order.createdAt)}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 mb-3">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between
                                         bg-[#1f1f1f] rounded-lg px-2.5 py-1.5"
                            >
                              <span className="text-gray-300 text-xs truncate flex-1">
                                {item.name}
                              </span>
                              <span className={`text-[11px] font-bold ml-2 ${col.color}`}>
                                ×{item.quantity}
                              </span>
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <p className="text-gray-600 text-[10px] text-center pt-1">
                              +{order.items.length - 3} more items
                            </p>
                          )}
                        </div>

                        {/* Total for Ready column */}
                        {col.key === "Ready" && order.bills?.totalWithTax && (
                          <div className="flex items-center justify-between
                                          bg-green-500/5 border border-green-500/15
                                          rounded-lg px-2.5 py-1.5 mb-3">
                            <span className="text-gray-500 text-[10px]">Total</span>
                            <span className="text-green-400 font-bold text-xs">
                              ₹{order.bills.totalWithTax.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className="flex-1 flex items-center justify-center gap-1
                                       bg-[#222] hover:bg-[#2a2a2a]
                                       border border-[#2e2e2e] hover:border-[#383838]
                                       text-gray-400 hover:text-white
                                       py-1.5 rounded-lg text-[10px] font-semibold
                                       transition-all duration-150"
                          >
                            <FaEye size={9} /> View
                          </button>

                          {col.key === "Ready" && (
                            <button
                              onClick={() => navigate(`/orders/${order._id}`)}
                              className="flex-1 flex items-center justify-center gap-1
                                         bg-green-600 hover:bg-green-500 text-white
                                         py-1.5 rounded-lg text-[10px] font-semibold
                                         transition-all duration-150"
                            >
                              <FaMoneyBillWave size={9} /> Bill
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WaiterDashboard;
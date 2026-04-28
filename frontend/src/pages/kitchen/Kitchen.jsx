import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "../../https";
import { enqueueSnackbar } from "notistack";
import { useSocket } from "../../context/SocketContext";
import { FaClock, FaFire, FaCheckCircle, FaCircle } from "react-icons/fa";
import { MdTableRestaurant } from "react-icons/md";

/* ── tiny helpers ─────────────────────────────────────────────────── */
const fmt = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
    btnLabel: "Start Cooking",
    btnClass: "bg-yellow-400 hover:bg-yellow-300 text-black",
    nextStatus: "In Progress",
    dotColor: "bg-yellow-400",
  },
  {
    key: "In Progress",
    label: "Cooking",
    icon: FaFire,
    color: "text-orange-400",
    ringColor: "ring-orange-400/30",
    badgeBg: "bg-orange-400/10 text-orange-400",
    btnLabel: "Mark Ready",
    btnClass: "bg-green-500 hover:bg-green-400 text-black",
    nextStatus: "Ready",
    dotColor: "bg-orange-400",
  },
  {
    key: "Ready",
    label: "Ready to Serve",
    icon: FaCheckCircle,
    color: "text-green-400",
    ringColor: "ring-green-400/30",
    badgeBg: "bg-green-400/10 text-green-400",
    btnLabel: "Served ✓",
    btnClass: "bg-green-500/20 text-green-400 cursor-not-allowed",
    nextStatus: null,
    dotColor: "bg-green-400",
  },
];

/* ── component ────────────────────────────────────────────────────── */
const Kitchen = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["orders"] });
    const onNew = (order) => {
      enqueueSnackbar(`New order #${order._id?.slice(-4)}`, {
        variant: "info", autoHideDuration: 3500,
      });
      refresh();
    };
    socket.on("orders_updated", refresh);
    socket.on("new_order", onNew);
    socket.on("order_updated", refresh);
    return () => {
      socket.off("orders_updated", refresh);
      socket.off("new_order", onNew);
      socket.off("order_updated", refresh);
    };
  }, [socket, queryClient]);

  const { data: resData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  const mutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      updateOrderStatus({ orderId, orderStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      enqueueSnackbar("Status updated", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to update", { variant: "error" }),
  });

  const orders = resData?.data?.data || [];
  const grouped = {
    "Pending":     orders.filter((o) => o.orderStatus === "Pending"),
    "In Progress": orders.filter((o) => o.orderStatus === "In Progress"),
    "Ready":       orders.filter((o) => o.orderStatus === "Ready"),
  };
  const totalActive = grouped["Pending"].length + grouped["In Progress"].length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading kitchen…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between
                      px-6 py-3 bg-[#141414] border-b border-[#222]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">👨‍🍳</span>
          <div>
            <p className="text-white font-bold text-xl leading-tight">
              Kitchen Display
            </p>
            <p className="text-gray-400 text-[15px]">Live order queue</p>
          </div>
        </div>

        {/* Live pill */}
        <div className="flex items-center gap-4">
          {/* Stats row */}
          <div className="hidden sm:flex items-center gap-3">
            {COLS.map((c) => (
              <div key={c.key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${c.dotColor}`} />
                <span className="text-gray-400 text-md">
                  {grouped[c.key].length} {c.label}
                </span>
              </div>
            ))}
          </div>

          {totalActive > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold
                             text-yellow-400 bg-yellow-400/10 border border-yellow-400/20
                             px-3 py-1 rounded-full">
              <FaCircle size={6} className="animate-pulse" />
              {totalActive} active
            </span>
          )}
        </div>
      </div>

      {/* ── Kanban columns ── */}
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
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center
                                  h-32 rounded-xl border border-dashed border-[#252525]">
                    <p className="text-white text-xs">No orders here</p>
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <div
                      key={order._id}
                      className={`bg-[#181818] rounded-xl border border-[#272727]
                                  ring-1 ${col.ringColor}
                                  hover:border-[#333] transition-all duration-200`}
                    >
                      {/* Card top bar — coloured line */}
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

                        {/* Items */}
                        <div className="space-y-1 mb-3">
                          {order.items?.map((item, i) => (
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
                        </div>

                        {/* Action button */}
                        {col.nextStatus ? (
                          <button
                            onClick={() =>
                              mutation.mutate({
                                orderId: order._id,
                                status: col.nextStatus,
                              })
                            }
                            disabled={mutation.isPending}
                            className={`w-full py-2 rounded-lg text-xs font-bold
                                        transition-all duration-150 disabled:opacity-50
                                        ${col.btnClass}`}
                          >
                            {col.btnLabel}
                          </button>
                        ) : (
                          <div className={`w-full py-2 rounded-lg text-xs font-bold
                                          text-center ${col.btnClass}`}>
                            {col.btnLabel}
                          </div>
                        )}
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

export default Kitchen;
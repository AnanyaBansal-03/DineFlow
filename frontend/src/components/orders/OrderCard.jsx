import React, { useEffect } from "react";
import {
  FaCheckDouble,
  FaLongArrowAltRight,
  FaCircle,
} from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "../../https";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

const OrderCard = ({ order }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const customerName = order?.customerDetails?.name || "N/A";
  const tableNo = order?.table?.tableNo || "N/A";
  const itemsCount = order?.items?.length || 0;
  const total = order?.bills?.totalWithTax || 0;

  // Listen for real-time updates for this specific order
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (updatedOrder) => {
      if (updatedOrder._id === order._id) {
        // Invalidate and refetch this specific order
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order", order._id] });
      }
    };

    socket.on("order_updated", handleOrderUpdate);

    return () => {
      socket.off("order_updated", handleOrderUpdate);
    };
  }, [socket, order._id, queryClient]);

  /* ================= STATUS UPDATE ================= */

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", order._id] });
    },
  });

  const handleReady = () => {
    statusMutation.mutate({
      orderId: order._id,
      orderStatus: "Ready",
    });
  };

  /* ================= STATUS BADGE ================= */

  const getStatusBadge = () => {
    switch (order?.orderStatus) {
      case "Pending":
        return (
          <span className="text-gray-400 bg-[#3a3a3a] px-3 py-1 rounded-full text-xs font-medium">
            <FaCircle className="inline mr-1 text-gray-400 text-[8px]" />
            Pending
          </span>
        );
      case "In Progress":
        return (
          <span className="text-yellow-500 bg-[#4a452e] px-3 py-1 rounded-full text-xs font-medium">
            <FaCircle className="inline mr-1 text-yellow-500 text-[8px]" />
            In Progress
          </span>
        );
      case "Ready":
        return (
          <span className="text-green-500 bg-[#2e4a40] px-3 py-1 rounded-full text-xs font-medium">
            <FaCheckDouble className="inline mr-1 text-xs" />
            Ready
          </span>
        );
      case "Completed":
        return (
          <span className="text-blue-500 bg-[#2e3f4a] px-3 py-1 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#262626] rounded-xl border border-gray-700 hover:border-gray-600 transition overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex gap-3">
          <div className="bg-[#f6b100] w-12 h-12 rounded-lg flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
            {getAvatarName(customerName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold text-base">
                  {customerName}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  #{order?._id?.slice(-6)} • Dine in
                </p>
                <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                  <span>Table</span>
                  <FaLongArrowAltRight className="text-gray-500 text-[10px]" />
                  <span className="text-white font-medium">{tableNo}</span>
                </div>
              </div>

              <div className="ml-2">{getStatusBadge()}</div>
            </div>
          </div>
        </div>

        {/* ACTIVE ORDERS */}
        {order?.orderStatus !== "Completed" ? (
          <>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatDateAndTime(order?.orderDate)}</span>
                <span className="bg-[#1f1f1f] px-2 py-1 rounded-md">
                  {itemsCount} {itemsCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex justify-between mt-3">
                <span className="text-gray-300 text-sm font-medium">
                  Total
                </span>
                <span className="text-white font-bold">
                  ₹{Number(total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-4 space-y-2">
              {/* Continue Order */}
              <button
                onClick={() => navigate(`/orders/${order._id}`)}
                className="w-full bg-gray-700 text-gray-400 text-sm py-2.5 rounded-lg hover:bg-gray-600 transition"
              >
                Continue Order
              </button>

              {/* In Progress → Ready */}
              {order?.orderStatus === "In Progress" && (
                <button
                  onClick={handleReady}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-sm py-2.5 rounded-lg transition"
                >
                  Mark as Ready
                </button>
              )}

              {/* Ready → Payment */}
              {order?.orderStatus === "Ready" && (
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="w-full bg-green-500 hover:bg-green-600 text-black text-sm py-2.5 rounded-lg transition"
                >
                  Proceed to Payment
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatDateAndTime(order?.orderDate)}</span>
                <span className="bg-[#1f1f1f] px-2 py-1 rounded-md">
                  {itemsCount} {itemsCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex justify-between mt-3">
                <span className="text-gray-300 text-sm font-medium">
                  Total
                </span>
                <span className="text-white font-bold">
                  ₹{Number(total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                disabled
                className="w-full bg-gray-700 text-gray-400 text-sm py-2.5 rounded-lg cursor-not-allowed"
              >
                Order Completed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
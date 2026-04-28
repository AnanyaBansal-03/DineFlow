import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders } from "../https";
import { enqueueSnackbar } from "notistack";
import { useSocket } from "../context/SocketContext";

const Orders = () => {
  const [status, setStatus] = useState("All");
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    document.title = "DineFlow | Orders";
  }, []);

  // Socket.io real-time listeners
  useEffect(() => {
    if (!socket) return;

    const handleOrdersUpdated = () => {
      console.log("Orders updated, refetching...");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    const handleNewOrder = (order) => {
      console.log("New order received:", order);
      enqueueSnackbar(`📦 New order #${order._id?.slice(-6)} received!`, {
        variant: "info",
        autoHideDuration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    const handleOrderUpdated = (order) => {
      console.log("Order updated:", order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    socket.on("orders_updated", handleOrdersUpdated);
    socket.on("new_order", handleNewOrder);
    socket.on("order_updated", handleOrderUpdated);

    return () => {
      socket.off("orders_updated", handleOrdersUpdated);
      socket.off("new_order", handleNewOrder);
      socket.off("order_updated", handleOrderUpdated);
    };
  }, [socket, queryClient]);

  /* ===============================
     FETCH ORDERS
  =============================== */

  const { data: resData, isError, isLoading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Now relying on socket for updates
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", {
        variant: "error",
      });
    }
  }, [isError]);

  const orders = resData?.data?.data || [];

  /* ===============================
     FILTER LOGIC
  =============================== */

  const filteredOrders =
    status === "All"
      ? orders
      : orders.filter((order) => order.orderStatus === status);

  // Button styling function
  const getButtonStyle = (buttonStatus) => {
    const isActive = status === buttonStatus;
    
    if (isActive) {
      return "bg-yellow-400 text-black font-semibold";
    }
    
    return "bg-[#2a2a2a] text-black font-medium hover:bg-[#3a3a3a]";
  };

  // Get counts for each status
  const getStatusCount = (statusType) => {
    if (statusType === "All") return orders.length;
    return orders.filter(order => order.orderStatus === statusType).length;
  };

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      
      

      {/* Header - Fixed at top */}
      <div className="bg-[#1E1E1E] border-b border-gray-800 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BackButton />
            <h1 className="text-md font-bold text-white">
              <span className="text-yellow-400">Orders</span>
            </h1>
          </div>

          {/* Status Filter - Scrollable on mobile */}
          <div className="overflow-x-auto pb-1 hide-scrollbar text-black">
            <div className="flex items-center gap-2 min-w-max text-black">
              {["All", "Pending", "In Progress", "Ready", "Completed"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className={`px-5 text-black py-2.5 rounded-xl text-sm tracking-wide transition-all duration-200 outline-none focus:outline-none active:outline-none ${getButtonStyle(item)}`}
                  >
                    {item}
                    {item !== "All" && (
                      <span className="ml-1.5 text-xs opacity-70">
                        ({getStatusCount(item)})
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid - Scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 sm:px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading orders...</div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No orders found</p>
                <p className="text-gray-600 text-sm mt-2">
                  {status === "All" 
                    ? "There are no orders yet" 
                    : `No ${status} orders available`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Fixed at bottom */}
      <BottomNav />
    </div>
  );
};

export default Orders;
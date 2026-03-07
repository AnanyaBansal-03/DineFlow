import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../https";
import { enqueueSnackbar } from "notistack";

const Orders = () => {
  const [status, setStatus] = useState("All");

  useEffect(() => {
    document.title = "DineFlow | Orders";
  }, []);

  /* ===============================
     FETCH ORDERS
  =============================== */

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
    
    return "bg-[#2a2a2a] text-gray-300 font-medium hover:bg-[#3a3a3a] hover:text-white";
  };

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      
      {/* Header - Fixed at top */}
      <div className="bg-[#1E1E1E] border-b border-gray-800 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-md font-bold text-white">
              <span className="text-yellow-400">Orders</span>
            </h1>
          </div>

          {/* Status Filter - Scrollable on mobile */}
          <div className="overflow-x-auto pb-1 hide-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {["All", "Pending", "In Progress", "Ready", "Completed"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className={`px-5 py-2.5 rounded-xl text-sm tracking-wide transition-all duration-200 outline-none focus:outline-none active:outline-none ${getButtonStyle(item)}`}
                  >
                    {item}
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
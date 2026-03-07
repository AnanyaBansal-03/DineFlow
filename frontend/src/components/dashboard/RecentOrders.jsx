import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https";
import { formatDateAndTime } from "../../utils";
import { FaSyncAlt } from "react-icons/fa";

const RecentOrders = () => {
  const queryClient = useQueryClient();

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) => updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    },
  });

  const { data: resData, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  const orders = resData?.data?.data || [];

  const handleStatusChange = (orderId, newStatus) => {
    orderStatusUpdateMutation.mutate({ orderId, orderStatus: newStatus });
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case "Pending":
        return "bg-gray-500/20 text-gray-400";
      case "In Progress":
        return "bg-yellow-500/20 text-yellow-500";
      case "Ready":
        return "bg-green-500/20 text-green-500";
      case "Completed":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">Recent Orders</h2>
        <button 
          onClick={() => queryClient.invalidateQueries(["orders"])}
          className="text-gray-400 hover:text-yellow-400 transition p-2"
          title="Refresh"
        >
          <FaSyncAlt className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-400">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="pb-3 text-gray-400 text-sm font-medium">Order ID</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Customer</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Status</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Date & Time</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Items</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Table</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Total</th>
                <th className="pb-3 text-gray-400 text-sm font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order._id} className="border-b border-gray-800 hover:bg-[#262626] transition">
                  <td className="py-4 text-white text-sm">
                    #{order._id?.slice(-6)}
                  </td>
                  <td className="py-4 text-white text-sm">
                    {order.customerDetails?.name || "Guest"}
                  </td>
                  <td className="py-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 focus:ring-1 focus:ring-yellow-400 ${getStatusBadgeClass(order.orderStatus)}`}
                      style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                    >
                      <option value="Pending" className="bg-[#262626] text-gray-400">Pending</option>
                      <option value="In Progress" className="bg-[#262626] text-yellow-500">In Progress</option>
                      <option value="Ready" className="bg-[#262626] text-green-500">Ready</option>
                      <option value="Completed" className="bg-[#262626] text-blue-500">Completed</option>
                    </select>
                  </td>
                  <td className="py-4 text-gray-300 text-sm">
                    {formatDateAndTime(order.orderDate)}
                  </td>
                  <td className="py-4 text-gray-300 text-sm">
                    {order.items?.length || 0} items
                  </td>
                  <td className="py-4 text-gray-300 text-sm">
                    Table {order.table?.tableNo || "N/A"}
                  </td>
                  <td className="py-4 text-yellow-400 text-sm font-medium">
                    ₹{order.bills?.totalWithTax?.toFixed(2) || "0.00"}
                  </td>
                  <td className="py-4 text-gray-300 text-sm">
                    {order.paymentMethod || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
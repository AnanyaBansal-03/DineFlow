import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BottomNav from "../components/shared/BottomNav";
import {
  getOrderById,
  getMenu,
  addItemToOrder,
  decreaseItemFromOrder,
  updateOrderStatus,
} from "../https";
import { enqueueSnackbar } from "notistack";
import { menus } from "../constants";
import Bill from "../components/menu/Bill";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "DineFlow | Order Details";
  }, []);

  const { data: orderData, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    refetchOnMount: true,
  });

  const order = orderData?.data?.data;

  const { data: menuData } = useQuery({
    queryKey: ["menu"],
    queryFn: getMenu,
  });

  const menuItems =
    menuData?.data?.data?.length > 0
      ? menuData.data.data
      : menus.flatMap((cat) => cat.items);

  const addItemMutation = useMutation({
    mutationFn: (item) =>
      addItemToOrder(id, {
        name: item.name,
        price: item.price,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: () => {
      enqueueSnackbar("Failed to add item", { variant: "error" });
    },
  });

  const decreaseItemMutation = useMutation({
    mutationFn: (itemName) => decreaseItemFromOrder(id, itemName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: () => {
      enqueueSnackbar("Failed to decrease item", { variant: "error" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      enqueueSnackbar(`Order status updated to ${variables.orderStatus}!`, {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status", { variant: "error" });
    },
  });

  const handleAddItem = (item) => {
    if (order?.orderStatus === "Completed") {
      enqueueSnackbar("Order already completed!", { variant: "warning" });
      return;
    }
    addItemMutation.mutate(item);
  };

  const handleDecrease = (item) => {
    if (order?.orderStatus === "Completed") {
      enqueueSnackbar("Order already completed!", { variant: "warning" });
      return;
    }
    decreaseItemMutation.mutate(item.name);
  };

  // Show Bill for Ready AND Completed orders (so invoice stays visible)
  const showBill = order?.orderStatus === "Ready" || order?.orderStatus === "Completed";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <div className="flex flex-1">
        {/* LEFT SIDE - MENU */}
        <div className="w-2/3 border-r border-gray-800 overflow-y-auto p-6 pb-24">
          <h2 className="text-xl font-semibold text-white mb-6">Menu</h2>
          <div className="grid grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id || item._id}
                onClick={() => handleAddItem(item)}
                className="bg-[#1E1E1E] p-4 rounded-xl border border-gray-800 cursor-pointer hover:bg-[#2a2a2a] transition"
              >
                <h3 className="text-white font-medium">{item.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.category}</p>
                <p className="text-yellow-400 font-semibold mt-2">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - ORDER DETAILS */}
        <div className="w-1/3 bg-[#181818] p-6 pb-24 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Order #{order._id.slice(-6)}
            </h2>
            <p className="text-gray-400 text-sm">Table {order?.table?.tableNo}</p>
            {/* Show payment status badge */}
            {order?.orderStatus === "Completed" && (
              <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Payment Completed
              </span>
            )}
          </div>

          {/* ITEMS */}
          <div className="flex-1 overflow-y-auto">
            {order.items.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">No items added</p>
            ) : (
              order.items.map((item, index) => (
                <div
                  key={item.name + index}
                  className="flex justify-between items-center mb-4 bg-[#222] p-3 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={order?.orderStatus === "Completed"}
                        className={`px-4 py-2 rounded text-black ${
                          order?.orderStatus === "Completed"
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-red-600"
                        }`}
                      >
                        −
                      </button>
                      <span className="text-white font-semibold text-lg">
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                  <p className="text-white font-semibold">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* STATUS FLOW */}
          {order.orderStatus === "Pending" && (
            <button
              onClick={() =>
                updateStatusMutation.mutate({
                  orderId: id,
                  orderStatus: "In Progress",
                })
              }
              className="mt-4 w-full bg-yellow-600 text-black py-2 rounded-lg"
            >
              Send to Kitchen
            </button>
          )}

          {order.orderStatus === "In Progress" && (
            <button
              onClick={() =>
                updateStatusMutation.mutate({
                  orderId: id,
                  orderStatus: "Ready",
                })
              }
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Ready to Serve
            </button>
          )}

          {/* SHOW BILL for Ready AND Completed orders */}
          {showBill && (
            <div className="mt-4">
              <Bill key={order._id} order={order} />
            </div>
          )}

          {/* BILL SUMMARY */}
          <div className="border-t border-gray-800 pt-4 mt-4">
            <div className="flex justify-between text-gray-400 mb-2">
              <span>Subtotal</span>
              <span>₹{order?.bills?.total || 0}</span>
            </div>
            <div className="flex justify-between text-gray-400 mb-2">
              <span>Tax (5%)</span>
              <span>₹{order?.bills?.tax || 0}</span>
            </div>
            <div className="flex justify-between text-white font-semibold text-lg mt-4">
              <span>Total</span>
              <span>₹{order?.bills?.totalWithTax || 0}</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default OrderDetails;
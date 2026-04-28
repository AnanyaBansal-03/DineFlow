import React from "react";
import { FaTrash, FaLeaf, FaDrumstickBite, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addItemToOrder, decreaseItemFromOrder } from "../../https";

const CartInfo = ({ order }) => {
  const queryClient = useQueryClient();
  const orderId = order?._id;

  const addItemMutation = useMutation({
    mutationFn: ({ orderId, item }) => addItemToOrder(orderId, item),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
    },
  });

  const decreaseItemMutation = useMutation({
    mutationFn: ({ orderId, itemName }) => decreaseItemFromOrder(orderId, itemName),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
    },
  });

  const items = order?.items || [];

  // Improved veg/non-veg detection
  const getItemType = (item) => {
    const category = item.category || "";
    const lowerCategory = category.toLowerCase();
    const isNonVeg = lowerCategory.includes("non-veg") ||
                     lowerCategory.includes("chicken") ||
                     lowerCategory.includes("mutton") ||
                     lowerCategory.includes("fish") ||
                     lowerCategory.includes("egg");
    return isNonVeg ? "non-veg" : "veg";
  };

  const handleIncrease = (item) => {
    if (!orderId) return;
    addItemMutation.mutate({ orderId, item });
  };

  const handleDecrease = (item) => {
    if (!orderId || !item.name) return;
    decreaseItemMutation.mutate({ orderId, itemName: item.name });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg">Current Order</h3>
        <span className="text-xs text-gray-400 bg-[#262626] px-2 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 text-sm">No items added yet</p>
          <p className="text-gray-600 text-xs mt-1">Select items from the menu</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {items.map((item, index) => {
            const itemType = getItemType(item);
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            const isNonVeg = itemType === "non-veg";
            
            return (
              <div key={index} className="bg-[#262626] rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {/* 🔴🟢 VISIBLE VEG/NON-VEG DOT */}
                      <div
                        className={`w-3 h-3 rounded-full shadow-sm ${
                          isNonVeg ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      <p className="text-white font-medium text-sm">{item.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-xs">
                        ₹{item.price} each
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isNonVeg 
                          ? "bg-red-500/15 text-red-400" 
                          : "bg-green-500/15 text-green-400"
                      }`}>
                        {isNonVeg ? "Non-Veg" : "Veg"}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={decreaseItemMutation.isPending}
                        className="text-gray-400 hover:text-yellow-400 transition disabled:opacity-50"
                        title="Decrease quantity"
                      >
                        <FaMinusCircle size={16} />
                      </button>
                      <span className="text-white text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={addItemMutation.isPending}
                        className="text-gray-400 hover:text-yellow-400 transition disabled:opacity-50"
                        title="Increase quantity"
                      >
                        <FaPlusCircle size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <p className="text-yellow-400 font-semibold text-sm">
                      ₹{itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CartInfo;
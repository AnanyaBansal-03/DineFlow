import React from "react";
import { FaTrash, FaLeaf, FaDrumstickBite, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addItemToOrder, decreaseItemFromOrder } from "../../https";

const CartInfo = ({ order }) => {
  const queryClient = useQueryClient();
  const orderId = order?._id;

  // Mutation to add/increase item quantity
  const addItemMutation = useMutation({
    mutationFn: ({ orderId, item }) => addItemToOrder(orderId, item),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
    },
    onError: (error) => {
      console.error("Failed to add item:", error);
    },
  });

  // Mutation to decrease item quantity (or remove if quantity becomes 0)
  const decreaseItemMutation = useMutation({
    mutationFn: ({ orderId, itemName }) => decreaseItemFromOrder(orderId, itemName),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
    },
    onError: (error) => {
      console.error("Failed to decrease item:", error);
    },
  });

  const items = order?.items || [];

  // Function to determine if item is veg or non-veg based on category
  const getItemType = (item) => {
    if (item.category) {
      return item.category?.toLowerCase().includes("non-veg") ? "non-veg" : "veg";
    }
    return "veg"; // default
  };

  // Handle increase quantity
  const handleIncrease = (item) => {
    if (!orderId) return;
    addItemMutation.mutate({ orderId, item });
  };

  // Handle decrease quantity
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
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600">
          {items.map((item, index) => {
            const itemType = getItemType(item);
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            
            return (
              <div key={index} className="bg-[#262626] rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        itemType === "veg" ? "bg-green-500" : "bg-red-500"
                      }`} />
                      <p className="text-white font-medium text-sm">{item.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-xs">
                        ₹{item.price} each
                      </span>
                      {item.category && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          itemType === "veg" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {itemType === "veg" ? "Veg" : "Non-Veg"}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls - FIXED */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
  onClick={() => handleDecrease(item)}
  disabled={decreaseItemMutation.isPending}
  className="text-black hover:text-yellow-400 transition disabled:opacity-50"
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
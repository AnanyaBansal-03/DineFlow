import React, { useState } from "react";
import { menus } from "../../constants";
import { GrRadialSelected } from "react-icons/gr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addItemToOrder } from "../../https";
import { FaLeaf, FaDrumstickBite } from "react-icons/fa";

const MenuContainer = ({ orderId }) => {
  const [selected, setSelected] = useState(menus[0]);
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: (item) => addItemToOrder(orderId, { item }),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
    },
  });

  // Function to determine if item is veg or non-veg based on category
  const getItemType = (category) => {
    if (!category) return "veg";
    return category?.toLowerCase().includes("non-veg") ? "non-veg" : "veg";
  };

  // Get display category name
  const getDisplayCategory = (category) => {
    if (!category) return "Veg";
    return category;
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      {/* Category Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setSelected(menu)}
            className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:outline-none active:outline-none ${
              selected.id === menu.id
                ? "bg-yellow-400 text-black"
                : "bg-[#262626] text-gray-300 hover:bg-[#2f2f2f] hover:text-white border border-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{menu.icon}</span>
              <span className="truncate">{menu.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {selected.items.map((item) => {
          const itemType = getItemType(item.category);
          
          return (
            <div
              key={item.id}
              className="bg-[#262626] rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all duration-200 overflow-hidden"
            >
              {/* Item Image (if available) */}
              {item.image && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Item Header with Type Indicator */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-base">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${
                    itemType === "veg" 
                      ? "bg-green-500/20 text-green-500 border border-green-500/30" 
                      : "bg-red-500/20 text-red-500 border border-red-500/30"
                  }`}>
                    {itemType === "veg" ? <FaLeaf size={10} /> : <FaDrumstickBite size={10} />}
                    {getDisplayCategory(item.category)}
                  </span>
                </div>

                {/* Item Price */}
                <div className="mt-3">
                  <p className="text-yellow-400 font-bold text-lg">₹{item.price}</p>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => addItemMutation.mutate(item)}
                  disabled={addItemMutation.isPending}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {addItemMutation.isPending ? "Adding..." : "Add to Order"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {selected.items.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No items in this category</p>
        </div>
      )}
    </div>
  );
};

export default MenuContainer;
import React from "react";
import { menus } from "../../constants";
import { FaLeaf, FaDrumstickBite } from "react-icons/fa";

const isNonVeg = (category = "") => {
  const lowerCategory = category.toLowerCase();
  return (
    lowerCategory.includes("non-veg") ||
    lowerCategory.includes("chicken") ||
    lowerCategory.includes("mutton") ||
    lowerCategory.includes("fish") ||
    lowerCategory.includes("prawn") ||
    lowerCategory.includes("egg") ||
    lowerCategory.includes("lamb") ||
    lowerCategory.includes("beef")
  );
};

const getAllItems = () =>
  menus.flatMap((menu) =>
    menu.items.map((item) => ({ ...item, _menuName: menu.name }))
  );

const MenuContainer = ({ selectedCategory = "all", showAddButton = false, onAddItem }) => {
  const displayItems =
    selectedCategory === "all"
      ? getAllItems()
      : menus.find((m) => m.name === selectedCategory)?.items ?? [];

  return (
    <div className="px-4 sm:px-6 py-5">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-yellow-400 rounded-full" />
        <span className="text-white font-semibold text-base">
          {selectedCategory === "all" ? "All Items" : selectedCategory}
        </span>
        <span className="text-white text-xs">
          ({displayItems.length} {displayItems.length === 1 ? "item" : "items"})
        </span>
      </div>

      {/* Menu Items Grid */}
      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <span className="text-4xl">🍽</span>
          <p className="text-gray-500 text-sm">No items in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayItems.map((item, idx) => {
            const nonVeg = isNonVeg(item.category || item._menuName || "");
            
            return (
              <div
                key={`${item.id ?? item.name}-${idx}`}
                className={`relative bg-[#1e1e1e] rounded-xl border transition-all duration-200 overflow-hidden hover:shadow-md ${
                  nonVeg 
                    ? "border-red-800/50 hover:border-red-500/50" 
                    : "border-green-800/50 hover:border-green-500/50"
                }`}
              >
                <div className={`h-1 w-full ${nonVeg ? "bg-red-500" : "bg-green-500"}`} />

                {item.image && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          nonVeg ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      <h3 className="text-white font-semibold text-sm leading-tight truncate">
                        {item.name}
                      </h3>
                    </div>

                    <span
                      className={`flex-shrink-0 flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                        nonVeg 
                          ? "bg-red-500/15 text-red-400 border-red-500/30" 
                          : "bg-green-500/15 text-green-400 border-green-500/30"
                      }`}
                    >
                      {nonVeg ? <FaDrumstickBite size={8} /> : <FaLeaf size={8} />}
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs mb-2 ml-4 truncate">
                    {item.category || item._menuName}
                  </p>

                  <div className="flex items-center justify-between ml-4">
                    <span className="text-yellow-400 font-bold text-sm">
                      ₹{item.price}
                    </span>
                    
                    {showAddButton && onAddItem && (
                      <button
                        onClick={() => onAddItem(item)}
                        className={`flex items-center gap-1 text-white text-xs font-medium
                                    px-2.5 py-1 rounded-lg transition-all duration-150
                                    ${nonVeg ? "bg-red-700 hover:bg-red-600" : "bg-green-700 hover:bg-green-600"}`}
                      >
                        Add
                      </button>
                    )}
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

export default MenuContainer;
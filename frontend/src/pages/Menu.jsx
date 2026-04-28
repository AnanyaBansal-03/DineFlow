import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import MenuContainer from "../components/menu/MenuContainer";
import { menus } from "../constants";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    document.title = "DineFlow | Menu";
  }, []);

  const categories = menus.map(menu => menu.name);

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      
      {/* Header - Fixed at top */}
      <div className="bg-[#1E1E1E] border-b border-gray-800 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BackButton />
            <h1 className="text-xl font-bold text-white">
              <span className="text-yellow-400">Menu</span>
            </h1>
          </div>
          
          <div className="text-gray-400 text-sm bg-[#262626] px-3 py-1.5 rounded-lg">
            Browse our menu
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-[#1A1A1A] border-b border-gray-800 px-4 sm:px-6 py-2 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-yellow-400 text-black"
                : "bg-[#262626] text-black hover:bg-[#2f2f2f]"
            }`}
          >
            📋 All Items
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-yellow-400 text-black"
                  : "bg-[#262626] text-black hover:bg-[#2f2f2f]"
              }`}
            >
              {category === "Starters" && "🍲 "}
              {category === "Main Course" && "🍛 "}
              {category === "Beverages" && "🍹 "}
              {category === "Soups" && "🍜 "}
              {category === "Desserts" && "🍰 "}
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Added bottom padding to prevent BottomNav overlap */}
      <div className="flex-1 overflow-y-auto">
        <div className="pb-32">
          <MenuContainer 
            selectedCategory={selectedCategory}
            showAddButton={false}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Menu;
import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../https";

const Menu = () => {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
  });

  useEffect(() => {
    document.title = "DineFlow | Menu";
  }, []);

  const order = data?.data?.data;

  if (isLoading) {
    return (
      <div className="h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-gray-400">Loading Order...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b border-gray-800 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-white">
              <span className="text-yellow-400">Menu</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-[#262626] px-4 py-2 rounded-lg">
            <MdRestaurantMenu className="text-yellow-400 text-2xl" />
            <div>
              <h1 className="text-white font-semibold text-sm">
                {order?.customerDetails?.name || "Customer"}
              </h1>
              <p className="text-gray-400 text-xs">
                Table {order?.table?.tableNo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Section - Menu Items (Scrollable) */}
        <div className="lg:flex-[3] overflow-y-auto min-h-0">
          <MenuContainer orderId={id} />
        </div>

        {/* Right Section - Cart & Bill (Fixed) */}
        <div className="lg:flex-[1] bg-[#1A1A1A] border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <CartInfo order={order} />
          </div>
          <div className="border-t border-gray-800 p-4">
            <Bill order={order} />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Menu;
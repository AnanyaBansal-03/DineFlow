import React from "react";
import { getAvatarName, getBgColor } from "../../utils";
import { FaLongArrowAltRight, FaChair } from "react-icons/fa";

const TableCard = ({ id, name, status, seats, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#262626] rounded-xl border border-gray-700 hover:border-yellow-400/50 hover:bg-[#2c2c2c] transition-all duration-200 overflow-hidden cursor-pointer h-full"
    >
      <div className="p-4 flex flex-col h-full">
        {/* Header with Table Number and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">Table</span>
            <FaLongArrowAltRight className="text-gray-500 text-xs" />
            <span className="text-white font-bold text-lg">{name}</span>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "Booked"
                ? "bg-green-500/20 text-green-500 border border-green-500/30"
                : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Avatar/Circle in center - FIXED: Use table number directly, not getAvatarName */}
        <div className="flex items-center justify-center my-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{
              backgroundColor: status === "Booked" ? "#2e4a40" : "#4a3e2e",
              border: `2px solid ${status === "Booked" ? "#4ade80" : "#fbbf24"}`,
            }}
          >
            {/* Simply show the table number or first character */}
            {String(name).charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Seats Info */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-gray-400">
            <FaChair className="text-sm" />
            <span className="text-xs">Seats</span>
          </div>
          <span className="text-white font-semibold">{seats}</span>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
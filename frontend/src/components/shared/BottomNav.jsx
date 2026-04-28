import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setName("");
    setPhone("");
    setGuestCount(0);
  };

  const increment = () => {
    if(guestCount >= 6) return;
    setGuestCount((prev) => prev + 1);
  };
  
  const decrement = () => {
    if(guestCount <= 0) return;
    setGuestCount((prev) => prev - 1);
  };

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    if (!name || !phone || guestCount === 0) {
      // You can add a toast notification here
      return;
    }
    dispatch(setCustomer({ name, phone, guests: guestCount }));
    closeModal();
    navigate("/tables");
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-screen bg-[#1E1E1E] border-t border-gray-800 px-4 py-2 h-20 flex items-center justify-between">
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center justify-center font-medium w-16 ${
            isActive("/") ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"
          }`}
        >
          <FaHome size={22} />
          <span className="text-xs mt-1">Home</span>
        </button>

        {/* Orders Button */}
        <button
          onClick={() => navigate("/orders")}
          className={`flex flex-col items-center justify-center font-medium w-16 ${
            isActive("/orders") ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"
          }`}
        >
          <MdOutlineReorder size={22} />
          <span className="text-xs mt-1">Orders</span>
        </button>

        {/* Center Create Order Button */}
        <div className="relative w-16 flex justify-center">
          <button
            disabled={isActive("/tables") || isActive("/menu")}
            onClick={openModal}
            className="absolute bottom-[-18px] bg-yellow-400 text-black rounded-full p-3 shadow-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiSolidDish size={28} />
          </button>
        </div>

        {/* Tables Button */}
        <button
          onClick={() => navigate("/tables")}
          className={`flex flex-col items-center justify-center font-medium w-16 ${
            isActive("/tables") ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"
          }`}
        >
          <MdTableBar size={22} />
          <span className="text-xs mt-1">Tables</span>
        </button>

        {/* More Button */}
        <button
          onClick={() => navigate("/menu")}
          className={`flex flex-col items-center justify-center font-medium w-16 ${
            isActive("/menu") ? "text-yellow-400" : "text-gray-500 hover:text-yellow-400"
          }`}
        >
          <CiCircleMore size={22} />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Order">
        <div className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Customer Name
            </label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f] border border-gray-700">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter customer name"
                className="bg-transparent flex-1 text-white focus:outline-none placeholder-gray-500"
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Customer Phone
            </label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f] border border-gray-700">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+91-9999999999"
                className="bg-transparent flex-1 text-white focus:outline-none placeholder-gray-500"
              />
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Number of Guests
            </label>
            <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg border border-gray-700">
              <button
                onClick={decrement}
                className="text-yellow-400 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-full transition-colors"
              >
                −
              </button>
              <span className="text-white font-medium">{guestCount} {guestCount === 1 ? 'Person' : 'Persons'}</span>
              <button
                onClick={increment}
                className="text-yellow-400 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-full transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Create Order Button */}
          <button
            onClick={handleCreateOrder}
            disabled={!name || !phone || guestCount === 0}
            className="w-full bg-yellow-400 text-black font-bold rounded-lg py-3 mt-6 hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Order
          </button>
        </div>
      </Modal>
    </>
  );
};

export default BottomNav;
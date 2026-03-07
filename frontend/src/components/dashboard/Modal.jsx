import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTable } from "../../https";
import { enqueueSnackbar } from "notistack";

const Modal = ({ isOpen, onClose, type }) => {
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  const queryClient = useQueryClient();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    tableMutation.mutate(tableData);
  };

  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: (res) => {
      onClose();
      enqueueSnackbar("Table added successfully!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      setTableData({ tableNo: "", seats: "" });
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to add table";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-[#1E1E1E] rounded-xl w-full max-w-md border border-gray-700"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-white text-xl font-semibold">
            Add New Table
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Table Number
            </label>
            <input
              type="text"
              name="tableNo"
              value={tableData.tableNo}
              onChange={handleInputChange}
              placeholder="e.g. 5, 6, A1"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Number of Seats
            </label>
            <input
              type="number"
              name="seats"
              value={tableData.seats}
              onChange={handleInputChange}
              placeholder="e.g. 2, 4, 6"
              min="1"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={tableMutation.isPending}
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 mt-4"
          >
            {tableMutation.isPending ? "Adding..." : "Add Table"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
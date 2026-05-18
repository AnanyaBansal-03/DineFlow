import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTable } from "../../https";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

const Modal = ({ isOpen, onClose, type }) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // State for Table
  const [tableData, setTableData] = useState({
    tableNo: "",
    seats: "",
  });

  // State for Category
  const [categoryData, setCategoryData] = useState({
    name: "",
    description: "",
  });

  // State for Dishes
  const [dishData, setDishData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    isAvailable: true,
  });

  const handleTableChange = (e) => {
    const { name, value } = e.target;
    setTableData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDishChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDishData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  // Add Table Mutation
  const tableMutation = useMutation({
    mutationFn: (reqData) => addTable(reqData),
    onSuccess: () => {
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

  // Add Category Mutation
  const categoryMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("https://dineflow-e802.onrender.com/api/category", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      onClose();
      enqueueSnackbar("Category added successfully!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["menu"]);
      setCategoryData({ name: "", description: "" });
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to add category";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  // Add Dish Mutation
  const dishMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("https://dineflow-e802.onrender.com/api/menu", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      onClose();
      enqueueSnackbar("Dish added successfully!", { variant: "success" });
      queryClient.invalidateQueries(["menu"]);
      setDishData({
        name: "",
        price: "",
        category: "",
        description: "",
        isAvailable: true,
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to add dish";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (type === "table") {
      if (!tableData.tableNo || !tableData.seats) {
        enqueueSnackbar("Please fill all fields!", { variant: "warning" });
        return;
      }
      tableMutation.mutate(tableData);
    } else if (type === "category") {
      if (!categoryData.name) {
        enqueueSnackbar("Please enter category name!", { variant: "warning" });
        return;
      }
      categoryMutation.mutate(categoryData);
    } else if (type === "dishes") {
      if (!dishData.name || !dishData.price || !dishData.category) {
        enqueueSnackbar("Please fill all required fields!", { variant: "warning" });
        return;
      }
      dishMutation.mutate(dishData);
    }
  };

  if (!isOpen) return null;

  // Render different forms based on type
  const renderForm = () => {
    if (type === "table") {
      return (
        <>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Table Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tableNo"
              value={tableData.tableNo}
              onChange={handleTableChange}
              placeholder="e.g., 1, 2, A1, VIP"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Number of Seats <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="seats"
              value={tableData.seats}
              onChange={handleTableChange}
              placeholder="e.g., 2, 4, 6"
              min="1"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>
        </>
      );
    }

    if (type === "category") {
      return (
        <>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={categoryData.name}
              onChange={handleCategoryChange}
              placeholder="e.g., Starters, Main Course, Desserts"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={categoryData.description}
              onChange={handleCategoryChange}
              placeholder="Brief description of the category"
              rows="3"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition resize-none"
            />
          </div>
        </>
      );
    }

    if (type === "dishes") {
      return (
        <>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Dish Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={dishData.name}
              onChange={handleDishChange}
              placeholder="e.g., Butter Chicken, Paneer Tikka"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={dishData.price}
              onChange={handleDishChange}
              placeholder="e.g., 250"
              min="0"
              step="1"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={dishData.category}
              onChange={handleDishChange}
              placeholder="e.g., Starters, Main Course, Desserts"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={dishData.description}
              onChange={handleDishChange}
              placeholder="Brief description of the dish"
              rows="2"
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isAvailable"
              checked={dishData.isAvailable}
              onChange={handleDishChange}
              className="w-4 h-4 accent-yellow-400"
            />
            <label className="text-gray-400 text-sm">
              Available for ordering
            </label>
          </div>
        </>
      );
    }

    return null;
  };

  const getTitle = () => {
    if (type === "table") return "Add New Table";
    if (type === "category") return "Add New Category";
    if (type === "dishes") return "Add New Dish";
    return "Add";
  };

  const getButtonText = () => {
    if (tableMutation.isPending || categoryMutation.isPending || dishMutation.isPending) return "Adding...";
    if (type === "table") return "Add Table";
    if (type === "category") return "Add Category";
    if (type === "dishes") return "Add Dish";
    return "Add";
  };

  const isPending = tableMutation.isPending || categoryMutation.isPending || dishMutation.isPending;

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
            {getTitle()}
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
          {renderForm()}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 mt-4"
          >
            {getButtonText()}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
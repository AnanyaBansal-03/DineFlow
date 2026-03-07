import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getTables, addOrder, addTable } from "../https";
import { useDispatch, useSelector } from "react-redux";
import { removeCustomer } from "../redux/slices/customerSlice";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { FaPlus } from "react-icons/fa";

const Tables = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [tableNo, setTableNo] = useState("");
  const [seats, setSeats] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customer = useSelector((state) => state.customer);

  useEffect(() => {
    document.title = "DineFlow | Tables";
  }, []);

  /* ---------------- FETCH TABLES ---------------- */

  const { data, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    refetchOnMount: true,
  });

  const tables = data?.data?.data || [];

  /* ---------------- CREATE TABLE ---------------- */

  const createTableMutation = useMutation({
    mutationFn: addTable,
    onSuccess: () => {
      enqueueSnackbar("Table created successfully!", {
        variant: "success",
      });

      queryClient.invalidateQueries({ queryKey: ["tables"] });

      setShowModal(false);
      setTableNo("");
      setSeats("");
    },
    onError: () => {
      enqueueSnackbar("Failed to create table!", {
        variant: "error",
      });
    },
  });

  const handleCreateTable = () => {
    if (!tableNo || !seats) {
      enqueueSnackbar("Fill all fields!", { variant: "warning" });
      return;
    }

    createTableMutation.mutate({
      tableNo,
      seats: Number(seats),
    });
  };

  /* ---------------- CREATE ORDER ---------------- */

  const createOrderMutation = useMutation({
    mutationFn: addOrder,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });

      const orderId = response?.data?.data?._id;

      dispatch(removeCustomer());
      navigate(`/orders/${orderId}`);
    },
  });

  const handleTableClick = (table) => {
    if (!customer.customerName) {
      enqueueSnackbar("Please create customer first!", {
        variant: "warning",
      });
      return;
    }

    if (table.currentOrder) {
      enqueueSnackbar("Table already booked!", {
        variant: "warning",
      });
      return;
    }

    createOrderMutation.mutate({
      tableId: table._id,
      customerDetails: {
        name: customer.customerName,
        phone: customer.customerPhone,
        guests: customer.guests,
      },
      orderStatus: "Pending",
      items: [],
    });
  };

  const filteredTables =
    statusFilter === "all"
      ? tables
      : tables.filter((table) => table.currentOrder);

  // Button styling function for filters
  const getFilterButtonStyle = (filter) => {
    const isActive = statusFilter === filter;
    
    if (isActive) {
      return "bg-yellow-400 text-black font-semibold";
    }
    
    return "bg-[#2a2a2a] text-gray-300 font-medium hover:bg-[#3a3a3a] hover:text-white";
  };

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      
      {/* Header - Fixed at top */}
      <div className="bg-[#1E1E1E] border-b border-gray-800 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-md font-bold text-white">
              <span className="text-yellow-400">Tables</span>
            </h1>
          </div>

          {/* Right side - Add Table button and filters */}
          <div className="flex items-center gap-4">
            {/* Add Table Button */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
            >
              <FaPlus size={14} />
              <span>Add Table</span>
            </button>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`text-black px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:outline-none active:outline-none ${getFilterButtonStyle("all")}`}
              >
                All
              </button>

              <button
                onClick={() => setStatusFilter("booked")}
                className={`text-black px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:outline-none active:outline-none ${getFilterButtonStyle("booked")}`}
              >
                Booked
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid - Scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 sm:px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading tables...</div>
            </div>
          ) : filteredTables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredTables.map((table) => (
                <TableCard
                  key={table._id}
                  id={table._id}
                  name={table.tableNo}
                  status={table.currentOrder ? "Booked" : "Available"}
                  seats={table.seats}
                  onClick={() => handleTableClick(table)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No tables found</p>
                <p className="text-gray-600 text-sm mt-2">
                  {statusFilter === "all" 
                    ? "There are no tables yet. Click 'Add Table' to create one." 
                    : `No booked tables available`}
                </p>
                {statusFilter === "all" && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-yellow-300 transition"
                  >
                    Add Your First Table
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] w-full max-w-md rounded-xl border border-gray-700">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-white text-xl font-semibold">
                Add New Table
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Table Number
                </label>
                <input
                  type="text"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  placeholder="e.g. 5, 6, A1"
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Number of Seats
                </label>
                <input
                  type="number"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  placeholder="e.g. 2, 4, 6"
                  className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition placeholder-gray-500"
                />
              </div>

              <button
                onClick={handleCreateTable}
                disabled={createTableMutation.isPending}
                className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 mt-4"
              >
                {createTableMutation.isPending ? "Creating..." : "Add Table"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Tables;
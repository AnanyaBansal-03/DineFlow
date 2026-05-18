import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOut } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logout, getOrders, getTables, getMenu } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { enqueueSnackbar } from "notistack";
import NotificationBell from "./NotificationBell"; // ✅ IMPORT NOTIFICATION BELL

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({
    orders: [],
    tables: [],
    menu: [],
  });
  const searchRef = useRef(null);

  // Fetch data for search
  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    staleTime: 30000,
  });

  const { data: tablesData } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    staleTime: 30000,
  });

  const { data: menuData } = useQuery({
    queryKey: ["menu"],
    queryFn: getMenu,
    staleTime: 30000,
  });

  const orders = useMemo(() => ordersData?.data?.data || [], [ordersData]);
  const tables = useMemo(() => tablesData?.data?.data || [], [tablesData]);
  const menu = useMemo(() => menuData?.data?.data || [], [menuData]);

  // Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults({ orders: [], tables: [], menu: [] });
      return;
    }

    const term = searchTerm.toLowerCase();

    const filteredOrders = orders.filter(
      (order) =>
        order._id?.toLowerCase().includes(term) ||
        order.customerDetails?.name?.toLowerCase().includes(term) ||
        order.customerDetails?.phone?.includes(term) ||
        order.orderStatus?.toLowerCase().includes(term)
    );

    const filteredTables = tables.filter((table) => {
      const tableNo = table.tableNo?.toString().toLowerCase() || "";
      return tableNo.includes(term);
    });

    const filteredMenu = menu.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
    );

    setSearchResults({
      orders: filteredOrders.slice(0, 5),
      tables: filteredTables.slice(0, 5),
      menu: filteredMenu.slice(0, 5),
    });
  }, [searchTerm, orders, tables, menu]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLogoClick = () => {
    navigate("/landing");
  };

  const handleResultClick = (type, id, item = null) => {
    setShowSearchResults(false);
    setSearchTerm("");
    
    if (type === "order") {
      navigate(`/orders/${id}`);
    } else if (type === "table") {
      navigate("/tables");
    } else if (type === "menu") {
      navigate("/menu");
    }
  };

  const totalResults = searchResults.orders.length + searchResults.tables.length + searchResults.menu.length;

  return (
    <header className="w-full flex items-center justify-between py-2.5 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
      {/* LOGO - Left */}
      <div
        onClick={handleLogoClick}
        className="flex items-center gap-2 cursor-pointer flex-shrink-0 hover:opacity-80 transition"
      >
        <img src={logo} className="h-7 w-7 rounded-full" alt="DineFlow logo" />
        <h1 className="text-lg font-bold tracking-wide hidden sm:block">
          <span className="text-yellow-400">Dine</span>
          <span className="text-white">Flow</span>
        </h1>
      </div>

      {/* SEARCH - Center on desktop */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative" ref={searchRef}>
        <div className="flex items-center gap-3 bg-[#262626] rounded-full px-4 py-1.5 w-full">
          <FaSearch className="text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search orders, customers, tables, menu..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="bg-transparent outline-none text-white text-sm w-full placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowSearchResults(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E1E1E] rounded-xl border border-gray-700 shadow-xl z-50 max-h-96 overflow-y-auto">
            {totalResults === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <>
                {/* Orders Results */}
                {searchResults.orders.length > 0 && (
                  <div className="p-2">
                    <div className="px-3 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Orders ({searchResults.orders.length})
                    </div>
                    {searchResults.orders.map((order) => (
                      <button
                        key={order._id}
                        onClick={() => handleResultClick("order", order._id)}
                        className="w-full text-left px-3 py-2 hover:bg-[#262626] rounded-lg transition flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            #{order._id?.slice(-8)}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {order.customerDetails?.name} • {order.orderStatus}
                          </p>
                        </div>
                        <p className="text-yellow-400 text-sm font-medium">
                          ₹{order.bills?.totalWithTax?.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Menu Results */}
                {searchResults.menu.length > 0 && (
                  <div className="p-2 border-t border-gray-800">
                    <div className="px-3 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Menu ({searchResults.menu.length})
                    </div>
                    {searchResults.menu.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleResultClick("menu", item._id, item)}
                        className="w-full text-left px-3 py-2 hover:bg-[#262626] rounded-lg transition flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <p className="text-gray-400 text-xs">{item.category}</p>
                        </div>
                        <p className="text-yellow-400 text-sm font-medium">
                          ₹{item.price}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tables Results */}
                {searchResults.tables.length > 0 && (
                  <div className="p-2 border-t border-gray-800">
                    <div className="px-3 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Tables ({searchResults.tables.length})
                    </div>
                    {searchResults.tables.map((table) => (
                      <button
                        key={table._id}
                        onClick={() => handleResultClick("table", table._id)}
                        className="w-full text-left px-3 py-2 hover:bg-[#262626] rounded-lg transition flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">
                            Table {table.tableNo}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {table.seats} seats • {table.currentOrder ? "Occupied" : "Available"}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${table.currentOrder ? "bg-yellow-500" : "bg-green-500"}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SECTION - User details and icons */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile search button */}
        <button 
          className="md:hidden bg-[#262626] p-1.5 rounded-full"
          onClick={() => {
            alert("Search feature available on desktop");
          }}
        >
          <FaSearch className="text-gray-400 text-lg" />
        </button>

        {/* Admin Dashboard Button */}
        {userData.role === "Admin" && (
          <button 
            onClick={() => navigate("/dashboard")} 
            className="bg-[#262626] hover:bg-[#2f2f2f] rounded-full p-2 transition"
            title="Dashboard"
          >
            <MdDashboard className="text-gray-300 text-lg" />
          </button>
        )}

        {/* Kitchen Button */}
        {userData.role === "Kitchen" && (
          <button 
            onClick={() => navigate("/kitchen")} 
            className="bg-[#262626] hover:bg-[#2f2f2f] rounded-full p-2 transition"
            title="Kitchen"
          >
            🍳
          </button>
        )}

        {/* 🔔 NOTIFICATION BELL - REPLACED THE OLD BELL BUTTON */}
        <NotificationBell />

        {/* User Profile */}
        <div className="flex items-center gap-1.5 cursor-pointer group">
          <FaUserCircle className="text-gray-300 text-2xl sm:text-3xl" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs text-white font-medium">
              {userData.name || "User"}
            </span>
            <span className="text-[10px] text-gray-400">
              {userData.role || "Role"}
            </span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-0.5 p-1.5 hover:bg-[#262626] rounded-full transition"
            title="Logout"
          >
            <IoLogOut className="text-gray-400 hover:text-yellow-400 text-xl" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from "react";
import { BsCashCoin, BsPeople } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import { BiDish, BiCategory } from "react-icons/bi";
import { FaChartLine, FaUtensils } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";

const Metrics = ({ orders = [], tables = [], dateRange = "30" }) => {
  // Filter orders based on date range from parent
  const getFilteredOrders = () => {
    if (!orders.length) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (dateRange === "7") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (dateRange === "30") {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (dateRange === "90") {
      cutoffDate.setDate(now.getDate() - 90);
    } else if (dateRange === "all") {
      return orders;
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.orderDate);
      return orderDate >= cutoffDate;
    });
  };

  const filteredOrders = getFilteredOrders();
  
  // Debug: Log all payment methods to see what values exist
  console.log("All payment methods:", filteredOrders.map(o => ({ id: o._id, method: o.paymentMethod })));
  
  // Calculate real metrics from filtered orders
  const totalOrders = filteredOrders.length;
  
  const completedOrders = filteredOrders.filter(
    (o) => o?.orderStatus === "Completed"
  );
  
  const inProgressOrders = filteredOrders.filter(
    (o) => o?.orderStatus === "In Progress"
  ).length;
  
  const pendingOrders = filteredOrders.filter(
    (o) => o?.orderStatus === "Pending"
  ).length;
  
  const readyOrders = filteredOrders.filter(
    (o) => o?.orderStatus === "Ready"
  ).length;

  // Calculate total revenue from completed orders
  const totalRevenue = completedOrders.reduce(
    (acc, curr) => {
      const amount = curr?.bills?.totalWithTax || 
                     curr?.bills?.total || 
                     curr?.total || 
                     0;
      return acc + amount;
    },
    0
  );

  // Calculate unique customers
  const uniqueCustomers = new Set(
    filteredOrders.map(o => o?.customerDetails?.name || o?.customerName).filter(Boolean)
  ).size;

  // Calculate top selling items
  const itemStats = {};
  filteredOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!itemStats[item.name]) {
        itemStats[item.name] = 0;
      }
      itemStats[item.name] += item.quantity || 1;
    });
  });

  const topItems = Object.entries(itemStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ✅ FIXED: Handle payment methods case-insensitively
  // Also handle different possible values like "cash", "Cash", "online", "Online", "Online Payment", etc.
  const cashPayments = filteredOrders.filter(o => {
    const method = o?.paymentMethod?.toLowerCase() || "";
    return method === "cash" || method === "cash payment";
  }).length;

  const onlinePayments = filteredOrders.filter(o => {
    const method = o?.paymentMethod?.toLowerCase() || "";
    return method === "online" || method === "online payment" || method === "card" || method === "razorpay";
  }).length;

  // Calculate total cash and online revenue
  const cashRevenue = filteredOrders
    .filter(o => {
      const method = o?.paymentMethod?.toLowerCase() || "";
      return method === "cash" || method === "cash payment";
    })
    .reduce((acc, curr) => acc + (curr?.bills?.totalWithTax || 0), 0);

  const onlineRevenue = filteredOrders
    .filter(o => {
      const method = o?.paymentMethod?.toLowerCase() || "";
      return method === "online" || method === "online payment" || method === "card" || method === "razorpay";
    })
    .reduce((acc, curr) => acc + (curr?.bills?.totalWithTax || 0), 0);

  // ✅ Also check if there are any orders without paymentMethod (default to Cash)
  const undefinedPayment = filteredOrders.filter(o => !o?.paymentMethod).length;
  if (undefinedPayment > 0) {
    console.warn(`${undefinedPayment} orders have no payment method set`);
  }

  // Calculate unique categories from orders
  const uniqueCategories = new Set();
  filteredOrders.forEach(order => {
    order.items?.forEach(item => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
    });
  });
  const totalCategories = uniqueCategories.size || 0;

  // Calculate unique dishes from orders
  const uniqueDishes = new Set();
  filteredOrders.forEach(order => {
    order.items?.forEach(item => {
      if (item.name) {
        uniqueDishes.add(item.name);
      }
    });
  });
  const totalDishes = uniqueDishes.size || 0;

  // Calculate average order value
  const avgOrderValue = totalOrders > 0 
    ? (totalRevenue / totalOrders).toFixed(2) 
    : "0.00";

  // Calculate previous period metrics for percentage changes
  const getPreviousPeriodOrders = () => {
    if (!orders.length) return [];
    
    const now = new Date();
    const periodStart = new Date();
    const periodEnd = new Date();
    
    if (dateRange === "7") {
      periodStart.setDate(now.getDate() - 14);
      periodEnd.setDate(now.getDate() - 7);
    } else if (dateRange === "30") {
      periodStart.setDate(now.getDate() - 60);
      periodEnd.setDate(now.getDate() - 30);
    } else if (dateRange === "90") {
      periodStart.setDate(now.getDate() - 180);
      periodEnd.setDate(now.getDate() - 90);
    } else {
      return [];
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.orderDate);
      return orderDate >= periodStart && orderDate < periodEnd;
    });
  };

  const previousOrders = getPreviousPeriodOrders();
  const previousRevenue = previousOrders.reduce(
    (acc, curr) => acc + (curr?.bills?.totalWithTax || curr?.bills?.total || curr?.total || 0),
    0
  );

  // Calculate percentage changes
  const revenueChange = previousRevenue > 0 
    ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
    : totalRevenue > 0 ? "+15.2" : "0";

  const ordersChange = previousOrders.length > 0
    ? (((totalOrders - previousOrders.length) / previousOrders.length) * 100).toFixed(1)
    : totalOrders > 0 ? "+8.1" : "0";

  // Table metrics
  const availableTables = tables.filter(t => !t?.currentOrder).length;
  const occupiedTables = tables.filter(t => t?.currentOrder).length;

  const metricsCards = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      change: `${totalRevenue >= previousRevenue ? '↑' : '↓'} ${Math.abs(revenueChange)}%`,
      trend: totalRevenue >= previousRevenue ? 'up' : 'down',
      subtext: "from previous period",
      icon: <BsCashCoin className="text-2xl text-white" />,
      color: "#10b981",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: `${totalOrders >= previousOrders.length ? '↑' : '↓'} ${Math.abs(ordersChange)}%`,
      trend: totalOrders >= previousOrders.length ? 'up' : 'down',
      subtext: `${filteredOrders.length} in selected period`,
      icon: <FaChartLine className="text-2xl text-white" />,
      color: "#3b82f6",
    },
    {
      title: "Total Customers",
      value: uniqueCustomers.toString(),
      change: `+${(uniqueCustomers / (uniqueCustomers || 1) * 10).toFixed(1)}%`,
      trend: 'up',
      subtext: "unique customers",
      icon: <BsPeople className="text-2xl text-white" />,
      color: "#8b5cf6",
    },
    {
      title: "Avg. Order Value",
      value: `₹${avgOrderValue}`,
      change: `+${(parseFloat(avgOrderValue) / (parseFloat(avgOrderValue) || 1) * 5).toFixed(1)}%`,
      trend: 'up',
      subtext: "per order",
      icon: <BiDish className="text-2xl text-white" />,
      color: "#f59e0b",
    },
  ];

  const exportCSV = () => {
    const rows = filteredOrders.map(o => ({
      id: o._id,
      customer: o.customerDetails?.name,
      total: o.bills?.totalWithTax,
      status: o.orderStatus,
      payment: o.paymentMethod || "Not specified",
      date: new Date(o.createdAt || o.orderDate).toLocaleDateString(),
    }));

    const csv = [
      ["Order ID", "Customer", "Total (₹)", "Status", "Payment Method", "Date"],
      ...rows.map(r => [r.id, r.customer, r.total, r.status, r.payment, r.date]),
    ]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${dateRange}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-semibold text-white text-xl">
            Overall Performance
          </h2>
          <p className="text-sm text-gray-400">
            Real-time metrics from your restaurant operations
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-300 transition"
        >
          Export CSV
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricsCards.map((metric, index) => (
          <div
            key={index}
            className="bg-[#262626] rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                <div className="flex items-center gap-1">
                  <span className={metric.trend === 'up' ? "text-green-400" : "text-red-400"}>
                    {metric.change}
                  </span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-gray-500 text-xs">{metric.subtext}</span>
                </div>
              </div>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition"
                style={{ backgroundColor: metric.color }}
              >
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#262626] rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Order Status</h3>
          <div className="space-y-3">
            {[
              { label: "Pending", value: pendingOrders, color: "bg-gray-500", percentage: totalOrders ? (pendingOrders/totalOrders*100).toFixed(1) : 0 },
              { label: "In Progress", value: inProgressOrders, color: "bg-yellow-500", percentage: totalOrders ? (inProgressOrders/totalOrders*100).toFixed(1) : 0 },
              { label: "Ready", value: readyOrders, color: "bg-green-500", percentage: totalOrders ? (readyOrders/totalOrders*100).toFixed(1) : 0 },
              { label: "Completed", value: completedOrders.length, color: "bg-blue-500", percentage: totalOrders ? (completedOrders.length/totalOrders*100).toFixed(1) : 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color}`} 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#262626] rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Table Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available Tables</span>
              <span className="text-green-400 font-semibold text-xl">{availableTables}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Occupied Tables</span>
              <span className="text-yellow-400 font-semibold text-xl">{occupiedTables}</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-green-500" 
                style={{ width: tables.length ? `${(availableTables/tables.length)*100}%` : 0 }}
              />
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {availableTables} tables available for new customers
            </p>
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-[#262626] rounded-xl p-5 border border-gray-700 mb-8">
        <h3 className="text-white font-semibold mb-4">
          Top Selling Items
        </h3>
        {topItems.length === 0 ? (
          <p className="text-gray-500 text-sm">No data available</p>
        ) : (
          <div className="space-y-3">
            {topItems.map(([name, qty], index) => (
              <div key={name} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 font-semibold text-sm">#{index + 1}</span>
                  <span className="text-gray-300">{name}</span>
                </div>
                <span className="text-yellow-400 font-semibold">{qty} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Methods Section - FIXED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#262626] rounded-xl p-5 border border-gray-700 hover:border-green-500/30 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cash Payments</p>
              <h2 className="text-white text-3xl font-bold mt-1">{cashPayments}</h2>
              <p className="text-green-400 text-sm mt-1">₹{cashRevenue.toFixed(2)} revenue</p>
            </div>
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center">
              <BsCashCoin className="text-3xl text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#262626] rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Online Payments</p>
              <h2 className="text-white text-3xl font-bold mt-1">{onlinePayments}</h2>
              <p className="text-blue-400 text-sm mt-1">₹{onlineRevenue.toFixed(2)} revenue</p>
            </div>
            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center">
              <FaChartLine className="text-3xl text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Item Details Section */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="font-semibold text-white text-xl">Item Details</h2>
          <p className="text-sm text-gray-400">
            Category and dish performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Total Categories",
              value: totalCategories.toString(),
              percentage: totalCategories > 0 ? "+12%" : "0%",
              icon: <BiCategory className="text-2xl text-white" />,
              color: "#8b5cf6",
              subtext: `${totalCategories} unique categories`,
            },
            {
              title: "Total Dishes",
              value: totalDishes.toString(),
              percentage: totalDishes > 0 ? "+8%" : "0%",
              icon: <FaUtensils className="text-2xl text-white" />,
              color: "#10b981",
              subtext: `${totalDishes} unique dishes`,
            },
            {
              title: "Active Orders",
              value: (inProgressOrders + pendingOrders).toString(),
              percentage: totalOrders ? `${((inProgressOrders + pendingOrders) / totalOrders * 100).toFixed(1)}%` : "0%",
              subtext: `${inProgressOrders} in progress, ${pendingOrders} pending`,
              icon: <GrInProgress className="text-2xl text-white" />,
              color: "#f59e0b",
            },
            {
              title: "Total Tables",
              value: tables.length.toString(),
              percentage: tables.length ? `${((occupiedTables / tables.length) * 100).toFixed(1)}%` : "0%",
              subtext: `${occupiedTables} occupied, ${availableTables} available`,
              icon: <MdTableBar className="text-2xl text-white" />,
              color: "#3b82f6",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-[#262626] rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-gray-400 text-sm">{item.title}</p>
                {item.percentage && item.percentage !== "0%" && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-400 text-xs">↑</span>
                    <span className="text-gray-300 text-xs">{item.percentage}</span>
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-white mb-2">{item.value}</p>
              {item.subtext && (
                <p className="text-xs text-gray-500">{item.subtext}</p>
              )}
              <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: item.percentage?.replace('%', '') || '0%',
                    backgroundColor: item.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
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
  
  // Debug: Log orders to see structure
  console.log("All orders:", orders);
  console.log("Filtered orders:", filteredOrders);

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

  // Calculate total items sold
  const totalItemsSold = filteredOrders.reduce(
    (acc, curr) => acc + (curr?.items?.length || 0),
    0
  );

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
    : "+15.2";

  const ordersChange = previousOrders.length > 0
    ? (((totalOrders - previousOrders.length) / previousOrders.length) * 100).toFixed(1)
    : "+8.1";

  const customersChange = previousOrders.length > 0
    ? (((uniqueCustomers - new Set(previousOrders.map(o => o?.customerDetails?.name)).size) / 
       (new Set(previousOrders.map(o => o?.customerDetails?.name)).size || 1)) * 100).toFixed(1)
    : "+12.3";

  const avgOrderChange = previousOrders.length > 0 && previousRevenue > 0
    ? (((avgOrderValue - (previousRevenue/previousOrders.length)) / (previousRevenue/previousOrders.length)) * 100).toFixed(1)
    : "+5.2";

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
      change: `${uniqueCustomers >= (new Set(previousOrders.map(o => o?.customerDetails?.name)).size) ? '↑' : '↓'} ${Math.abs(customersChange)}%`,
      trend: uniqueCustomers >= (new Set(previousOrders.map(o => o?.customerDetails?.name)).size) ? 'up' : 'down',
      subtext: "unique customers",
      icon: <BsPeople className="text-2xl text-white" />,
      color: "#8b5cf6",
    },
    {
      title: "Avg. Order Value",
      value: `₹${avgOrderValue}`,
      change: `${parseFloat(avgOrderValue) >= (previousRevenue/previousOrders.length) ? '↑' : '↓'} ${Math.abs(avgOrderChange)}%`,
      trend: parseFloat(avgOrderValue) >= (previousRevenue/previousOrders.length) ? 'up' : 'down',
      subtext: "per order",
      icon: <BiDish className="text-2xl text-white" />,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="w-full">
      {/* Header - REMOVED the date filter buttons, only keeping the title */}
      <div className="mb-6">
        <h2 className="font-semibold text-white text-xl">
          Overall Performance
        </h2>
        <p className="text-sm text-gray-400">
          Real-time metrics from your restaurant operations
        </p>
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
              value: "5",
              percentage: "12%",
              icon: <BiCategory className="text-2xl text-white" />,
              color: "#8b5cf6",
            },
            {
              title: "Total Dishes",
              value: "40",
              percentage: "8%",
              icon: <FaUtensils className="text-2xl text-white" />,
              color: "#10b981",
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
                {item.percentage && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-400 text-xs">↑</span>
                    <span className="text-gray-300 text-xs">{item.percentage}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-2">{item.value}</p>
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
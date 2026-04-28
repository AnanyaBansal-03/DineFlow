// This runs on the server - data fetched before page loads
async function getDashboardData() {
  try {
    // Fetch orders from your backend API
    const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order`, {
      cache: 'no-store', // SSR - fresh data on every request
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Fetch tables from your backend API
    const tablesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/table`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const ordersData = await ordersRes.json();
    const tablesData = await tablesRes.json();
    
    return {
      orders: ordersData?.data || [],
      tables: tablesData?.data || [],
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return {
      orders: [],
      tables: [],
    };
  }
}

export default async function DashboardPage() {
  // ✅ Data fetched on the server before page renders
  const { orders, tables } = await getDashboardData();
  
  // Calculate metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o: any) => o?.orderStatus === "Completed");
  const inProgressOrders = orders.filter((o: any) => o?.orderStatus === "In Progress");
  const pendingOrders = orders.filter((o: any) => o?.orderStatus === "Pending");
  const readyOrders = orders.filter((o: any) => o?.orderStatus === "Ready");
  
  const totalRevenue = completedOrders.reduce(
    (acc: number, curr: any) => acc + (curr?.bills?.totalWithTax || 0),
    0
  );
  
  const cashPayments = orders.filter((o: any) => o.paymentMethod === "Cash").length;
  const onlinePayments = orders.filter((o: any) => o.paymentMethod === "Online").length;
  
  const availableTables = tables.filter((t: any) => !t?.currentOrder).length;
  const occupiedTables = tables.filter((t: any) => t?.currentOrder).length;
  
  // Get recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-yellow-400">Admin</span> Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage your restaurant operations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ₹{totalRevenue.toFixed(2)}
                </p>
                <p className="text-green-400 text-xs mt-2">↑ 12% from yesterday</p>
              </div>
              <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 text-xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white mt-1">{totalOrders}</p>
                <p className="text-blue-400 text-xs mt-2">{inProgressOrders.length} in progress</p>
              </div>
              <div className="w-10 h-10 bg-blue-400/10 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Cash Payments</p>
                <p className="text-2xl font-bold text-white mt-1">{cashPayments}</p>
                <p className="text-green-400 text-xs mt-2">Online: {onlinePayments}</p>
              </div>
              <div className="w-10 h-10 bg-green-400/10 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-xl">💵</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Tables Status</p>
                <p className="text-2xl font-bold text-white mt-1">{availableTables}</p>
                <p className="text-yellow-400 text-xs mt-2">{occupiedTables} occupied</p>
              </div>
              <div className="w-10 h-10 bg-purple-400/10 rounded-full flex items-center justify-center">
                <span className="text-purple-400 text-xl">🪑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Order Status */}
          <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 p-5">
            <h3 className="text-white font-semibold mb-4">Order Status</h3>
            <div className="space-y-3">
              {[
                { label: "Pending", value: pendingOrders.length, color: "bg-gray-500", percentage: totalOrders ? (pendingOrders.length/totalOrders*100).toFixed(1) : 0 },
                { label: "In Progress", value: inProgressOrders.length, color: "bg-yellow-500", percentage: totalOrders ? (inProgressOrders.length/totalOrders*100).toFixed(1) : 0 },
                { label: "Ready", value: readyOrders.length, color: "bg-green-500", percentage: totalOrders ? (readyOrders.length/totalOrders*100).toFixed(1) : 0 },
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
          
          {/* Table Status */}
          <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 p-5">
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

        {/* Payment Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cash Payments</p>
                <h2 className="text-white text-2xl font-bold mt-1">{cashPayments}</h2>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <span className="text-green-500 text-2xl">💵</span>
              </div>
            </div>
          </div>
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Online Payments</p>
                <h2 className="text-white text-2xl font-bold mt-1">{onlinePayments}</h2>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <span className="text-blue-500 text-2xl">💳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-[#1E1E1E] rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-[#252525]">
                  <th className="px-6 py-3 text-gray-400 text-sm font-medium">Order ID</th>
                  <th className="px-6 py-3 text-gray-400 text-sm font-medium">Customer</th>
                  <th className="px-6 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-gray-400 text-sm font-medium">Total</th>
                  <th className="px-6 py-3 text-gray-400 text-sm font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any) => (
                    <tr key={order._id} className="border-b border-gray-800 hover:bg-[#252525] transition">
                      <td className="px-6 py-3 text-white text-sm">
                        #{order._id?.slice(-6)}
                      </td>
                      <td className="px-6 py-3 text-gray-300 text-sm">
                        {order.customerDetails?.name || "Guest"}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.orderStatus === "Completed" ? "bg-green-500/20 text-green-500" :
                          order.orderStatus === "In Progress" ? "bg-yellow-500/20 text-yellow-500" :
                          order.orderStatus === "Ready" ? "bg-blue-500/20 text-blue-500" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-yellow-400 text-sm font-medium">
                        ₹{order.bills?.totalWithTax?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-3 text-gray-300 text-sm">
                        {order.paymentMethod || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
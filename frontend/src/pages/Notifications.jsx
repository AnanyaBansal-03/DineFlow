import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { FaBell, FaTimes, FaTrash, FaCheckDouble } from "react-icons/fa";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, clearAll, deleteNotification } = useNotification();

  useEffect(() => {
    document.title = "DineFlow | Notifications";
  }, []);

  const getIcon = (icon) => {
    return icon || '📢';
  };

  const getTimeAgo = (timestamp) => {
    const mins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/orders/${notification.orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold text-white">
            <span className="text-yellow-400">Notifications</span>
          </h1>
        </div>
      </div>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <div className="flex justify-end gap-3 px-4 py-3 border-b border-gray-800">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-gray-400 hover:text-yellow-400 text-sm transition"
          >
            <FaCheckDouble size={14} /> Mark all read
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm transition"
          >
            <FaTrash size={14} /> Clear all
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="px-4 py-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FaBell size={48} className="mb-4 opacity-30" />
            <p className="text-lg">No notifications</p>
            <p className="text-sm mt-1">When you receive notifications, they will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-[#1E1E1E] rounded-xl p-4 border transition cursor-pointer ${
                  !notification.read 
                    ? 'border-yellow-400/30 bg-yellow-400/5' 
                    : 'border-gray-800'
                }`}
              >
                <div className="flex gap-3">
                  <div className="text-3xl">{getIcon(notification.icon)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-400'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-600 hover:text-red-400 transition"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{notification.message}</p>
                    {!notification.read && (
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
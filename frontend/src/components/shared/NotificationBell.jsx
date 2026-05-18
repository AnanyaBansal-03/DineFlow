import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTimes, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, deleteNotification } = useNotification();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/orders/${notification.orderId}`);
    }
    setIsOpen(false);
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-[#262626] hover:bg-[#2f2f2f] rounded-full p-2 transition"
      >
        <FaBell className={`text-gray-300 text-lg transition ${isOpen ? 'text-yellow-400' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-[#1E1E1E] rounded-xl border border-gray-700 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-gray-400 hover:text-yellow-400 text-xs flex items-center gap-1 transition"
                    >
                      <FaCheckDouble size={12} /> Mark all read
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1 transition"
                    >
                      <FaTrash size={12} /> Clear all
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <FaBell size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-gray-800 hover:bg-[#262626] transition cursor-pointer ${
                      !notification.read ? 'bg-yellow-400/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl">{getIcon(notification.icon)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white text-sm font-medium">{notification.title}</p>
                          <span className="text-gray-500 text-[10px]">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">{notification.message}</p>
                      </div>
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
                    {!notification.read && (
                      <div className="mt-1">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-800 text-center">
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-gray-500 text-xs hover:text-yellow-400 transition"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
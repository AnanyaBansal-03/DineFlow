import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { enqueueSnackbar } from 'notistack';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on start
  useEffect(() => {
    const saved = localStorage.getItem('dineflow_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dineflow_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Socket.io listeners for real-time notifications
  useEffect(() => {
    if (!socket) {
      console.log('Socket not connected yet');
      return;
    }

    console.log('Setting up notification listeners...');

    const handleNewOrder = (order) => {
      console.log('🔔 New order notification received:', order);
      
      const notification = {
        id: Date.now() + Math.random(),
        type: 'new_order',
        title: 'New Order Received',
        message: `Order #${order._id?.slice(-6)} from ${order.customerDetails?.name || 'Customer'} at Table ${order.table?.tableNo}`,
        orderId: order._id,
        timestamp: new Date().toISOString(),
        read: false,
        icon: '🆕'
      };
      
      addNotification(notification);
      
      // Show toast popup
      enqueueSnackbar(notification.message, { 
        variant: 'info',
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    };

    const handleOrderUpdated = (order) => {
      console.log('📢 Order update notification received:', order);
      
      // Different message based on status change
      let message = '';
      let title = '';
      let icon = '📢';
      
      if (order.orderStatus === 'Ready') {
        title = 'Order Ready';
        message = `Order #${order._id?.slice(-6)} is ready to serve!`;
        icon = '✅';
      } else if (order.orderStatus === 'In Progress') {
        title = 'Order Started';
        message = `Order #${order._id?.slice(-6)} is now being prepared`;
        icon = '👨‍🍳';
      } else if (order.orderStatus === 'Completed') {
        title = 'Order Completed';
        message = `Order #${order._id?.slice(-6)} has been completed`;
        icon = '🎉';
      } else {
        return; // Don't notify for other status changes
      }
      
      const notification = {
        id: Date.now() + Math.random(),
        type: 'order_updated',
        title,
        message,
        orderId: order._id,
        timestamp: new Date().toISOString(),
        read: false,
        icon
      };
      
      addNotification(notification);
      
      enqueueSnackbar(message, { 
        variant: order.orderStatus === 'Ready' ? 'success' : 'info',
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    };

    const handleOrderCompleted = (order) => {
      console.log('🎉 Order completed notification received:', order);
      
      const notification = {
        id: Date.now() + Math.random(),
        type: 'order_completed',
        title: 'Order Completed',
        message: `Order #${order._id?.slice(-6)} has been completed and paid`,
        orderId: order._id,
        timestamp: new Date().toISOString(),
        read: false,
        icon: '🎉'
      };
      
      addNotification(notification);
      
      enqueueSnackbar(notification.message, { 
        variant: 'success',
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    };

    // Register event listeners
    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdated);
    socket.on('order_completed', handleOrderCompleted);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated', handleOrderUpdated);
      socket.off('order_completed', handleOrderCompleted);
    };
  }, [socket]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearAll,
      deleteNotification,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
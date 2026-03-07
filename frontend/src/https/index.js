import { axiosWrapper } from "./axiosWrapper";

// =======================
// AUTH
// =======================
export const login = (data) =>
  axiosWrapper.post("/api/user/login", data);

export const register = (data) =>
  axiosWrapper.post("/api/user/register", data);

export const getUserData = () =>
  axiosWrapper.get("/api/user");

export const logout = () =>
  axiosWrapper.post("/api/user/logout");

// =======================
// TABLES
// =======================
export const addTable = (data) =>
  axiosWrapper.post("/api/table/", data);

export const getTables = () =>
  axiosWrapper.get("/api/table");

export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

// =======================
// ORDERS
// =======================
export const addOrder = (data) =>
  axiosWrapper.post("/api/order/", data);

export const getOrders = () =>
  axiosWrapper.get("/api/order");

export const getOrderById = (id) =>
  axiosWrapper.get(`/api/order/${id}`);

export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });

// 🔥 ADD ITEM (Increase if exists)
export const addItemToOrder = (orderId, item) =>
  axiosWrapper.post(`/api/order/${orderId}/add-item`, { item });

// 🔥 DECREASE ITEM QUANTITY (NEW)
export const decreaseItemFromOrder = (orderId, itemName) =>
  axiosWrapper.put(`/api/order/${orderId}/decrease-item`, {
    itemName,
  });

// =======================
// MENU
// =======================
export const getMenu = () =>
  axiosWrapper.get("/api/menu");

// =======================
// PAYMENTS
// =======================
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);

export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment/verify-payment", data);
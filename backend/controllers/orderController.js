const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const mongoose = require("mongoose");

/* ================= HELPER: RECALCULATE BILL ================= */

const recalculateBill = (order) => {
  const subtotal = order.items.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );

  const tax = subtotal * 0.05;

  order.bills = {
    total: subtotal,
    tax,
    totalWithTax: subtotal + tax,
  };
};

/* ================= ADD ORDER ================= */

const addOrder = async (req, res, next) => {
  try {
    const { tableId, customerDetails, orderStatus, items } = req.body;

    if (!tableId) {
      return next(createHttpError(400, "Table ID is required"));
    }

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return next(createHttpError(400, "Invalid Table ID"));
    }

    const table = await Table.findById(tableId);

    if (!table) {
      return next(createHttpError(404, "Table not found"));
    }

    if (table.currentOrder) {
      return next(createHttpError(400, "Table already booked"));
    }

    const order = new Order({
      customerDetails,
      orderStatus,
      items: items || [],
      table: tableId,
    });

    recalculateBill(order);

    await order.save();

    table.currentOrder = order._id;
    await table.save();

    res.status(201).json({
      success: true,
      message: "Order created & table booked successfully!",
      data: order,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= GET ORDER BY ID ================= */

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid ID"));
    }

    const order = await Order.findById(id).populate("table");

    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= GET ALL ORDERS ================= */

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "table",
        select: "tableNo",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= ADD ITEM TO ORDER ================= */

const addItemToOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { item } = req.body;

    if (!item || !item.name || !item.price) {
      return next(createHttpError(400, "Invalid item data"));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }

    const normalizedName = item.name.trim().toLowerCase();

    const existingItem = order.items.find(
      (i) => i.name.trim().toLowerCase() === normalizedName
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      order.items.push({
        name: item.name.trim(),
        price: item.price,
        quantity: 1,
      });
    }

    recalculateBill(order);

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= DECREASE ITEM ================= */

const decreaseItemQuantity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemName } = req.body;

    if (!itemName) {
      return next(createHttpError(400, "Item name required"));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }

    const normalizedName = itemName.trim().toLowerCase();

    const existingItem = order.items.find(
      (i) => i.name.trim().toLowerCase() === normalizedName
    );

    if (!existingItem) {
      return next(createHttpError(404, "Item not found in order"));
    }

    existingItem.quantity -= 1;

    if (existingItem.quantity <= 0) {
      order.items = order.items.filter(
        (i) => i.name.trim().toLowerCase() !== normalizedName
      );
    }

    recalculateBill(order);

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE ORDER STATUS ================= */

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid ID"));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }

    order.orderStatus = orderStatus;
    await order.save();

    if (orderStatus === "Completed") {
      await Table.findByIdAndUpdate(order.table, {
        currentOrder: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= DELETE ORDER ================= */

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid ID"));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }

    await Table.findByIdAndUpdate(order.table, {
      currentOrder: null,
    });

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted & table released",
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
  addItemToOrder,
  decreaseItemQuantity,
};
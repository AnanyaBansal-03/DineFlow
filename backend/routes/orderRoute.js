const express = require("express");

const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  addItemToOrder,
  decreaseItemQuantity,
  updatePaymentMethod, // Add this
} = require("../controllers/orderController");

const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

// ============================
// Base Routes
// ============================

router
  .route("/")
  .post(isVerifiedUser, addOrder)
  .get(isVerifiedUser, getOrders);

router
  .route("/:id")
  .get(isVerifiedUser, getOrderById)
  .put(isVerifiedUser, updateOrder)
  .delete(isVerifiedUser, deleteOrder);

// ============================
// Item Management Routes
// ============================

// Add item (increase if exists)
router.post("/:id/add-item", isVerifiedUser, addItemToOrder);

// Decrease item quantity
router.put("/:id/decrease-item", isVerifiedUser, decreaseItemQuantity);

// ============================
// 💳 PAYMENT ROUTE (Simplified)
// ============================

// Update payment method
router.put("/:id/payment-method", isVerifiedUser, updatePaymentMethod);

module.exports = router;
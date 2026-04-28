const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      guests: { type: Number, required: true },
    },

    orderStatus: {
      type: String,
      required: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    bills: {
      total: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      totalWithTax: { type: Number, default: 0 },
    },

    items: [orderItemSchema],

    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },

    // ✅ FIXED
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },

    // ✅ NEW FIELD
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    paymentData: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
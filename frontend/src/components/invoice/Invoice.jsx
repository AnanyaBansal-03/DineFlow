import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaPrint, FaTimes } from "react-icons/fa";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);

  // Log when invoice mounts and unmounts
  useEffect(() => {
    console.log("✅ Invoice mounted and should be visible");
    console.log("Order info:", orderInfo);
    
    return () => {
      console.log("❌ Invoice unmounted - this is why it's disappearing!");
    };
  }, [orderInfo]);

  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt-container { width: 300px; margin: 0 auto; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  const handleClose = () => {
    console.log("User clicked Close button");
    setShowInvoice(false);
  };

  if (!orderInfo) {
    console.log("No orderInfo, not rendering invoice");
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[450px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">Payment Successful!</h2>
            <p className="text-green-200 text-sm">Order Confirmed</p>
          </div>
          <button
            onClick={handleClose}
            className="text-green-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div ref={invoiceRef} className="p-5 overflow-y-auto flex-1">

          {/* Header Animation */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-14 h-14 border-4 border-green-500 rounded-full flex items-center justify-center bg-green-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <FaCheck className="text-white text-2xl" />
              </motion.span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-center text-gray-800 mb-1">
            Order Receipt
          </h2>
          <p className="text-gray-500 text-center text-sm mb-4">
            Thank you for your order!
          </p>

          <div className="border-t border-gray-200 my-3"></div>

          {/* Order Details */}
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="font-semibold">Order ID:</span>
              <span>#{orderInfo?._id?.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Customer Name:</span>
              <span>{orderInfo.customerDetails?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Phone:</span>
              <span>{orderInfo.customerDetails?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Guests:</span>
              <span>{orderInfo.customerDetails?.guests}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Table:</span>
              <span>{orderInfo.table?.tableNo}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Items Ordered
            </h3>
            <div className="space-y-2">
              {orderInfo.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          {/* Bill Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>₹{orderInfo.bills?.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (5%):</span>
              <span>₹{orderInfo.bills?.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Grand Total:</span>
              <span className="text-green-600">₹{orderInfo.bills?.totalWithTax?.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          {/* Payment */}
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Payment Method:</span>
              <span className={`font-medium ${
                orderInfo.paymentMethod === "Online" ? "text-blue-600" : "text-green-600"
              }`}>
                {orderInfo.paymentMethod}
              </span>
            </div>
          </div>

          <div className="text-center mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Thank you for dining with us!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Have a great day! 😊
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-3 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <FaPrint size={14} />
            Print Receipt
          </button>

          <button
            onClick={handleClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-black px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <FaTimes size={14} />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
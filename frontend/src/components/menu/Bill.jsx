import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import { addOrder } from "../../https";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import axios from "axios";
import FakePaymentModal from "../payment/FakePaymentModal";

const Bill = ({ order }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Check if order is already completed
  const isOrderCompleted = order?.orderStatus === "Completed" || paymentCompleted;

  const handlePaymentSuccess = async (orderId) => {
    if (isProcessing || !isMounted.current) return;
    setIsProcessing(true);
    
    try {
      await axios.put(
        `https://dineflow-e802.onrender.com/api/order/${orderId}`,
        {
          orderStatus: "Completed",
          paymentStatus: "Paid",
          paymentMethod: "Online"
        },
        { withCredentials: true }
      );

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });

      enqueueSnackbar("Payment Successful!", { variant: "success" });

      if (isMounted.current) {
        setShowPaymentModal(false);
        setPaymentCompleted(true);
        setShowInvoice(true);
        setIsProcessing(false);
      }

    } catch (error) {
      console.error(error);
      enqueueSnackbar("Payment Failed!", { variant: "error" });
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  };

  const orderMutation = useMutation({
    mutationFn: addOrder,
    onSuccess: async (resData) => {
      const { data } = resData.data;
      
      if (isMounted.current) {
        setOrderInfo(data);
      }

      dispatch(removeCustomer());
      dispatch(removeAllItems());
      queryClient.invalidateQueries({ queryKey: ["tables"] });

      if (paymentMethod === "Online") {
        if (isMounted.current) setShowPaymentModal(true);
      } else {
        try {
          await axios.put(
            `https://dineflow-e802.onrender.com/api/order/${data._id}`,
            {
              orderStatus: "Completed",
              paymentStatus: "Paid",
              paymentMethod: "Cash"
            },
            { withCredentials: true }
          );

          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["order", data._id] });

          enqueueSnackbar("Payment Done (Cash)", { variant: "success" });
          
          if (isMounted.current) {
            setPaymentCompleted(true);
            setShowInvoice(true);
          }
          
        } catch (error) {
          console.error("Cash payment update failed:", error);
          enqueueSnackbar("Payment failed!", { variant: "error" });
        }
      }
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.message || "Order failed!", {
        variant: "error",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      enqueueSnackbar("Select payment method!", { variant: "warning" });
      return;
    }

    // EXISTING ORDER
    if (order) {
      if (isMounted.current) {
        setOrderInfo(order);
      }

      if (paymentMethod === "Online") {
        if (isMounted.current) setShowPaymentModal(true);
      } else {
        axios.put(
          `https://dineflow-e802.onrender.com/api/order/${order._id}`,
          {
            orderStatus: "Completed",
            paymentStatus: "Paid",
            paymentMethod: "Cash"
          },
          { withCredentials: true }
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["order", order._id] });
        });

        enqueueSnackbar("Payment Done (Cash)", { variant: "success" });
        
        if (isMounted.current) {
          setPaymentCompleted(true);
          setShowInvoice(true);
        }
      }
      return;
    }

    // NEW ORDER
    if (cartData.length === 0) {
      enqueueSnackbar("Add items first!", { variant: "warning" });
      return;
    }

    const orderData = {
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },
      orderStatus: "In Progress",
      bills: { total, tax, totalWithTax: totalPriceWithTax },
      items: cartData,
      tableId: customerData.table?.tableId,
      paymentMethod,
    };

    orderMutation.mutate(orderData);
  };

  return (
    <div className="space-y-4">
      {/* Payment Modal */}
      {showPaymentModal && orderInfo && (
        <FakePaymentModal
          amount={(order?.bills?.totalWithTax || totalPriceWithTax).toFixed(2)}
          onClose={() => {
            setShowPaymentModal(false);
          }}
          onSuccess={() => {
            handlePaymentSuccess(orderInfo._id);
          }}
        />
      )}

      {/* Invoice Modal */}
      {showInvoice && orderInfo && (
        <Invoice
          orderInfo={orderInfo}
          setShowInvoice={setShowInvoice}
        />
      )}

      {/* Show "Payment Completed" message instead of payment buttons */}
      {isOrderCompleted ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
          <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-400 font-semibold">Payment Completed</p>
          <p className="text-gray-400 text-sm mt-1">Thank you for your order!</p>
        </div>
      ) : (
        <>
          <h3 className="text-white font-semibold text-lg">Bill Details</h3>

          <div className="flex justify-between text-sm text-gray-400">
            <span>Total</span>
            <span className="text-yellow-400 font-bold">
              ₹{(order?.bills?.totalWithTax || totalPriceWithTax).toFixed(2)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setPaymentMethod("Cash")}
              className={`flex-1 p-3 rounded-lg font-medium transition ${
                paymentMethod === "Cash"
                  ? "bg-yellow-400 text-black"
                  : "bg-[#262626] text-gray-400 hover:bg-[#2f2f2f] border border-gray-700"
              }`}
            >
              Cash
            </button>
            <button
              onClick={() => setPaymentMethod("Online")}
              className={`flex-1 p-3 rounded-lg font-medium transition ${
                paymentMethod === "Online"
                  ? "bg-yellow-400 text-black"
                  : "bg-[#262626] text-gray-400 hover:bg-[#2f2f2f] border border-gray-700"
              }`}
            >
              Online
            </button>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
        </>
      )}

      {/* Bill Summary - Always show */}
      <div className="border-t border-gray-700 pt-3 mt-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Subtotal</span>
          <span>₹{(order?.bills?.total || total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>Tax (5%)</span>
          <span>₹{(order?.bills?.tax || tax).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-white font-bold text-base mt-2 pt-2 border-t border-gray-700">
          <span>Total</span>
          <span className="text-yellow-400">₹{(order?.bills?.totalWithTax || totalPriceWithTax).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Bill;